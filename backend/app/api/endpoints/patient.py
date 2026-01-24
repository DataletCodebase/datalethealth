from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_session
from backend.app.models.patient_model import Patient
from backend.app.schemas.patient import PatientCreate, PatientRead, PatientUpdate


router = APIRouter(
    tags=["patients"],
    prefix="/patients"
)

# -------------------------------
# 🧩 Create a new patient
# -------------------------------
@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    session: AsyncSession = Depends(get_session)
):
    # Ensure unique patient_code
    if payload.patient_code:
        q = select(Patient).where(Patient.patient_code == payload.patient_code)
        res = await session.execute(q)
        existing = res.scalars().first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Patient with this patient_code already exists."
            )

    # Create new patient record
    patient = Patient.from_orm(payload)
    session.add(patient)
    await session.commit()
    await session.refresh(patient)
    return patient

# -------------------------------
# 🧾 Get list of all patients
# -------------------------------
@router.get("/", response_model=List[PatientRead])
async def list_patients(
    limit: int = 100,
    session: AsyncSession = Depends(get_session)
):
    q = select(Patient).limit(limit)
    res = await session.execute(q)
    patients = res.scalars().all()
    return patients

# -------------------------------
# 🔍 Get single patient by ID
# -------------------------------
@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: int,
    session: AsyncSession = Depends(get_session)
):
    q = select(Patient).where(Patient.id == patient_id)
    res = await session.execute(q)
    patient = res.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

# -------------------------------
# ✏️ Update patient
# -------------------------------
@router.patch("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    session: AsyncSession = Depends(get_session)
):
    q = select(Patient).where(Patient.id == patient_id)
    res = await session.execute(q)
    patient = res.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient_data = payload.dict(exclude_unset=True)
    for key, value in patient_data.items():
        setattr(patient, key, value)

    session.add(patient)
    await session.commit()
    await session.refresh(patient)
    return patient

# -------------------------------
# ❌ Delete patient
# -------------------------------
@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: int,
    session: AsyncSession = Depends(get_session)
):
    q = select(Patient).where(Patient.id == patient_id)
    res = await session.execute(q)
    patient = res.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    await session.delete(patient)
    await session.commit()
    return None
