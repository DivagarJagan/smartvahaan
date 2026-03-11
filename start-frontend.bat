@echo off
echo ========================================
echo   SmartVahaan - Frontend Startup
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/3] Checking Node.js Installation...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

echo [2/3] Installing/Updating Dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo [3/3] Starting Frontend Server...
echo.
echo ========================================
echo   Frontend will open at:
echo   http://localhost:5173/
echo   (or next available port)
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
