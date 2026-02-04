from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
from pydantic import BaseModel
import os
import openai

from backend.app.models.mysql_models import SessionLocal
from backend.app.models.meal_tracking_model import MealTracking, MealStatus


# ==========================
# OpenAI setup
# ==========================

openai.api_key = os.getenv("OPENAI_API_KEY")


from backend.app.services.ai_calorie_service import ai_calorie_estimator


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


# ====================================================
# 🧠 Skip meal + food (REAL AI calories)
# ====================================================

@router.post("/skip-with-food")
def skip_with_food(
    data: MealSkipWithFoodRequest,
    db: Session = Depends(get_db)
):

    if already_tracked(db, data.diet_meal_id, data.meal_date):
        raise HTTPException(status_code=400, detail="Meal already tracked")

    # 🔥 REAL AI CALL
    try:
        calories = ai_calorie_estimator(data.actual_meal)
    except Exception as e:
        print(f"Error calling AI: {e}")
        # Fallback to 0 or handle error differently if critical
        calories = 0
        # If you want to crash on AI failure, uncomment below:
        # raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

    tracking = MealTracking(
        diet_plan_id=data.diet_plan_id,
        diet_meal_id=data.diet_meal_id,
        status=MealStatus.skipped,
        actual_meal=data.actual_meal,
        actual_calories=calories,
        meal_date=data.meal_date,
        completed_at=datetime.utcnow()
    )

    try:
        db.add(tracking)
        db.commit()
        db.refresh(tracking)
    except Exception as e:
        db.rollback()
        print(f"Error tracking meal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "tracking_id": tracking.id,
        "status": "skipped",
        "actual_meal": data.actual_meal,
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
