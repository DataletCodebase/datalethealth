from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class ChatMemory(SQLModel, table=True):
    __tablename__ = "chat_memory"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int
    question: str
    ai_reply: str
    classification: str
    reasoning: Optional[str] = None
    condition_context: Optional[str] = None
    ai_source: Optional[str] = None
    water_context: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
