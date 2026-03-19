# backend/app/api/endpoints/leads.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from pydantic import BaseModel, Field
from backend.app.db.session import get_session
from backend.app.models.lead_model import Lead

router = APIRouter(prefix="/leads", tags=["Leads"])

class LeadCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=7)
    age: int = None
    weight: float = None
    conditions: str = None
    source: str = None

@router.post("/", response_model=LeadCreate)
async def create_lead(payload: LeadCreate, session: AsyncSession = Depends(get_session)):
    # basic phone duplication check (optional)
    q = select(Lead).where(Lead.phone == payload.phone)
    res = await session.execute(q)
    existing = res.scalars().first()
    if existing:
        # still create a new lead but you might want to avoid duplicates
        pass

    lead = Lead(
        first_name=payload.first_name,
        phone=payload.phone,
        age=payload.age,
        weight=payload.weight,
        conditions=payload.conditions,
        source=payload.source,
    )
    session.add(lead)
    await session.commit()
    await session.refresh(lead)
    # optionally: trigger async notification to diet agent here (email/sms or queue)
    return payload

@router.get("/", response_model=List[Lead])
async def list_leads(session: AsyncSession = Depends(get_session)):
    q = select(Lead).order_by(Lead.created_at.desc())
    res = await session.execute(q)
    items = res.scalars().all()
    return items
