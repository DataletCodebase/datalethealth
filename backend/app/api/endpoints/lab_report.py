from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.app.db.session import get_session
from backend.app.models.lab_report_model import LabReport
from backend.app.models.patient_model import Patient
from backend.app.schemas.lab_report import LabReportCreate, LabReportRead

router = APIRouter(tags=["lab reports"], prefix="/labs")


@router.post("/", response_model=LabReportRead)
async def upsert_lab_report(
    payload: LabReportCreate, session: AsyncSession = Depends(get_session)
):
    # Check if patient exists
    patient_q = select(Patient).where(Patient.id == payload.patient_id)
    patient_res = await session.execute(patient_q)
    patient = patient_res.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Check if a lab record already exists for this patient
    q = select(LabReport).where(LabReport.patient_id == payload.patient_id)
    result = await session.execute(q)
    existing = result.scalars().first()

    if existing:
        # Update existing record (UPSERT)
        update_data = payload.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
    else:
        # Insert new record
        new_report = LabReport.from_orm(payload)
        session.add(new_report)
        await session.commit()
        await session.refresh(new_report)
        return new_report


@router.get("/{patient_id}", response_model=LabReportRead)
async def get_lab_report(patient_id: int, session: AsyncSession = Depends(get_session)):
    q = select(LabReport).where(LabReport.patient_id == patient_id)
    res = await session.execute(q)
    lab = res.scalars().first()
    if not lab:
        raise HTTPException(status_code=404, detail="No lab data found for this patient")
    return lab
