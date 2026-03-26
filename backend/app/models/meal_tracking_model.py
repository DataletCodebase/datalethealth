from sqlalchemy import (
    Column,
    Integer,
    Enum,
    Text,
    Date,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from backend.app.models.mysql_models import Base


# =====================
# Status Enum
# =====================

class MealStatus(PyEnum):
    completed = "completed"
    skipped = "skipped"
    edited = "edited"
    alternate = "alternate"
    alternate_upload = "alternate_upload"


# =====================
# Meal Tracking Model
# =====================

class MealTracking(Base):
    __tablename__ = "meal_tracking"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, autoincrement=True)

    diet_plan_id = Column(
        Integer,
        ForeignKey("diet_plans.id", ondelete="CASCADE"),
        nullable=False
    )

    diet_meal_id = Column(
        Integer,
        ForeignKey("diet_meals.id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(
        Enum(MealStatus, native_enum=False),
        nullable=False
    )

    actual_meal = Column(Text, nullable=True)
    actual_calories = Column(Integer, nullable=True)

    meal_date = Column(Date, nullable=False)

    completed_at = Column(TIMESTAMP, nullable=True)

    created_at = Column(
        TIMESTAMP,
        server_default=func.current_timestamp()
    )
