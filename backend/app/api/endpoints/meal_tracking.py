from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
from pydantic import BaseModel
from fastapi import UploadFile, File, Form
from typing import Optional
from backend.app.services.ai_calorie_service import analyze_food_image
import os
import openai

from backend.app.models.mysql_models import SessionLocal
from backend.app.models.meal_tracking_model import MealTracking, MealStatus
from backend.app.models.mysql_models import DietPlan, DietMeal

# ==========================
# OpenAI setup
# ==========================

openai.api_key = os.getenv("OPENAI_API_KEY")




router = APIRouter(
    prefix="/meal-tracking",
    tags=["Meal Tracking"]
)


# -------------------------
# DB Dependency
# -------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Pydantic Schemas
# -------------------------

class MealTrackRequest(BaseModel):
    diet_plan_id: int
    diet_meal_id: int
    meal_date: date


class MealEditRequest(MealTrackRequest):
    actual_meal: str
    actual_calories: int


class MealSkipWithFoodRequest(MealTrackRequest):
    actual_meal: str


# -------------------------
# Prevent duplicate
# -------------------------

def already_tracked(db: Session, diet_meal_id: int, meal_date: date):
    return db.query(MealTracking).filter(
        MealTracking.diet_meal_id == diet_meal_id,
        MealTracking.meal_date == meal_date
    ).first()






# ====================================================
# 📥 Get latest diet plan + meals for tracking
# ====================================================



@router.get("/user/{user_id}")
def get_user_meal_tracking(
    user_id: int, 
    look_date: str = None, # Optional: YYYY-MM-DD
    db: Session = Depends(get_db)
):

    # Default to today if no date provided
    target_date = date.today()
    if look_date:
        try:
            target_date = datetime.strptime(look_date, "%Y-%m-%d").date()
        except:
            pass

    # Get latest diet plan of user
    diet = (
        db.query(DietPlan)
        .filter(DietPlan.patient_id == user_id)
        .order_by(DietPlan.created_at.desc())
        .first()
    )

    if not diet:
        raise HTTPException(status_code=404, detail="No diet plan found")

    from datetime import timedelta
    start_of_week = target_date - timedelta(days=target_date.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    # 🔥 Optimize: Fetch all tracking records for this plan & week in one go
    tracked_records = db.query(MealTracking).filter(
        MealTracking.diet_plan_id == diet.id,
        MealTracking.meal_date >= start_of_week,
        MealTracking.meal_date <= end_of_week
    ).all()

    # Map diet_meal_id -> full record
    tracking_map = {rec.diet_meal_id: rec for rec in tracked_records}
    
    return {
        "diet_plan_id": diet.id,
        "meals": [
            {
                "diet_meal_id": meal.id,
                "diet_plan_id": meal.diet_plan_id,
                "day": meal.day,
                "time": meal.time,
                "meal_name": tracking_map.get(meal.id).actual_meal if (tracking_map.get(meal.id) and tracking_map.get(meal.id).actual_meal) else meal.meal_name,
                "quantity": meal.quantity,
                "calories": tracking_map.get(meal.id).actual_calories if (tracking_map.get(meal.id) and tracking_map.get(meal.id).actual_calories) else meal.calories,
                "status": tracking_map.get(meal.id).status.value if tracking_map.get(meal.id) else "pending",
                "is_alternate": bool(tracking_map.get(meal.id) and tracking_map.get(meal.id).actual_meal)
            }
            for meal in diet.meals
        ]
    }







# ====================================================
# ✅ Complete meal
# ====================================================

@router.post("/complete")
def complete_meal(
    data: MealTrackRequest,
    db: Session = Depends(get_db)
):

    if already_tracked(db, data.diet_meal_id, data.meal_date):
        raise HTTPException(status_code=400, detail="Meal already tracked")

    tracking = MealTracking(
        diet_plan_id=data.diet_plan_id,
        diet_meal_id=data.diet_meal_id,
        status=MealStatus.completed,
        meal_date=data.meal_date,
        completed_at=datetime.utcnow()
    )

    try:
        db.add(tracking)
        db.commit()
        db.refresh(tracking)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "tracking_id": tracking.id,
        "status": "completed"
    }


# ====================================================
# ⏭ Skip meal (normal)
# ====================================================

@router.post("/skip")
def skip_meal(
    data: MealTrackRequest,
    db: Session = Depends(get_db)
):

    if already_tracked(db, data.diet_meal_id, data.meal_date):
        raise HTTPException(status_code=400, detail="Meal already tracked")

    tracking = MealTracking(
        diet_plan_id=data.diet_plan_id,
        diet_meal_id=data.diet_meal_id,
        status=MealStatus.skipped,
        meal_date=data.meal_date
    )

    db.add(tracking)
    db.commit()
    db.refresh(tracking)

    return {
        "success": True,
        "tracking_id": tracking.id,
        "status": "skipped"
    }

from fastapi import UploadFile, File, Form
from typing import Optional

@router.post("/skip-with-food")
async def skip_with_food(
    diet_plan_id: int = Form(...),
    diet_meal_id: int = Form(...),
    meal_date: str = Form(...),
    actual_meal: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):

    if already_tracked(db, diet_meal_id, meal_date):
        raise HTTPException(status_code=400, detail="Meal already tracked")

    food_name = None
    calories = None

    # ============================
    # CASE 1: User entered food name
    # ============================
    if actual_meal:
        try:
            from openai import OpenAI
            _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            _resp = _client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": f"Estimate calories for: {actual_meal}. Reply ONLY with a number."}],
                temperature=0
            )
            import re as _re
            _nums = _re.findall(r"\d+", _resp.choices[0].message.content.strip())
            calories = int(_nums[0]) if _nums else 0
            food_name = actual_meal
        except Exception as e:
            print(f"AI text error: {e}")
            calories = 0

    # ============================
    # CASE 2: User uploaded photo
    # ============================
    elif photo:
        try:
            image_bytes = await photo.read()
            if not image_bytes:  # empty upload — treat as no photo
                raise HTTPException(status_code=400, detail="Provide either food name or photo.")
            result = analyze_food_image(image_bytes)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Vision Error: {str(e)}")

        if not result.get("is_food_visible"):
            return {
                "success": False,
                "message": "Image not clear. Please retake."
            }

        food_name = result.get("food_name")
        calories = result.get("estimated_calories")


    # ============================
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide food name for the alternate meal."
        )

    # ============================
    # SAVE TO DB
    # ============================
    tracking = MealTracking(
        diet_plan_id=diet_plan_id,
        diet_meal_id=diet_meal_id,
        status=MealStatus.skipped,
        actual_meal=food_name,
        actual_calories=calories,
        meal_date=meal_date,
        completed_at=datetime.utcnow()
    )

    try:
        db.add(tracking)
        db.commit()
        db.refresh(tracking)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "tracking_id": tracking.id,
        "status": "skipped",
        "actual_meal": food_name,
        "actual_calories": calories
    }


# ====================================================
# ✏ Edit meal (manual calories)
# ====================================================

@router.post("/edit")
def edit_meal(
    data: MealEditRequest,
    db: Session = Depends(get_db)
):

    if already_tracked(db, data.diet_meal_id, data.meal_date):
        raise HTTPException(status_code=400, detail="Meal already tracked")

    tracking = MealTracking(
        diet_plan_id=data.diet_plan_id,
        diet_meal_id=data.diet_meal_id,
        status=MealStatus.edited,
        actual_meal=data.actual_meal,
        actual_calories=data.actual_calories,
        meal_date=data.meal_date
    )

    db.add(tracking)
    db.commit()
    db.refresh(tracking)

    return {
        "success": True,
        "tracking_id": tracking.id,
        "status": "edited"
    }
