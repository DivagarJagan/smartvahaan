# SmartVahaan Backend Startup Script
$ErrorActionPreference = "Stop"

Write-Host "Starting SmartVahaan Backend..." -ForegroundColor Cyan

# Set working directory to backend folder
Set-Location "c:\smartvahan\backend"

# Run uvicorn server
& "c:\smartvahan\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
