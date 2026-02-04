# backend/app/main.py
# ✅ Load environment variables from .env early
from dotenv import load_dotenv
import os
from pathlib import Path

# Explicitly load backend/.env
env_path = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)


from typing import Optional
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.app.services.cleanup_service import cleanup_old_chats
from backend.app.db.config import async_session
from backend.app.models.mysql_models import Base, engine


# Import backend modules
from backend.app.db.config import init_db
from backend.app.api.endpoints import patient as patient_router
from backend.app.api.endpoints import lab_report as lab_router
from backend.app.api.endpoints import ask_agent as ask_router
from backend.app.api.endpoints import leads as leads_router
from backend.app.api.endpoints import water_logs as water_router
from backend.app.api.endpoints.chat_memory import router as memory_router
from backend.app.api.endpoints import diet as diet_router
from backend.app.api.endpoints import meal_tracking

# 🩺 Initialize FastAPI app
app = FastAPI(title="Kidney Agent Backend")

# 🌐 Enable CORS (for frontend)
origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://datalethealthcare.in",
    "http://51.20.2.246:8000",
    "http://51.20.2.246"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚀 Database initialization on startup
@app.on_event("startup")
async def on_startup():

    # ✅ Create all SQLAlchemy tables (including diet tables)
    Base.metadata.create_all(bind=engine)

    # ✅ Init async DB (your existing logic)
    await init_db()

    print("\n================= ENVIRONMENT CHECK =================")
    print(f"AI_MODE: {os.getenv('AI_MODE')}")
    print(f"GEMINI_API_KEY loaded: {bool(os.getenv('GEMINI_API_KEY'))}")
    print(f"OPENAI_API_KEY loaded: {bool(os.getenv('OPENAI_API_KEY'))}")
    print("==========================================================\n")

    print("All routes registered (path -> methods):")
    for r in app.router.routes:
        methods = getattr(r, "methods", None)
        try:
            path = getattr(r, "path", str(r))
        except Exception:
            path = str(r)
        print(f" - {path} -> {methods}")

    print("All routers imported successfully.")
    print("==========================================================\n")


# 🧹 Auto cleanup background job (delete chats older than 15 days)
@app.on_event("startup")
async def start_cleanup_task():

    async def daily_cleanup():
        while True:
            async with async_session() as session:
                await cleanup_old_chats(session, days=15)
                print("Old chat memories cleaned up")
            await asyncio.sleep(86400)  # 24 hours

    asyncio.create_task(daily_cleanup())


# 🔗 Register routers
app.include_router(patient_router.router)
app.include_router(lab_router.router)
app.include_router(ask_router.router)
app.include_router(leads_router.router)
app.include_router(water_router.router)
app.include_router(memory_router)
app.include_router(diet_router.router)
app.include_router(meal_tracking.router)



# -------------------- ALIAS: make /ask-agent also work --------------------
try:
    app.include_router(ask_router.router, prefix="/ask-agent")
    print("Alias router registered: ask_router.router under /ask-agent")
except Exception as e:
    print("Could not register alias /ask-agent:", e)
# ------------------------------------------------------------------------


# 💚 Health check
@app.get("/")
def root():
    return {"message": "Kidney Agent backend is running"}


# ------------------------------------------------------------
# 🧩 Inline fallback Lead model & endpoint (for testing)
# ------------------------------------------------------------

class Lead(BaseModel):
    first_name: str
    phone: str
    age: Optional[int] = None
    weight: Optional[float] = None
    conditions: str
    source: str


@app.post("/leads/")
async def create_lead(lead: Lead):
    """Temporary fallback endpoint for chatbot lead creation"""
    print(f"📩 Received lead: {lead}")
    return {
        "status": "success",
        "message": "Lead created successfully",
        "data": lead
    }
