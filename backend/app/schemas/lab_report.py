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
    user_id: int

class LabReportRead(LabReportBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Updated for Pydantic v2
