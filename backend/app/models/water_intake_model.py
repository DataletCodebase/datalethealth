from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class WaterIntakeLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int
    volume_ml: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
