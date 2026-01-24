from sqlmodel import SQLModel, Field, Column
from sqlalchemy import String
from typing import Optional
from datetime import datetime

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # put index and unique on the SA Column instead of using Field(index=True)
    patient_code: Optional[str] = Field(
        default=None,
        sa_column=Column("patient_code", String, unique=True, index=True)
    )
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
