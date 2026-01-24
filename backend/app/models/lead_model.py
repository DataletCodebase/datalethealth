# backend/app/models/lead_model.py
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Lead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: Optional[str] = Field(default=None, max_length=128)
    phone: Optional[str] = Field(default=None, index=True)
    age: Optional[int] = None
    weight: Optional[float] = None
    conditions: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

