from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.config import async_session  # re-use config's sessionmaker

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
