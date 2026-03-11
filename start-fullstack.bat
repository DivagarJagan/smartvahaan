@echo off
echo ========================================
echo   SmartVahaan - Full Stack Startup
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo in separate windows.
echo.
echo Press any key to continue...
pause >nul

echo.
echo [1/2] Starting Backend Server...
start "SmartVahaan Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "SmartVahaan Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo ========================================
echo   ✓ Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173/
echo API Docs: http://localhost:8000/docs
echo.
echo Two command windows have been opened.
echo Close them to stop the servers.
echo.
pause
