
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Boolean, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.models.mysql_models import Base
import enum


class DietStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class DietPlan(Base):
    __tablename__ = "diet_plans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)

    week_start_date = Column(DateTime)
    week_end_date = Column(DateTime)

    ai_generated_plan = Column(Text)   # JSON string
    final_plan = Column(Text)          # JSON string after edit

    total_week_calories = Column(Float)

    status = Column(Enum(DietStatus), default=DietStatus.pending)

    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String(100), nullable=True)

    meals = relationship("DietMeal", back_populates="diet_plan")


class DietMeal(Base):
    __tablename__ = "diet_meals"

    id = Column(Integer, primary_key=True, index=True)

    diet_plan_id = Column(Integer, ForeignKey("diet_plans.id"))

    day = Column(String(20))      # Monday, Tuesday...
    time = Column(String(20))     # 5:30am, 7:30am...

    meal_name = Column(String(150))
    quantity = Column(String(100))

    calories = Column(Float)

    diet_plan = relationship("DietPlan", back_populates="meals")



