@echo off
echo ========================================
echo   SmartVahaan - Backend Startup
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] Activating Python Virtual Environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    echo Please ensure venv exists in the backend folder
    pause
    exit /b 1
)
echo ✓ Virtual environment activated
echo.

echo [2/3] Installing/Updating Dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo WARNING: Some dependencies might have failed to install
)
echo ✓ Dependencies checked
echo.

echo [3/3] Starting Backend Server...
echo.
echo ========================================
echo   Backend URL: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload

pause
