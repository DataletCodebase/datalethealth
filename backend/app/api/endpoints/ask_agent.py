from typing import Optional, List, Union
from datetime import datetime, date
import unicodedata
import re
import json
import os

from fastapi import APIRouter, Depends, HTTPException, Header, Request, UploadFile, File, Form
from pydantic import BaseModel
from jose import jwt
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from backend.app.services.intelligence_engine import (
    get_last_7_days_memory,
    detect_risk_patterns,
    apply_intelligence_rules
)

from backend.app.models.chat_memory_model import ChatMemory
from backend.app.db.session import get_session
from backend.app.models.patient_model import Patient
from backend.app.models.lab_report_model import LabReport
from backend.app.models.water_intake_model import WaterIntakeLog
from backend.app.services.usda_connector import get_usda_nutrition


router = APIRouter(prefix="/ask", tags=["AI Agent"])

DAILY_WATER_LIMIT = 1500

_openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ============================================================
# MODELS
# ============================================================

class AskRequest(BaseModel):
    patient_id: Union[int, str]
    question: str
    language: Optional[str] = "en"
    condition_context: Optional[List[str]] = None


class AskResponse(BaseModel):
    patient_id: int
    question: str
    nutrition_summary: str
    clinical_classification: str
    clinical_reasoning: Optional[str] = None
    ai_raw: Optional[str] = None
    ai_source: Optional[str] = None
    water_context: Optional[str] = None


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def sanitize_text(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"[^\x09\x0A\x0D\x20-\x7E\u0080-\uFFFF]+", "", s)
    return s.strip()


def extract_water_volume(text: str) -> Optional[float]:
    m = re.search(r"(\d+(?:\.\d+)?)\s*ml", (text or "").lower())
    return float(m.group(1)) if m else None


def calculate_age(dob: Optional[date]) -> Optional[int]:
    if not dob:
        return None
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age if age >= 0 else None


def calculate_bmi(weight_kg: float, height_cm: float) -> Optional[float]:
    """Calculate BMI from weight (kg) and height (cm)."""
    if not weight_kg or not height_cm or height_cm < 50 or weight_kg < 5:
        return None
    height_m = height_cm / 100.0
    return round(weight_kg / (height_m ** 2), 1)


def classify_bmi(bmi: Optional[float], age: Optional[int] = None) -> tuple:
    """Return (status_label, clinical_advice_string) factoring in both BMI and age."""

    # Age-specific context suffix
    if age is None:
        age_note = ""
    elif age < 18:
        age_note = f" At age {age} (adolescent), growth nutrition is critical — avoid extreme restriction."
    elif age < 30:
        age_note = f" At age {age} (young adult), metabolism is relatively fast — consistent diet and activity are key."
    elif age < 50:
        age_note = f" At age {age}, focus on sustainable habits — crash diets are counterproductive."
    elif age < 65:
        age_note = f" At age {age}, hormonal shifts affect metabolism — prioritize protein and resistance activity."
    else:
        age_note = f" At age {age} (senior), preserve muscle mass — avoid aggressive calorie restriction; protein intake is essential."

    if bmi is None:
        return (
            "unknown",
            f"No height/weight data on file — giving general advice.{age_note}"
        )
    if bmi < 18.5:
        return (
            "underweight",
            f"BMI {bmi} — UNDERWEIGHT. Prioritize calorie-dense, nutrient-rich foods to gain healthy weight. "
            f"Increase healthy fats (nuts, avocado), complex carbs, and lean proteins.{age_note}"
        )
    elif bmi < 25.0:
        return (
            "normal",
            f"BMI {bmi} — HEALTHY WEIGHT. Maintain a balanced, varied diet. "
            f"No need for calorie restriction — focus on quality nutrition.{age_note}"
        )
    elif bmi < 30.0:
        return (
            "overweight",
            f"BMI {bmi} — OVERWEIGHT. Be mindful of portion sizes. "
            f"Reduce processed foods, sugars, and excess fat. Aim for gradual weight reduction of 0.5kg/week.{age_note}"
        )
    else:
        return (
            "obese",
            f"BMI {bmi} — OBESE. Weight reduction is a clinical priority. "
            f"Avoid high-calorie foods, reduce portion sizes significantly, "
            f"and consider a supervised low-calorie diet (1200–1500 kcal/day). "
            f"Regular light exercise (walking 30 min/day) is strongly recommended.{age_note}"
        )


def build_lab_flags(labs: dict) -> str:
    """Convert raw lab values to clinical flag strings."""
    if not labs:
        return "No lab reports on file — giving general advice."

    flags = []

    creatinine = float(labs.get("creatinine") or 0)
    if creatinine > 1.3:
        flags.append(f"HIGH CREATININE ({creatinine} mg/dL) → Kidney stress: limit high-protein foods, avoid excess meat/dairy")

    potassium = float(labs.get("potassium") or 0)
    if potassium > 5.1:
        flags.append(f"HIGH POTASSIUM ({potassium} mmol/L) → Avoid bananas, oranges, potatoes, tomatoes, nuts")
    elif 0 < potassium < 3.5:
        flags.append(f"LOW POTASSIUM ({potassium} mmol/L) → Include potassium-rich foods: spinach, sweet potato, beans")

    sodium = float(labs.get("sodium") or 0)
    if 0 < sodium < 135:
        flags.append(f"LOW SODIUM ({sodium} mmol/L) → May need slightly more sodium; check with doctor")
    elif sodium > 145:
        flags.append(f"HIGH SODIUM ({sodium} mmol/L) → Restrict salty foods")

    urea = float(labs.get("urea") or 0)
    if urea > 20:
        flags.append(f"HIGH UREA ({urea} mg/dL) → Restrict protein intake; avoid excess meat/fish/eggs")

    chol_total = float(labs.get("cholesterol_total") or 0)
    if chol_total > 200:
        flags.append(f"HIGH CHOLESTEROL ({chol_total} mg/dL) → Avoid fried foods, red meat, full-fat dairy, coconut oil")

    ldl = float(labs.get("cholesterol_ldl") or 0)
    if ldl > 100:
        flags.append(f"HIGH LDL ({ldl} mg/dL) → Reduce saturated fats; increase fiber (oats, beans, vegetables)")

    hba1c = float(labs.get("hba1c") or 0)
    if hba1c > 5.7:
        level = "Pre-diabetic" if hba1c < 6.5 else "Diabetic range"
        flags.append(f"HIGH HbA1c ({hba1c}% — {level}) → Strictly limit sugars, white rice, bread, sweets")

    glucose = float(labs.get("fasting_glucose") or 0)
    if glucose > 100:
        flags.append(f"HIGH FASTING GLUCOSE ({glucose} mg/dL) → Avoid sugary drinks, desserts, refined carbs")

    bp_sys = float(labs.get("blood_pressure_systolic") or 0)
    bp_dia = float(labs.get("blood_pressure_diastolic") or 0)
    if bp_sys > 130 or bp_dia > 80:
        flags.append(f"HIGH BLOOD PRESSURE ({int(bp_sys)}/{int(bp_dia)} mmHg) → Restrict sodium to <2g/day; avoid pickles, chips, processed foods")

    if not flags:
        return "Lab values are within acceptable ranges — no specific dietary restrictions from labs."

    return "\n".join(f"• {f}" for f in flags)


async def get_today_water_total(session: AsyncSession, patient_id: int) -> float:
    today = datetime.utcnow().date()
    q = select(WaterIntakeLog).where(WaterIntakeLog.patient_id == patient_id)
    res = await session.execute(q)
    logs = res.scalars().all()
    return sum(log.volume_ml for log in logs if log.timestamp.date() == today)


# ============================================================
# MAIN ENDPOINT
# ============================================================

@router.post("/", response_model=AskResponse)
async def ask_agent(
    payload: AskRequest,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    print(f"DEBUG: asking agent with payload: patient_id={payload.patient_id} question='{payload.question}' language='{payload.language}' condition_context={payload.condition_context}")

    # --- Resolve patient_id ---
    if isinstance(payload.patient_id, str):
        if payload.patient_id.isdigit():
            payload.patient_id = int(payload.patient_id)
        else:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=400, detail="Invalid patient_id. Please log in again.")
            token = auth_header.split(" ")[1]
            try:
                SECRET_KEY = os.getenv("JWT_SECRET", "temporary_secret_key")
                decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                user_id = decoded.get("id")
                if not user_id:
                    raise ValueError("No 'id' in token")
                print(f"Resolved '{payload.patient_id}' to user_id: {user_id}")
                payload.patient_id = int(user_id)
            except Exception as e:
                print(f"Failed to decode token: {e}")
                raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

    if isinstance(payload.patient_id, int) and payload.patient_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid patient ID. Please refresh and try again.")

    # --- Load Patient ---
    q = select(Patient).where(Patient.id == payload.patient_id)
    patient = (await session.execute(q)).scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # --- Load Labs (optional) ---
    lq = select(LabReport).where(LabReport.user_id == payload.patient_id)
    lab = (await session.execute(lq)).scalars().first()
    labs = lab.dict() if lab else {}

    # --- Patient info ---
    age = calculate_age(patient.dob)

    # --- BMI & weight classification ---
    weight = int(patient.weight or 0)
    height = int(patient.height or 0)
    bmi = calculate_bmi(weight, height)
    bmi_status, bmi_advice = classify_bmi(bmi, age)

    # --- Lab flags ---
    lab_flags = build_lab_flags(labs)

    # --- Patient info strings ---
    age_str = f"{age} years" if age else "age not on file"
    weight_str = f"{weight} kg" if weight else "not recorded"
    height_str = f"{height} cm" if height else "not recorded"
    bmi_str = str(bmi) if bmi else "cannot calculate (no height/weight)"
    conditions_str = ", ".join(payload.condition_context) if payload.condition_context else "none selected"
    disease_str = patient.disease or "none reported"

    # ================================================================
    # WATER HANDLING (fast path — no GPT needed)
    # ================================================================
    if "water" in (payload.question or "").lower():
        vol = extract_water_volume(payload.question)
        water_context = None
        final_class = "SAFE"
        final_reason = "No major red flags detected."

        if vol:
            today_total = await get_today_water_total(session, payload.patient_id)
            remaining = DAILY_WATER_LIMIT - today_total

            if vol > remaining:
                water_context = f"Daily limit exceeded. Remaining allowed today: {remaining:.0f} ml"
                final_class = "LIMIT"
                final_reason = "Daily water limit exceeded."
                nutrition_summary = (
                    f"⚠️ You've requested {vol:.0f} ml of water, but your remaining daily allowance is only "
                    f"{remaining:.0f} ml (daily limit: {DAILY_WATER_LIMIT} ml).\n\n"
                    f"For a patient with your profile (weight: {weight_str}, {bmi_advice}), "
                    f"adequate hydration is important — but staying within prescribed limits is equally critical."
                )
            else:
                new_log = WaterIntakeLog(patient_id=payload.patient_id, volume_ml=vol)
                session.add(new_log)
                await session.commit()
                today_total += vol
                remaining = DAILY_WATER_LIMIT - today_total
                water_context = f"You drank {vol:.0f} ml today. Remaining: {remaining:.0f} ml"
                nutrition_summary = (
                    f"Water intake of {vol:.0f} ml logged. "
                    f"Today's total: {today_total:.0f} ml | Remaining: {remaining:.0f} ml of {DAILY_WATER_LIMIT} ml limit.\n\n"
                    f"Plain water has 0 calories, 0 sodium — safe for all conditions."
                )
        else:
            nutrition_summary = "Water is essential for health. Aim for 1.5–2L per day depending on your condition."
            water_context = None

        memory = ChatMemory(
            patient_id=payload.patient_id,
            question=payload.question,
            ai_reply=nutrition_summary,
            classification=final_class,
            reasoning=final_reason,
            condition_context=",".join(payload.condition_context) if payload.condition_context else None,
            ai_source="internal",
            water_context=water_context
        )
        session.add(memory)
        await session.commit()

        return AskResponse(
            patient_id=payload.patient_id,
            question=payload.question,
            nutrition_summary=nutrition_summary,
            clinical_classification=final_class,
            clinical_reasoning=final_reason,
            ai_raw=None,
            ai_source="internal",
            water_context=water_context,
        )

    # ================================================================
    # FOOD / NUTRITION HANDLING — smart GPT-4o path
    # ================================================================

    # Optional USDA lookup for factual nutritional data
    usda_context = ""
    try:
        usda_result = await get_usda_nutrition(payload.question)
        if usda_result and usda_result.get("description"):
            food_name = usda_result.get("description", "")
            protein_per_100 = usda_result.get("protein", "?")
            calories_per_100 = usda_result.get("calories", "?")
            # Try to extract user quantity from question
            q_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|gm|g|ml|piece|pcs|nos)", payload.question.lower())
            if q_match:
                qty = float(q_match.group(1))
                unit = q_match.group(0).replace(str(q_match.group(1)), "").strip()
                usda_context = (
                    f"USDA Reference: {food_name} | "
                    f"Protein: {protein_per_100}g/100g | "
                    f"Calories: {calories_per_100}/100g | "
                    f"Requested quantity: {qty} {unit}"
                )
            else:
                usda_context = (
                    f"USDA Reference: {food_name} | "
                    f"Protein: {protein_per_100}g/100g | "
                    f"Calories: {calories_per_100}/100g"
                )
    except Exception as e:
        print(f"USDA lookup failed: {e}")
        usda_context = ""

    # Build the comprehensive clinical prompt
    system_prompt = (
        "You are a certified clinical dietitian and medical nutrition therapist. "
        "Your role is to provide personalized, evidence-based nutritional advice. "
        "Be direct, warm, and professional. "
        "Always factor in the patient's BMI, weight status, and lab values. "
        "Do NOT use numbers for sections. ONLY use EXACTLY these section headers:\\n"
        "Nutritional Breakdown\\n"
        "⚠️ Health Warnings\\n"
        "✅ Recommendation\\n"
        "Long-term Tip\\n"
        "Give specific portion sizes — don't be vague. "
        "If the patient is obese, always flag that the requested quantity may be too much and suggest a healthier portion."
    )

    user_prompt = f"""Patient Health Profile:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: {patient.full_name}
• Age: {age_str} | Gender: {patient.gender or 'NA'} | Blood Group: {patient.blood_group or 'NA'}
• Weight: {weight_str} | Height: {height_str}
• BMI: {bmi_str} → Weight Status: {bmi_status.upper()}
• {bmi_advice}
• Medical Condition: {disease_str}
• Selected Condition Focus: {conditions_str}

Lab Report Flags:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{lab_flags}

{f"Nutritional Data (USDA): {usda_context}" if usda_context else "No USDA data matched — use general nutritional knowledge."}

Patient Question: "{payload.question}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Format your response EXACTLY like the following template. Start directly with their first name for the direct answer. DO NOT add any extra introductory text, and DO NOT use markdown headers (like ## or **) for the section titles.

{patient.full_name.split()[0] if patient.full_name else 'Patient'}, [Direct conversational answer here, e.g., while you can technically have X...]
Nutritional Breakdown
For [Portion Size]:
- Calories: [Amount]
- Protein: [Amount]
- Key Nutrients:
  - Carbohydrates: [Amount]
  - Fats: [Amount]
⚠️ Health Warnings
[Your advice based on their labs, etc.]
✅ Recommendation
[Your recommended portion and prep method]
Long-term Tip
[One practical dietary habit]
"""

    # Call GPT-4o-mini
    try:
        gpt_response = await _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4,
            max_tokens=700
        )
        nutrition_summary = gpt_response.choices[0].message.content.strip()
        ai_source = "gpt-4o-mini"
    except Exception as e:
        print(f"GPT call failed: {e}")
        nutrition_summary = (
            f"Unable to get AI response at this time. "
            f"Based on your profile (Weight: {weight_str}, BMI Status: {bmi_status}): "
            f"Consult your dietitian for advice on '{payload.question}'."
        )
        ai_source = "fallback"

    nutrition_summary = sanitize_text(nutrition_summary)

    # --- Intelligence layer ---
    final_class = "SAFE"
    final_reason = "No major red flags detected."
    try:
        memories = await get_last_7_days_memory(session, payload.patient_id)
        patterns = detect_risk_patterns(memories)
        intel_decision, intel_reason = apply_intelligence_rules(patterns)
        if intel_decision:
            final_class = intel_decision
            final_reason = intel_reason
    except Exception as e:
        print(f"Intelligence layer failed: {e}")

    # --- Save memory ---
    try:
        memory = ChatMemory(
            patient_id=payload.patient_id,
            question=payload.question,
            ai_reply=nutrition_summary,
            classification=final_class,
            reasoning=final_reason,
            condition_context=",".join(payload.condition_context) if payload.condition_context else None,
            ai_source=ai_source,
            water_context=None
        )
        session.add(memory)
        await session.commit()
    except Exception as e:
        print(f"Memory save failed: {e}")

    return AskResponse(
        patient_id=payload.patient_id,
        question=payload.question,
        nutrition_summary=nutrition_summary,
        clinical_classification=final_class,
        clinical_reasoning=final_reason,
        ai_raw=usda_context or None,
        ai_source=ai_source,
        water_context=None,
    )


# ============================================================
# FOOD PHOTO ANALYSIS ENDPOINT
# ============================================================

class PhotoAnalysisResponse(BaseModel):
    patient_id: int
    food_name: Optional[str] = None
    estimated_calories: Optional[int] = None
    confidence: Optional[str] = None
    is_food_visible: bool = True
    nutrition_summary: str
    clinical_classification: str = "SAFE"
    clinical_reasoning: Optional[str] = None


@router.post("/analyze-food-photo", response_model=PhotoAnalysisResponse)
async def analyze_food_photo(
    patient_id: int = Form(...),
    photo: UploadFile = File(...),
    condition_context: Optional[str] = Form(default=None),
    session: AsyncSession = Depends(get_session)
):
    """Accept food photo → Vision AI detects food → personalized health advice."""
    from backend.app.services.ai_calorie_service import analyze_food_image

    print(f"DEBUG: analyze-food-photo for patient_id={patient_id}")

    image_bytes = await photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image data received.")

    # Load patient
    q = select(Patient).where(Patient.id == patient_id)
    patient = (await session.execute(q)).scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Load labs
    lq = select(LabReport).where(LabReport.user_id == patient_id)
    lab = (await session.execute(lq)).scalars().first()
    labs = lab.dict() if lab else {}

    # Patient context
    age = calculate_age(patient.dob)
    weight = int(patient.weight or 0)
    height = int(patient.height or 0)
    bmi = calculate_bmi(weight, height)
    bmi_status, bmi_advice = classify_bmi(bmi, age)
    lab_flags = build_lab_flags(labs)

    age_str = f"{age} years" if age else "age not recorded"
    weight_str = f"{weight} kg" if weight else "not recorded"
    height_str = f"{height} cm" if height else "not recorded"
    bmi_str = str(bmi) if bmi else "cannot calculate"
    conditions_str = condition_context or patient.disease or "none"

    # Step 1: Vision AI detect food
    try:
        vision_result = analyze_food_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

    food_name = vision_result.get("food_name") or "Unknown food"
    estimated_calories = vision_result.get("estimated_calories", 0)
    confidence = vision_result.get("confidence", "low")
    is_food_visible = vision_result.get("is_food_visible", False)

    if not is_food_visible:
        return PhotoAnalysisResponse(
            patient_id=patient_id,
            food_name=None,
            estimated_calories=0,
            confidence="low",
            is_food_visible=False,
            nutrition_summary="Photo was unclear or no food detected. Please take a clearer photo in good lighting.",
            clinical_classification="UNKNOWN"
        )

    # Step 2: GPT personalized advice
    system_prompt = (
        "You are a certified clinical dietitian. A patient uploaded a photo of food. "
        "Give personalized, warm advice based on their health profile. "
        "Do NOT use numbers for sections. ONLY use EXACTLY these section headers:\\n"
        "Nutritional Breakdown\\n"
        "⚠️ Health Warnings\\n"
        "✅ Recommendation\\n"
        "Long-term Tip\\n"
        "Be specific and honest about risks."
    )

    user_prompt = f"""Patient Profile:
• Name: {patient.full_name} | Age: {age_str} | Gender: {patient.gender or 'NA'}
• Weight: {weight_str} | Height: {height_str} | BMI: {bmi_str} → {bmi_status.upper()}
• {bmi_advice}
• Medical Condition: {patient.disease or 'Not specified'} | Focus: {conditions_str}

Lab Flags:
{lab_flags}

Food Detected: {food_name} (~{estimated_calories} kcal, confidence: {confidence})

Format your response EXACTLY like the following template. Start directly with their first name for the assessment. DO NOT add any extra introductory text, and DO NOT use markdown headers for the section titles.

{patient.full_name.split()[0] if patient.full_name else 'Patient'}, [Direct conversational answer here concerning the detected food...]
Nutritional Breakdown
For [Portion Size]:
- Calories: [Amount]
- Protein: [Amount]
- Key Nutrients:
  - Carbohydrates: [Amount]
  - Fats: [Amount]
⚠️ Health Warnings
[Your advice based on their labs, etc.]
✅ Recommendation
[Your recommended portion and prep method]
Long-term Tip
[One specific dietary habit for their condition]
"""

    try:
        gpt_response = await _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4,
            max_tokens=500
        )
        nutrition_summary = sanitize_text(gpt_response.choices[0].message.content.strip())
    except Exception as e:
        print(f"GPT photo advice failed: {e}")
        nutrition_summary = (
            f"Detected: {food_name} (~{estimated_calories} kcal). "
            f"BMI status: {bmi_status}. Please consult your dietitian for portion advice."
        )

    # No DB storage — photo analysis is check-and-respond only
    return PhotoAnalysisResponse(
        patient_id=patient_id,
        food_name=food_name,
        estimated_calories=estimated_calories,
        confidence=confidence,
        is_food_visible=True,
        nutrition_summary=nutrition_summary,
        clinical_classification="SAFE",
        clinical_reasoning=f"Detected: {food_name}, ~{estimated_calories} kcal, confidence: {confidence}"
    )
