import asyncio
import os
import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
import pymysql

# Fix asyncio loop on Windows
if os.name == 'nt':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Correctly resolve .env path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "backend", ".env")

print(f"Loading .env from: {ENV_PATH}")
load_dotenv(ENV_PATH, override=True)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "datalethealth")
DB_PORT = os.getenv("DB_PORT", "3306")

print(f"Loaded config: HOST={DB_HOST}, USER={DB_USER}, DB={DB_NAME}, PORT={DB_PORT}")
print(f"Password provided: {bool(DB_PASSWORD)}")

encoded_password = urllib.parse.quote_plus(DB_PASSWORD) if DB_PASSWORD else ""

# 1. Test Sync Connection (pymysql)
SYNC_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"\n[SYNC] Testing connection to: {SYNC_DATABASE_URL.replace(encoded_password, '***')}")

try:
    sync_engine = create_engine(SYNC_DATABASE_URL)
    with sync_engine.connect() as conn:
        print("[SYNC] Success!")
        result = conn.execute(text("SELECT 1"))
        print(f"[SYNC] Result: {result.scalar()}")
except Exception as e:
    print(f"[SYNC] Failed: {e}")

# 2. Test Async Connection (aiomysql)
ASYNC_DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"\n[ASYNC] Testing connection to: {ASYNC_DATABASE_URL.replace(encoded_password, '***')}")

async def test_async():
    try:
        async_engine = create_async_engine(ASYNC_DATABASE_URL)
        async with async_engine.connect() as conn:
            print("[ASYNC] Success!")
            result = await conn.execute(text("SELECT 1"))
            print(f"[ASYNC] Result: {result.scalar()}")
    except Exception as e:
        print(f"[ASYNC] Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_async())
