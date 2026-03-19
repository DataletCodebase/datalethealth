from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime, timedelta

from backend.app.db.session import get_session
from backend.app.models.chat_memory_model import ChatMemory

router = APIRouter(prefix="/memory", tags=["Chat Memory"])


def serialize_memory(m: ChatMemory):
    return {
        "id": m.id,
        "patient_id": m.patient_id,
        "question": m.question,
        "ai_reply": m.ai_reply,
        "classification": m.classification,
        "reasoning": m.reasoning,
        "condition_context": m.condition_context,
        "ai_source": m.ai_source,
        "water_context": m.water_context,
        "created_at": m.created_at,
    }


@router.get("/{patient_id}")
async def get_full_history(patient_id: int, session: AsyncSession = Depends(get_session)):
    q = (
        select(ChatMemory)
        .where(ChatMemory.patient_id == patient_id)
        .order_by(ChatMemory.created_at.desc())
    )
    res = await session.execute(q)
    memories = res.scalars().all()
    return [serialize_memory(m) for m in memories]


@router.get("/last-7-days/{patient_id}")
async def get_last_7_days(patient_id: int, session: AsyncSession = Depends(get_session)):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    q = (
        select(ChatMemory)
        .where(
            ChatMemory.patient_id == patient_id,
            ChatMemory.created_at >= seven_days_ago
        )
        .order_by(ChatMemory.created_at.desc())
    )

    res = await session.execute(q)
    memories = res.scalars().all()
    return [serialize_memory(m) for m in memories]
