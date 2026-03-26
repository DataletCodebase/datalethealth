from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date

class Patient(SQLModel, table=True):
    __tablename__ = "users"   # IMPORTANT: matches real table name

    id: Optional[int] = Field(default=None, primary_key=True)

    full_name: str
    email: str
    mobile: str

    dob: Optional[date] = None
    address: Optional[str] = None
    disease: Optional[str] = None

    role: Optional[str] = "USER"

    password_hash: str

    created_at: Optional[datetime] = None

    customer_id: Optional[str] = None
    gender: Optional[str] = "NA"

    height: Optional[str] = "0"
    weight: Optional[str] = "0"

    blood_group: Optional[str] = "NA"
    city: Optional[str] = "NA"
