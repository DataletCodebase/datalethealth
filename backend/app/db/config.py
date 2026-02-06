from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
# import models to register them with metadata
from backend.app.models.lead_model import Lead

import os
import urllib.parse
from dotenv import load_dotenv
from backend.app.models.water_intake_model import WaterIntakeLog

load_dotenv()

# ✅ Load MySQL Config
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "dataletdblocal")
DB_PORT = os.getenv("DB_PORT", "3306")

encoded_password = urllib.parse.quote_plus(DB_PASSWORD) if DB_PASSWORD else ""

# Construct Async MySQL URL
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"🔥 [DB] Connecting to: {DB_NAME} at {DB_HOST}")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
