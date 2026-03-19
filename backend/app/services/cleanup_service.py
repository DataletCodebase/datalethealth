from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import delete
from backend.app.models.chat_memory_model import ChatMemory

async def cleanup_old_chats(session: AsyncSession, days=15):
    cutoff = datetime.utcnow() - timedelta(days=days)

    stmt = delete(ChatMemory).where(ChatMemory.created_at < cutoff)
    await session.execute(stmt)
    await session.commit()
