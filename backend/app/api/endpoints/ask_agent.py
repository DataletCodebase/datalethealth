from typing import Optional, List
from datetime import datetime
import unicodedata
import re
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from backend.app.services.intelligence_engine import (
    get_last_7_days_memory,
    detect_risk_patterns,
    apply_intelligence_rules
)

from backend.app.models.chat_memory_model import ChatMemory

try:
    from backend.app.db.session import get_session
    from backend.app.models.patient_model import Patient
    from backend.app.models.lab_report_model import LabReport
    from backend.app.models.water_intake_model import WaterIntakeLog
    from backend.app.services.ai_connector import get_dynamic_nutrition_info, translate_text
    from backend.app.services.usda_connector import get_usda_nutrition
except Exception:
    from db.session import get_session
    from models.patient_model import Patient
    from models.lab_report_model import LabReport
    from models.water_intake_model import WaterIntakeLog
    from services.ai_connector import get_dynamic_nutrition_info, translate_text
    from services.usda_connector import get_usda_nutrition


router = APIRouter(prefix="/ask", tags=["AI Agent"])

DAILY_WATER_LIMIT = 1500


class AskRequest(BaseModel):
    patient_id: int
    question: str
    language: Optional[str] = "en"
    condition_context: Optional[List[str]] = None


class AskResponse(BaseModel):
    patient_id: int
    question: str
    nutrition_summary: str
    clinical_classification: str
    clinical_reasoning: Optional[str] = None
    ai_raw: Optional[str] = None
    ai_source: Optional[str] = None
    water_context: Optional[str] = None


# ---------------- utils ----------------

def sanitize_text(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"[^\x09\x0A\x0D\x20-\x7E\u0080-\uFFFF]+", "", s)
    return s.strip()


def extract_water_volume(text: str) -> Optional[float]:
    m = re.search(r"(\d+(?:\.\d+)?)\s*ml", (text or "").lower())
    return float(m.group(1)) if m else None


async def get_today_water_total(session: AsyncSession, patient_id: int) -> float:
    today = datetime.utcnow().date()
    q = select(WaterIntakeLog).where(WaterIntakeLog.patient_id == patient_id)
    res = await session.execute(q)
    logs = res.scalars().all()
    return sum(log.volume_ml for log in logs if log.timestamp.date() == today)


# ---------------- endpoint ----------------

@router.post("/", response_model=AskResponse)
async def ask_agent(payload: AskRequest, session: AsyncSession = Depends(get_session)):

    # 1️⃣ Validate patient
    q = select(Patient).where(Patient.id == payload.patient_id)
    patient = (await session.execute(q)).scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2️⃣ Get labs
    lq = select(LabReport).where(LabReport.patient_id == payload.patient_id)
    lab = (await session.execute(lq)).scalars().first()
    if not lab:
        raise HTTPException(status_code=404, detail="No lab report found")

    labs = lab.dict()

    water_context = None
    final_class = "SAFE"
    final_reason = "No major red flags detected."
    ai_source = "ai"
    ai_raw_val = None

    # ---------------- WATER HANDLING ----------------
    if "water" in (payload.question or "").lower():
        vol = extract_water_volume(payload.question)
        if vol:
            today_total = await get_today_water_total(session, payload.patient_id)
            remaining = DAILY_WATER_LIMIT - today_total

            if vol > remaining:
                water_context = f"Limit exceeded. Remaining: {remaining:.0f} ml"
                final_class = "LIMIT"
                final_reason = "Daily water limit exceeded."
            else:
                new_log = WaterIntakeLog(patient_id=payload.patient_id, volume_ml=vol)
                session.add(new_log)
                await session.commit()

                today_total += vol
                remaining = DAILY_WATER_LIMIT - today_total
                water_context = f"You drank {vol:.0f} ml. Remaining: {remaining:.0f} ml"

            nutrition_summary = f"Plain water ({vol:.0f} ml)\nCalories: 0\nSodium: 0"

            memory = ChatMemory(
                patient_id=payload.patient_id,
                question=payload.question,
                ai_reply=nutrition_summary,
                classification=final_class,
                reasoning=final_reason,
                condition_context=",".join(payload.condition_context) if payload.condition_context else None,
                ai_source="internal",
                water_context=water_context
            )
            session.add(memory)
            await session.commit()

            return AskResponse(
                patient_id=payload.patient_id,
                question=payload.question,
                nutrition_summary=nutrition_summary,
                clinical_classification=final_class,
                clinical_reasoning=final_reason,
                ai_raw=None,
                ai_source="internal",
                water_context=water_context,
            )

    # ---------------- FOOD HANDLING ----------------

    try:
        usda_result = await get_usda_nutrition(payload.question)
    except Exception:
        usda_result = None

    if usda_result:
        nutrition_summary = f"Food: {usda_result.get('description')}\nProtein: {usda_result.get('protein')} g"
        ai_source = "usda"
        ai_raw_val = json.dumps(usda_result, default=str)
    else:
        ai_text = await get_dynamic_nutrition_info(payload.question)
        nutrition_summary = ai_text
        ai_source = "ai"
        ai_raw_val = ai_text

    nutrition_summary = sanitize_text(nutrition_summary)

    # ---------------- 🧠 INTELLIGENCE LAYER ----------------

    memories = await get_last_7_days_memory(session, payload.patient_id)
    patterns = detect_risk_patterns(memories)

    intel_decision, intel_reason = apply_intelligence_rules(patterns)

    if intel_decision:
        final_class = intel_decision
        final_reason = f"[7-day analysis] {intel_reason}"

    # ---------------- SAVE MEMORY ----------------
    try:
        memory = ChatMemory(
            patient_id=payload.patient_id,
            question=payload.question,
            ai_reply=nutrition_summary,
            classification=final_class,
            reasoning=final_reason,
            condition_context=",".join(payload.condition_context) if payload.condition_context else None,
            ai_source=ai_source,
            water_context=water_context
        )
        session.add(memory)
        await session.commit()
    except Exception as e:
        print("⚠️ Memory save failed:", e)

    return AskResponse(
        patient_id=payload.patient_id,
        question=payload.question,
        nutrition_summary=nutrition_summary,
        clinical_classification=final_class,
        clinical_reasoning=final_reason,
        ai_raw=ai_raw_val,
        ai_source=ai_source,
        water_context=water_context,
    )
