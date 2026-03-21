from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

import urllib.parse

# Load .env file
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")

encoded_password = urllib.parse.quote_plus(DB_PASSWORD) if DB_PASSWORD else ""

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ✅ IMPORT ALL MODELS

from backend.app.models.patient_model import Patient
from backend.app.models.lab_report_model import LabReport
from backend.app.models.lead_model import Lead
from backend.app.models.water_intake_model import WaterIntakeLog
from backend.app.models.chat_memory_model import ChatMemory

# 👉 Diet system
from backend.app.models.diet_model import DietPlan, DietMeal
from backend.app.models.meal_tracking_model import MealTracking
