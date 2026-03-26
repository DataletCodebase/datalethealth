from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class LabReport(SQLModel, table=True):
    __tablename__ = "medical_data"   # exact table name

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(index=True)   # IMPORTANT (not patient_id)

    creatinine: Optional[str] = "0"
    potassium: Optional[str] = "0"
    sodium: Optional[str] = "0"
    urea: Optional[str] = "0"

    estimated_gfr: Optional[str] = "0"
    albumin: Optional[str] = "0"
    calcium: Optional[str] = "0"
    phosphate: Optional[str] = "0"
    uric_acid: Optional[str] = "0"

    cholesterol_total: Optional[str] = "0"
    cholesterol_ldl: Optional[str] = "0"
    cholesterol_hdl: Optional[str] = "0"
    triglycerides: Optional[str] = "0"

    blood_pressure_systolic: Optional[str] = "0"
    blood_pressure_diastolic: Optional[str] = "0"
    heart_rate: Optional[str] = "0"
    bmi: Optional[str] = "0"

    fasting_glucose: Optional[str] = "0"
    postprandial_glucose: Optional[str] = "0"
    hba1c: Optional[str] = "0"

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
