from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(prefix="/water", tags=["Water Tracker"])

# temporary in-memory store (replace with DB integration later)
WATER_LOGS = []

class WaterLogInput(BaseModel):
    patient_id: int
    volume_ml: float

class WaterLog(BaseModel):
    id: int
    patient_id: int
    volume_ml: float
    timestamp: datetime

@router.get("/logs/{patient_id}", response_model=List[WaterLog])
async def get_water_logs(patient_id: int):
    """Return all water intake logs for a patient"""
    logs = [log for log in WATER_LOGS if log.patient_id == patient_id]
    return logs

@router.post("/logs", response_model=WaterLog)
async def add_water_log(payload: WaterLogInput):
    """Add new water intake log for a patient from JSON body"""
    new_log = WaterLog(
        id=len(WATER_LOGS) + 1,
        patient_id=payload.patient_id,
        volume_ml=payload.volume_ml,
        timestamp=datetime.utcnow()
    )
    WATER_LOGS.append(new_log)
    print(f"✅ Water log added: {new_log}")
    return new_log
