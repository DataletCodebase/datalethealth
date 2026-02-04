from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class LabReport(SQLModel, table=True):
    __tablename__ = "medical_data"   # exact table name

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(index=True)   # IMPORTANT (not patient_id)

    creatinine: Optional[float] = 0
    potassium: Optional[float] = 0
    sodium: Optional[float] = 0
    urea: Optional[float] = 0

    estimated_gfr: Optional[float] = 0
    albumin: Optional[float] = 0
    calcium: Optional[float] = 0
    phosphate: Optional[float] = 0
    uric_acid: Optional[float] = 0

    cholesterol_total: Optional[float] = 0
    cholesterol_ldl: Optional[float] = 0
    cholesterol_hdl: Optional[float] = 0
    triglycerides: Optional[float] = 0

    blood_pressure_systolic: Optional[float] = 0
    blood_pressure_diastolic: Optional[float] = 0
    heart_rate: Optional[float] = 0
    bmi: Optional[float] = 0

    fasting_glucose: Optional[float] = 0
    postprandial_glucose: Optional[float] = 0
    hba1c: Optional[float] = 0

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
