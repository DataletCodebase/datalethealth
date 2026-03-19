from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

# ✅ Create schema for creating a new patient
class PatientCreate(BaseModel):
    full_name: str
    email: str
    mobile: str
    password: str
    dob: Optional[date] = None
    address: Optional[str] = None
    disease: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    blood_group: Optional[str] = None
    city: Optional[str] = None

# ✅ Schema for reading patient data (response)
class PatientRead(BaseModel):
    id: int
    full_name: str
    email: str
    mobile: str
    dob: Optional[date] = None
    address: Optional[str] = None
    disease: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[datetime] = None
    customer_id: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    blood_group: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True  # Pydantic v2 support (was orm_mode)

# ✅ Schema for updating existing patient
class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    disease: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    blood_group: Optional[str] = None
    city: Optional[str] = None
