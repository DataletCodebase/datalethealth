from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from datetime import datetime, timedelta, date
import os

from openai import OpenAI

from backend.app.models.mysql_models import SessionLocal
from backend.app.models.diet_model import DietPlan, DietMeal
from backend.app.models.patient_model import Patient
from backend.app.models.lab_report_model import LabReport


# =====================================================
# Router
# =====================================================

router = APIRouter(
    prefix="/diet",
    tags=["Diet"]
)


# =====================================================
# DB Dependency
# =====================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# OpenAI Client
# =====================================================

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# =====================================================
# 🔢 AGE CALCULATOR (FROM DOB)
# =====================================================

def calculate_age(dob):
    if not dob:
        return "Unknown"

    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


# =====================================================
# 🧠 PROMPT BUILDER (FULLY DYNAMIC)
# =====================================================

def build_diet_prompt(user, lab):

    age = calculate_age(user.dob)

    return f"""
You are a professional medical dietician.

Patient profile:
Age: {age}
Gender: {user.gender}
Medical Condition: {user.disease}
Height: {user.height} cm
Weight: {user.weight} kg

Lab reports:
Creatinine: {lab.creatinine}
Potassium: {lab.potassium}
Sodium: {lab.sodium}
Urea: {lab.urea}
HbA1c: {lab.hba1c}
Cholesterol Total: {lab.cholesterol_total}
Blood Pressure: {lab.blood_pressure_systolic}/{lab.blood_pressure_diastolic}

Diet rules:
- Kidney friendly Indian meals
- Adjust for diabetes, BP, cholesterol if present
- Low salt
- Low sugar
- Controlled protein
- High fiber
- Avoid harmful foods for kidney patients

Generate a personalized 7 day diet plan.

Each day must include meals at:
5:30am
7:30am
8:30am
11:30am
1:30pm
4:00pm
5:30pm
7:30pm
9:30pm

Each meal must contain:
meal
quantity
cal

Return ONLY JSON in this format:

{{
  "Monday": {{
     "5:30am": {{"meal":"...", "quantity":"...", "cal":123}},
     "7:30am": {{"meal":"...", "quantity":"...", "cal":123}}
  }},
  "Tuesday": {{
     ...
  }}
}}
"""


# =====================================================
# 🤖 REAL AI CALL
# =====================================================

def call_ai(prompt: str):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional medical diet planner. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        ai_text = response.choices[0].message.content.strip()

        print("\n========== RAW AI RESPONSE ==========")
        print(ai_text)
        print("====================================\n")

        # 🛡 Safety cleanup (remove text before JSON if exists)
        if ai_text.startswith("```"):
            ai_text = ai_text.strip("```json").strip("```")

        first_brace = ai_text.find("{")
        if first_brace != -1:
            ai_text = ai_text[first_brace:]

        return json.loads(ai_text)

    except Exception as e:
        print("AI ERROR FULL:", str(e))
        raise HTTPException(status_code=500, detail="AI diet generation failed")


# =====================================================
# 🚀 MAIN API
# =====================================================

@router.post("/generate/{patient_id}")
def generate_diet(patient_id: int, db: Session = Depends(get_db)):

    # 1️⃣ Fetch user
    user = db.query(Patient).filter(Patient.id == patient_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2️⃣ Fetch latest lab report
    lab = (
        db.query(LabReport)
        .filter(LabReport.user_id == patient_id)
        .order_by(LabReport.id.desc())
        .first()
    )

    if not lab:
        raise HTTPException(status_code=404, detail="Lab report not found")

    # 3️⃣ Build dynamic AI prompt
    prompt = build_diet_prompt(user, lab)

    print("\n========== AI PROMPT ==========")
    print(prompt)
    print("==============================\n")

    # 4️⃣ Call AI (REAL dynamic diet)
    ai_response = call_ai(prompt)

    # 5️⃣ Calculate weekly calories
    total_calories = sum(
        meal["cal"]
        for day in ai_response.values()
        for meal in day.values()
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

    # 7️⃣ Save meals
    for day, meals in ai_response.items():
        for time, info in meals.items():

            meal = DietMeal(
                diet_plan_id=plan.id,
                day=day,
                time=time,
                meal_name=info["meal"],
                quantity=info["quantity"],
                calories=info["cal"]
            )

            db.add(meal)

    return {
        "message": "Diet plan generated successfully ✅",
        "diet_plan_id": plan.id,
        "total_calories": total_calories,
        "diet_preview": ai_response
    }

@router.post("/approve/{diet_plan_id}")
def approve_diet(
    diet_plan_id: int,
    db: Session = Depends(get_db)
):
    plan = db.query(DietPlan).filter(DietPlan.id == diet_plan_id).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    if plan.status == "approved":
        return {"message": "Diet plan is already approved"}

    plan.status = "approved"
    plan.approved_at = datetime.utcnow()
    # If we had a current user (dietician), we would set approved_by here
    # plan.approved_by = current_user.full_name 
    
    db.commit()
    db.refresh(plan)

    return {
        "success": True,
        "message": f"Diet plan {diet_plan_id} approved successfully ✅",
        "status": "approved",
        "approved_at": plan.approved_at
    }


@router.get("/user/{user_id}")
def get_user_diets(user_id: int, db: Session = Depends(get_db)):
    diets = db.query(DietPlan).filter(DietPlan.patient_id == user_id).all()

    if not diets:
        raise HTTPException(status_code=404, detail="No diet plans found")

    return diets
    
