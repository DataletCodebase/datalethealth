from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime, timedelta, date
import os

from openai import OpenAI
from dotenv import load_dotenv

from backend.app.models.mysql_models import SessionLocal
from backend.app.models.diet_model import DietPlan, DietMeal
from backend.app.models.patient_model import Patient
from backend.app.models.lab_report_model import LabReport
from backend.app.models.meal_tracking_model import MealTracking
from backend.app.utils.encryption import decrypt


# =====================================================
# Router
# =====================================================

router = APIRouter(
    prefix="/diet",
    tags=["Diet"]
)


# =====================================================
# 📦 REQUEST BODY SCHEMA
# =====================================================

class GoalPayload(BaseModel):
    goals: Optional[List[str]] = []
    other_goals: Optional[str] = ""


# =====================================================
# DB Dependency
# =====================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Reload .env to ensure the new API key is picked up
load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# =====================================================
# 🔢 AGE CALCULATOR (FROM DOB)
# =====================================================

def calculate_age(dob):
    if not dob:
        return "Unknown"

    if isinstance(dob, str):
        try:
            # Handle standard YYYY-MM-DD strings from MySQL/SQLite
            dob = datetime.strptime(dob.split("T")[0], "%Y-%m-%d").date()
        except ValueError:
            return "Unknown"

    today = date.today()
    try:
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except AttributeError:
        return "Unknown"


# =====================================================
# 🔢 BMI CALCULATOR
# =====================================================

def calculate_bmi(weight_kg, height_cm):
    if not weight_kg or not height_cm or height_cm == 0:
        return None
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def bmi_goal_and_calories(bmi, age, gender):
    """Return (weight_goal, calorie_target_str, bmi_note) based on BMI + age."""
    gender = (gender or "").lower()
    base_cal = 1800 if gender == "female" else 2000

    # Age adjustment
    if age and age >= 60:
        base_cal -= 200
        age_note = f"At age {age} (senior), prioritise protein and calcium to preserve muscle and bone density."
    elif age and age < 25:
        base_cal += 100
        age_note = f"At age {age} (young adult), support growth and activity with adequate carbs and protein."
    elif age and age >= 40:
        age_note = f"At age {age}, hormonal changes slow metabolism — prioritise fibre, lean protein, and portion control."
    else:
        age_note = ""

    if bmi is None:
        return "balanced", f"~{base_cal} kcal/day", f"No height/weight data. {age_note}"
    elif bmi < 18.5:
        target = base_cal + 400
        return (
            "WEIGHT GAIN",
            f"~{target} kcal/day (calorie surplus for healthy weight gain)",
            f"BMI {bmi} — UNDERWEIGHT. Include calorie-dense foods: nuts, avocado, whole grains, lean meats. {age_note}"
        )
    elif bmi < 25.0:
        return (
            "MUSCLE GAIN / MAINTENANCE",
            f"~{base_cal} kcal/day (maintenance with lean muscle focus)",
            f"BMI {bmi} — HEALTHY WEIGHT. Maintain quality nutrition; emphasise protein for muscle. {age_note}"
        )
    elif bmi < 30.0:
        target = base_cal - 300
        return (
            "GRADUAL WEIGHT LOSS",
            f"~{target} kcal/day (moderate deficit for 0.5 kg/week loss)",
            f"BMI {bmi} — OVERWEIGHT. Reduce refined carbs and saturated fat; boost vegetables and fibre. {age_note}"
        )
    else:
        target = base_cal - 500
        return (
            "WEIGHT REDUCTION (PRIORITY)",
            f"~{target} kcal/day (500 kcal deficit for ~0.5 kg/week loss)",
            f"BMI {bmi} — OBESE. Strict portion control, avoid fried/processed food; small frequent meals. {age_note}"
        )


def build_lab_restrictions(lab):
    """Build clinical restriction strings from lab values."""
    if not lab:
        return "No lab data — apply general healthy-eating principles."

    restrictions = []

    def safe_float(val):
        try:
            val_dec = decrypt(val)
            return float(val_dec)
        except (ValueError, TypeError):
            return 0.0

    cr = safe_float(getattr(lab, 'creatinine', None))
    if cr > 1.2:
        restrictions.append(f"HIGH CREATININE ({cr}) → Strictly limit protein (0.6–0.8 g/kg/day); avoid red meat, extra dairy, protein supplements.")

    k = safe_float(getattr(lab, 'potassium', None))
    if k > 5.0:
        restrictions.append(f"HIGH POTASSIUM ({k}) → Avoid banana, orange, potato, tomato, spinach; use low-K vegetables (cabbage, apple, carrot).")
    elif k > 0 and k < 3.5:
        restrictions.append(f"LOW POTASSIUM ({k}) → Include potassium-rich foods: banana, sweet potato, yogurt, lentils.")

    na = safe_float(getattr(lab, 'sodium', None))
    if na > 0 and na < 135:
        restrictions.append(f"LOW SODIUM ({na}) → Mild sodium restriction; avoid heavy salt restriction.")
    elif na > 145:
        restrictions.append(f"HIGH SODIUM ({na}) → Strict low-salt diet (<1500 mg/day); avoid processed/packaged foods.")

    chol = safe_float(getattr(lab, 'cholesterol_total', None))
    if chol > 200:
        restrictions.append(f"HIGH CHOLESTEROL ({chol}) → Avoid saturated fat (ghee, butter, fried food); include oats, flaxseed, nuts, olive oil.")

    hba1c = safe_float(getattr(lab, 'hba1c', None))
    if hba1c > 6.5:
        restrictions.append(f"HIGH HbA1c ({hba1c}% — diabetic range) → Low glycaemic index carbs only; avoid sugar, white rice, maida; distribute carbs evenly across meals.")
    elif hba1c > 5.7:
        restrictions.append(f"HbA1c {hba1c}% (pre-diabetic) → Reduce refined carbs; prefer whole grains, legumes, vegetables.")

    sys_bp = safe_float(getattr(lab, 'blood_pressure_systolic', None))
    dia_bp = safe_float(getattr(lab, 'blood_pressure_diastolic', None))
    if sys_bp > 130 or dia_bp > 80:
        restrictions.append(f"HIGH BP ({sys_bp}/{dia_bp}) → DASH diet principles: low sodium, high potassium/magnesium; limit caffeine and alcohol.")

    urea = safe_float(getattr(lab, 'urea', None))
    if urea > 40:
        restrictions.append(f"HIGH UREA ({urea}) → Further reduce protein; increase simple carbohydrates for energy (rice, bread without bran).")

    return "\n".join(f"⚠️ {r}" for r in restrictions) if restrictions else "✅ Labs within normal range — apply standard healthy-eating principles."


def build_condition_rules(disease):
    """Map medical conditions to dietary rules."""
    if not disease:
        return ""
    d = disease.lower()
    rules = []

    if any(k in d for k in ["kidney", "renal", "ckd"]):
        rules.append("KIDNEY DISEASE: Low protein, low potassium, low phosphorus, low sodium. Avoid dairy excess, nuts, seeds, whole grains in large quantities.")
    if any(k in d for k in ["diabet", "sugar"]):
        rules.append("DIABETES: Low GI foods only. No refined sugar. Evenly distribute carbohydrates. Include bitter gourd, fenugreek, barley.")
    if any(k in d for k in ["heart", "cardiac", "coronary"]):
        rules.append("HEART DISEASE: Low saturated fat, low cholesterol, low sodium. Include omega-3 (fish, flax), olive oil, whole grains, abundant vegetables.")
    if any(k in d for k in ["hypertens", "blood pressure", "bp"]):
        rules.append("HYPERTENSION: DASH diet — limit sodium <1500 mg/day; increase potassium, magnesium, calcium-rich foods.")
    if any(k in d for k in ["liver", "hepat"]):
        rules.append("LIVER DISEASE: Low fat, moderate protein, avoid alcohol. Include antioxidant-rich foods (berries, leafy greens).")
    if any(k in d for k in ["thyroid"]):
        rules.append("THYROID: Limit goitrogenic foods (raw cabbage, soy). Include iodine and selenium-rich foods.")
    if any(k in d for k in ["gout", "uric"]):
        rules.append("GOUT/HIGH URIC ACID: Avoid red meat, organ meats, shellfish, alcohol, fructose. Increase water intake.")

    return "\n".join(f"🏥 {r}" for r in rules)


# =====================================================
# 🧠 PROMPT BUILDER (FULLY INTELLIGENT)
# =====================================================

def build_diet_prompt(user, lab, history_context=None, diet_type="veg", goals=None, other_goals=None):
    # Dietary preference instruction block
    diet_type = (diet_type or "veg").lower()
    dietary_rules = {
        "veg": (
            "STRICTLY VEGETARIAN",
            "Include ONLY vegetarian foods: dairy (milk, curd, paneer, cheese, ghee), lentils, legumes, vegetables, fruits, grains, nuts, seeds.\n"
            "ABSOLUTELY NO eggs, chicken, mutton, fish, seafood, or any meat products."
        ),
        "nonveg": (
            "NON-VEGETARIAN",
            "Include a rich variety of non-vegetarian proteins: eggs (any style), chicken (curry, grilled, roasted), mutton (curry, keema), and fish/seafood.\n"
            "Rotate non-veg items across all 7 days — do NOT use only eggs. Include at least chicken on 3 days, fish on 2 days, mutton on 1-2 days, eggs on 2-3 days.\n"
            "Balance with vegetables, grains, and dairy."
        ),
        "mix": (
            "FLEXITARIAN (MIX OF VEG AND NON-VEG)",
            "Mix vegetarian and non-vegetarian meals throughout the week.\n"
            "Roughly 50-60% veg meals, 40-50% non-veg meals.\n"
            "Include eggs, chicken, fish across different days while also including days with pure vegetarian meals."
        ),
        "vegan": (
            "STRICTLY VEGAN",
            "Include ONLY plant-based foods: vegetables, fruits, grains, lentils, legumes, nuts, seeds, plant milks (oat, almond, soy), tofu, tempeh.\n"
            "ABSOLUTELY NO dairy (no milk, curd, paneer, ghee, butter, cheese), no eggs, no meat, no fish, no honey, no animal products of any kind."
        ),
    }
    diet_label, diet_instruction = dietary_rules.get(diet_type, dietary_rules["veg"])

    age = calculate_age(decrypt(user.dob) if getattr(user, 'dob', None) else None)
    age_val = age if isinstance(age, int) else None
    age_str = f"{age} years" if age != "Unknown" else "Not specified"

    # Profile info decryption
    patient_name = decrypt(getattr(user, 'name', '')) or 'Unknown'
    patient_gender = decrypt(getattr(user, 'gender', '')) or 'Unknown'
    patient_blood_group = decrypt(getattr(user, 'blood_group', '')) or 'Unknown'
    patient_condition = decrypt(getattr(user, 'condition_type', '')) or 'Unknown'

    try:
        weight = int(float(decrypt(user.weight or "0")))
    except (ValueError, TypeError):
        weight = 0

    try:
        height = int(float(decrypt(user.height or 0)))
    except (ValueError, TypeError):
        height = 0

    bmi = calculate_bmi(weight, height)
    bmi_str = str(bmi) if bmi else "Cannot calculate (missing height/weight)"

    weight_goal, calorie_target, bmi_note = bmi_goal_and_calories(bmi, age_val, user.gender)
    lab_restrictions = build_lab_restrictions(lab)
    condition_rules = build_condition_rules(user.disease)

    # Build goals section
    goal_lines = []
    if goals:
        goal_lines.append("Selected Goals: " + ", ".join(goals))
    if other_goals and other_goals.strip():
        goal_lines.append(f"Additional health goals: {other_goals.strip()}")
    goals_section = "\n".join(goal_lines) if goal_lines else "No specific goals selected — apply balanced nutrition."

    return f"""You are a senior clinical dietitian creating a fully personalised 7-day meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥗 DIETARY PREFERENCE (HIGHEST PRIORITY — MUST FOLLOW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diet Type: {diet_label}
{diet_instruction}

This is the MOST IMPORTANT constraint. ALL meals across all 7 days MUST strictly follow the above dietary preference.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: {patient_name}
• Age: {age_str} | Gender: {patient_gender} | Blood Group: {patient_blood_group}
• Weight: {weight} kg | Height: {height} cm | BMI: {bmi_str}
• Weight Goal: {weight_goal}
• Calorie Target: {calorie_target}
• {bmi_note}
• Medical Condition: {patient_condition or 'None reported'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLINICAL LAB FLAGS (MUST FOLLOW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{lab_restrictions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT GOALS (MUST ALIGN ALL MEALS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{goals_section}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDITION-SPECIFIC RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{condition_rules if condition_rules else "No specific medical conditions — create a balanced, healthy Indian diet."}

{f'''━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAST 4-WEEK DIET HISTORY & ADHERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{history_context}

USE THIS HISTORY TO:
- Avoid repeating meals the patient skipped frequently
- Adjust calorie targets up/down if adherence was high/low
- Include more variety where the patient logged alternate meals
''' if history_context else ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Generate a 7-day Indian diet plan (Mon–Sun) tailored to the above profile.
2. Every meal must respect ALL lab flags and condition rules above.
3. Match calorie target: {calorie_target}
4. Goal is {weight_goal} — portion sizes and food choices must reflect this.
5. Prefer practical Indian foods (dal, sabzi, roti, rice, curd, fruits, salads).
6. Vary meals each day — no repetition of main dishes within 3 days.
7. Learn from the 4-week history — do NOT repeat skipped/alternate meals.

Each day must include meals at these times:
5:30am | 7:30am | 8:30am | 11:30am | 1:30pm | 4:00pm | 5:30pm | 7:30pm | 9:30pm

CRITICAL: You MUST generate all 7 days (Monday through Sunday). Do NOT stop at Tuesday or Wednesday. Do NOT be lazy. You MUST complete the full 7-day schedule with NO missing days or meals.

Return ONLY valid JSON in exactly this format:
{{
  "Monday": {{
    "5:30am": {{"meal": "...", "quantity": "...", "cal": 123}},
    "7:30am": {{"meal": "...", "quantity": "...", "cal": 123}}
  }},
  "Tuesday": {{ ... }},
  "Wednesday": {{ ... }},
  "Thursday": {{ ... }},
  "Friday": {{ ... }},
  "Saturday": {{ ... }},
  "Sunday": {{ ... }}
}}"""


def call_ai(prompt):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=8000,
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"AI Call Error: {e}")
        return {}

# =====================================================
# 🚀 MAIN API
# =====================================================

@router.post("/generate/{patient_id}")
def generate_diet(patient_id: int, diet_type: str = "veg", payload: GoalPayload = Body(default_factory=GoalPayload), db: Session = Depends(get_db)):

    # 1️⃣ Fetch patient
    user = db.query(Patient).filter(Patient.id == patient_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2️⃣ Fetch latest lab report (optional — not required)
    lab = (
        db.query(LabReport)
        .filter(LabReport.user_id == patient_id)
        .order_by(LabReport.id.desc())
        .first()
    )
    # lab can be None — build_diet_prompt handles it gracefully

    # 3️⃣ Fetch 4-week diet + tracking history for context
    history_cutoff = datetime.utcnow() - timedelta(days=28)
    past_plans = (
        db.query(DietPlan)
        .filter(DietPlan.patient_id == patient_id, DietPlan.created_at >= history_cutoff)
        .order_by(DietPlan.created_at.desc())
        .limit(4)
        .all()
    )

    history_lines = []
    for idx, past_plan in enumerate(past_plans, start=1):
        week_label = f"Week {idx} (created {past_plan.created_at.strftime('%Y-%m-%d')})"
        # Fetch tracked meals for this plan
        tracked = (
            db.query(MealTracking)
            .filter(MealTracking.diet_plan_id == past_plan.id)
            .all()
        )
        completed_count = sum(1 for t in tracked if t.status.value == "completed")
        skipped_count   = sum(1 for t in tracked if t.status.value == "skipped")
        alternate_count = sum(1 for t in tracked if t.status.value in ["alternate", "alternate_upload"])
        total_tracked   = len(tracked)

        history_lines.append(f"{week_label}: {total_tracked} meals tracked — {completed_count} completed, {skipped_count} skipped, {alternate_count} alternate")

        # List commonly skipped or alternated meals
        for t in tracked:
            if t.status.value == "skipped":
                meal = db.query(DietMeal).filter(DietMeal.id == t.diet_meal_id).first()
                if meal:
                    history_lines.append(f"  ❌ Skipped: {meal.meal_name} ({meal.day} {meal.time})")
            elif t.status.value in ["alternate", "alternate_upload"] and t.actual_meal:
                meal = db.query(DietMeal).filter(DietMeal.id == t.diet_meal_id).first()
                if meal:
                    history_lines.append(f"  🔄 Swapped '{meal.meal_name}' → '{t.actual_meal}' ({meal.day} {meal.time})")

    history_context = "\n".join(history_lines) if history_lines else None

    # 4️⃣ Build intelligent AI prompt
    prompt = build_diet_prompt(user, lab, history_context=history_context, diet_type=diet_type, goals=payload.goals, other_goals=payload.other_goals)

    print("\n========== AI DIET PROMPT ==========")
    print(prompt)
    print("=====================================\n")

    # 4️⃣ Call AI
    ai_response = call_ai(prompt)

    if not ai_response or "Monday" not in ai_response:
        raise HTTPException(
            status_code=500, 
            detail="AI failed to generate a valid diet plan. Please try again."
        )

    # 5️⃣ Calculate weekly calories
    total_calories = sum(
        meal["cal"]
        for day in ai_response.values()
        for meal in day.values()
        if isinstance(meal, dict) and "cal" in meal
    )

    # 6️⃣ Save diet plan
    plan = DietPlan(
        patient_id=patient_id,
        week_start_date=datetime.utcnow(),
        week_end_date=datetime.utcnow() + timedelta(days=7),
        ai_generated_plan=json.dumps(ai_response),
        final_plan=None,
        total_week_calories=total_calories,
        status="pending"
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    # 7️⃣ Save individual meals
    for day, meals in ai_response.items():
        for time, info in meals.items():
            if not isinstance(info, dict):
                continue
            meal = DietMeal(
                diet_plan_id=plan.id,
                day=day,
                time=time,
                meal_name=info.get("meal", ""),
                quantity=info.get("quantity", ""),
                calories=info.get("cal", 0)
            )
            db.add(meal)

    db.commit()

    # 🧹 Auto-delete diet plans older than 28 days for this patient
    expiry_cutoff = datetime.utcnow() - timedelta(days=28)
    old_plans = (
        db.query(DietPlan)
        .filter(DietPlan.patient_id == patient_id, DietPlan.created_at < expiry_cutoff)
        .all()
    )
    for old_plan in old_plans:
        # Delete cascading meal tracking records first
        db.query(MealTracking).filter(MealTracking.diet_plan_id == old_plan.id).delete()
        # Delete individual diet meals
        db.query(DietMeal).filter(DietMeal.diet_plan_id == old_plan.id).delete()
        db.delete(old_plan)
    if old_plans:
        db.commit()
        print(f"🧹 Deleted {len(old_plans)} old diet plan(s) for patient {patient_id}")

    return {
        "message": "Diet plan generated successfully ✅",
        "diet_plan_id": plan.id,
        "total_calories": total_calories,
        "weight_goal": build_diet_prompt.__doc__,
        "diet_preview": ai_response
    }


@router.post("/approve/{diet_plan_id}")
def approve_diet(
    diet_plan_id: int,
    payload: dict,  
    db: Session = Depends(get_db)
):
    plan = db.query(DietPlan).filter(DietPlan.id == diet_plan_id).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    plan.ai_generated_plan = json.dumps(payload["plan"])

    if plan.status == "approved":
        return {"message": "Diet plan is already approved"}

    plan.status = "approved"
    plan.approved_at = datetime.utcnow()
    plan.approved_by = payload.get("approved_by", "Dietitian")

    # =========================================================
    # 🔥 SYNC DIET MEALS (Fix for "Meal not found")
    # =========================================================
    # Instead of deleting old meals (which breaks foreign keys for active meal tracking and causes lock timeouts),
    # we update the existing meals or insert new ones if they are missing.
    
    approved_plan = payload["plan"]
    
    for day, meals in approved_plan.items():
        if not isinstance(meals, dict):
            continue
        for time, info in meals.items():
            if type(info) is not dict:
                continue
            
            existing_meal = db.query(DietMeal).filter(
                DietMeal.diet_plan_id == plan.id,
                DietMeal.day == day,
                DietMeal.time == time
            ).first()

            if existing_meal:
                existing_meal.meal_name = info.get("meal", "")
                existing_meal.quantity = info.get("quantity", "")
                existing_meal.calories = info.get("cal", 0)
            else:
                new_meal = DietMeal(
                    diet_plan_id=plan.id,
                    day=day,
                    time=time,
                    meal_name=info.get("meal", ""),
                    quantity=info.get("quantity", ""),
                    calories=info.get("cal", 0)
                )
                db.add(new_meal)
    # =========================================================
    
    db.commit()
    db.refresh(plan)

    return {
        "success": True,
        "message": f"Diet plan {diet_plan_id} approved successfully ✅",
        "status": "approved",
        "approved_at": plan.approved_at
    }


@router.post("/reject/{diet_plan_id}")
def reject_diet(
    diet_plan_id: int,
    payload: dict,
    db: Session = Depends(get_db)
):
    plan = db.query(DietPlan).filter(DietPlan.id == diet_plan_id).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    if plan.status == "rejected":
        return {"message": "Diet plan is already rejected"}

    plan.status = "rejected"
    plan.approved_at = datetime.utcnow()  # Use approved_at for rejection time too
    plan.approved_by = payload.get("approved_by", "Dietitian")

    db.commit()
    db.refresh(plan)

    return {
        "success": True,
        "message": f"Diet plan {diet_plan_id} rejected ❌",
        "status": "rejected",
        "rejected_at": plan.approved_at
    }


@router.get("/user/{user_id}")
def get_user_diets(user_id: int, db: Session = Depends(get_db)):
    # Explicitly sort by created_at ASC so the frontend (taking the last one) gets the latest
    diets = db.query(DietPlan).filter(DietPlan.patient_id == user_id).order_by(DietPlan.created_at.asc()).all()



    if not diets:
        raise HTTPException(status_code=404, detail="No diet plans found")

    return diets
    
# trigger reload - force new key check
