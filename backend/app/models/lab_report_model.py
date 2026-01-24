from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class LabReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    creatinine: Optional[float] = None
    potassium: Optional[float] = None
    sodium: Optional[float] = None
    urea: Optional[float] = None
    glucose: Optional[float] = None
    calcium: Optional[float] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
