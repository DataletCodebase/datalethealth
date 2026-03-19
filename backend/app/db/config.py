from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
# import models to register them with metadata
from backend.app.models.lead_model import Lead

import os
import urllib.parse
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load backend/.env
env_path = Path(__file__).resolve().parent.parent.parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

# ✅ Always build MySQL URL from .env components (never trust system DATABASE_URL which may point to SQLite)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "DataletDbLocal")
DB_PORT = os.getenv("DB_PORT", "3306")

encoded_password = urllib.parse.quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"[DB] Async engine connecting to MySQL: {DB_NAME} at {DB_HOST}:{DB_PORT}")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

