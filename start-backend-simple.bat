@echo off
echo Starting SmartVahaan Backend...
cd /d "%~dp0backend"
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
