@echo off
REM Navigate to the script's directory (project root)
cd /d "%~dp0"

echo Starting Kidney Agent Python Backend...
echo ---------------------------------------

REM Run uvicorn using the virtual environment's Python executable directly
REM This bypasses PowerShell execution policy issues with Activate.ps1
".venv\Scripts\python.exe" -m uvicorn backend.app.main:app --reload


pause
