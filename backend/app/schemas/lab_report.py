from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LabReportBase(BaseModel):
    creatinine: Optional[float] = None
    potassium: Optional[float] = None
    sodium: Optional[float] = None
    urea: Optional[float] = None
    glucose: Optional[float] = None
    calcium: Optional[float] = None

class LabReportCreate(LabReportBase):
    patient_id: int

class LabReportRead(LabReportBase):
    id: int
    patient_id: int
    updated_at: datetime

    class Config:
        from_attributes = True  # Updated for Pydantic v2
