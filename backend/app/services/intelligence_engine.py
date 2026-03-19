# backend/app/services/intelligence_engine.py

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlmodel import select
from backend.app.models.chat_memory_model import ChatMemory


async def get_last_7_days_memory(session, patient_id: int):
    cutoff = datetime.utcnow() - timedelta(days=7)

    q = select(ChatMemory).where(
        ChatMemory.patient_id == patient_id,
        ChatMemory.created_at >= cutoff
    ).order_by(ChatMemory.created_at.desc())

    result = await session.execute(q)
    return result.scalars().all()


def detect_risk_patterns(memories: List[ChatMemory]) -> Dict[str, Any]:
    patterns = {
        "high_salt_count": 0,
        "high_sugar_count": 0,
        "high_protein_count": 0,
        "water_over_limit_days": 0,
        "avoid_food_count": 0,
        "limit_food_count": 0,
    }

    for m in memories:
        text = (m.ai_reply or "").lower()

        if "salt" in text or "sodium" in text:
            patterns["high_salt_count"] += 1

        if "sugar" in text or "sweet" in text:
            patterns["high_sugar_count"] += 1

        if "protein" in text:
            patterns["high_protein_count"] += 1

        if m.classification == "AVOID":
            patterns["avoid_food_count"] += 1

        if m.classification == "LIMIT":
            patterns["limit_food_count"] += 1

        if m.water_context and "exceed" in m.water_context.lower():
            patterns["water_over_limit_days"] += 1

    return patterns


def apply_intelligence_rules(patterns: Dict[str, Any]) -> tuple[Optional[str], Optional[str]]:
    final_class = None
    final_reason = None

    if patterns["avoid_food_count"] >= 3:
        final_class = "AVOID"
        final_reason = "Your recent history shows repeated risky food choices."

    elif patterns["high_salt_count"] >= 3:
        final_class = "LIMIT"
        final_reason = "You have had high sodium intake repeatedly this week."
    
    elif patterns["water_over_limit_days"] >= 2:
        final_class = "LIMIT"
        final_reason = "You frequently exceed your daily water limit."

    return final_class, final_reason
