from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ✅ Create schema for creating a new patient
class PatientCreate(BaseModel):
    patient_code: Optional[str] = None
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    diagnosis: Optional[str] = None

# ✅ Schema for reading patient data (response)
class PatientRead(BaseModel):
    id: int
    patient_code: Optional[str] = None
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# ✅ Schema for updating existing patient
class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
