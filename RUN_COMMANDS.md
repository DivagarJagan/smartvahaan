# SmartVahaan - Complete Setup & Run Commands

## 🚀 Quick Start (For First Time Setup)

### Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Git** (optional, for version control)

---

## 📋 Complete Setup Instructions

### Step 1: Backend Setup (Python + FastAPI)

#### 1.1 Create & Activate Virtual Environment

```powershell
# Navigate to project root
cd c:\smartvahan

# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\activate

# Verify activation (you should see (.venv) in prompt)
```

#### 1.2 Install Backend Dependencies

```powershell
# Install all required packages from requirements.txt
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

# Verify installation
pip list
```

**Requirements Include:**

- FastAPI (web framework)
- Uvicorn (ASGI server)
- SQLAlchemy (database ORM)
- Pydantic (data validation)
- google-generativeai (Gemini AI)
- passlib, python-jose (authentication)
- email-validator (email validation)

---

### Step 2: Frontend Setup (React + Vite)

#### 2.1 Install Frontend Dependencies

```powershell
# Open new terminal or deactivate venv
# Navigate to frontend folder
cd c:\smartvahan\frontend

# Install all npm packages from package.json
npm install

# Verify installation
npm list --depth=0
```

**Dependencies Include:**

- React 18
- React Router DOM (routing)
- Recharts (charts/graphs)
- Axios (HTTP client)
- Lucide React (icons)

---

## 🏃 Running the Application

### Option 1: Run Everything with One Command (Recommended)

```powershell
# From project root (c:\smartvahan)
.\start-fullstack.bat
```

This batch file will:

1. Start backend on <http://localhost:8000>
2. Start frontend on <http://localhost:5173>
3. Run both in background

---

### Option 2: Run Backend and Frontend Separately

#### Terminal 1 - Backend Server

```powershell
# Navigate to project root
cd c:\smartvahan

# Activate virtual environment
.\.venv\Scripts\activate

# Navigate to backend folder
cd backend

# Run FastAPI server with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will start at:** <http://localhost:8000>
**API Docs:** <http://localhost:8000/docs>
**Alternative Docs:** <http://localhost:8000/redoc>

#### Terminal 2 - Frontend Dev Server

```powershell
# Navigate to frontend folder
cd c:\smartvahan\frontend

# Start Vite dev server
npm run dev
```

**Frontend will start at:** <http://localhost:5173>

---

### Option 3: Use Individual Batch Files

```powershell
# Start backend only
.\start-backend.bat

# OR use simple version
.\start-backend-simple.bat

# Start frontend only (in separate terminal)
.\start-frontend.bat
```

---

## 🗄️ Database Initialization

The backend automatically initializes the database on first run:

```powershell
# From backend folder with venv activated
cd c:\smartvahan\backend

# Run initialization script (creates admin user, populates data)
python app/init_data.py
```

**Default Admin User:**

- Email: `admin@smartvahaan.com`
- Password: `admin123`
- Role: Admin

**Sample Data Created:**

- Users from `mock-data/users.json`
- Vehicles from `mock-data/vehicles.json`
- Maintenance logs from `mock-data/maintenance_logs.json`

---

## ✅ Verification Steps

### 1. Check Backend is Running

```powershell
# Test API health endpoint
curl http://localhost:8000/

# Or open in browser
start http://localhost:8000/docs
```

Expected response: `{"message": "SmartVahaan API"}`

### 2. Check Frontend is Running

```powershell
# Test frontend
start http://localhost:5173
```

You should see the SmartVahaan login page with:

- Logo (dark/light mode adaptive)
- Email/password fields
- Demo credentials button

### 3. Test Full Stack Integration

1. Open <http://localhost:5173>
2. Login with:
   - Email: `admin@smartvahaan.com`
   - Password: `admin123`
3. Navigate to:
   - **Dashboard** - See vehicle overview
   - **Maintenance** - AI-powered suggestions
   - **Feedback** - Submit user feedback
   - **Admin** - Manage users (admin only)

---

## 🔧 Troubleshooting

### Backend Issues

#### Problem: Virtual environment activation fails

```powershell
# Solution: Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate again
.\.venv\Scripts\activate
```

#### Problem: Module not found errors

```powershell
# Solution: Reinstall requirements
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt --force-reinstall
```

#### Problem: Port 8000 already in use

```powershell
# Solution: Kill existing process
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

#### Problem: Port 5173 already in use

```powershell
# Solution: Kill existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Or use different port (edit vite.config.js)
npm run dev -- --port 5174
```

#### Problem: Frontend module errors

```powershell
# Solution: Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### Problem: Vite cache issues

```powershell
# Solution: Clear cache and restart
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

---

## 📁 Files & Their Usage

### Backend Files (All Used in Development)

| File/Folder | Purpose | Used By |
| ------------- | -------- | --------- |
| `backend/app/main.py` | FastAPI app entry point | Uvicorn server |
| `backend/app/init_data.py` | Database initialization | Manual/auto setup |
| `backend/app/core/config.py` | Environment configuration | All modules |
| `backend/app/core/security.py` | JWT & password hashing | Auth routes |
| `backend/app/models/` | SQLAlchemy database models | Database ORM |
| `backend/app/routes/` | API endpoints | FastAPI router |
| `backend/app/schemas/` | Pydantic validation schemas | API validation |
| `backend/app/services/` | Business logic services | Routes |
| `backend/requirements.txt` | Python dependencies | pip install |

### Frontend Files (All Used in Development)

| File/Folder | Purpose | Used By |
| ------------ | --------- | --------- |
| `frontend/src/main.jsx` | React app entry | Vite |
| `frontend/src/App.jsx` | Root component | React |
| `frontend/src/routes.jsx` | Route definitions | React Router |
| `frontend/src/pages/` | Page components | Router |
| `frontend/src/components/` | Reusable components | Pages |
| `frontend/src/services/` | API client services | Components |
| `frontend/src/context/` | Global state (Auth, Theme) | App-wide |
| `frontend/public/assets/` | Static assets (logos) | Components |
| `frontend/package.json` | npm dependencies | npm install |
| `frontend/vite.config.js` | Vite configuration | Dev server |

### Mock Data (Used in Database Initialization)

| File | Purpose | Loaded By |
| ------ | --------- | ----------- |
| `mock-data/users.json` | Sample users | init_data.py |
| `mock-data/vehicles.json` | Sample vehicles | init_data.py |
| `mock-data/maintenance_logs.json` | Sample logs | init_data.py |

### Documentation Files (Reference)

| File | Purpose |
| ------ | --------- |
| `START_HERE.md` | Getting started guide |
| `README.md` | Project overview |
| `QUICK_START_ENHANCED.md` | Enhanced quick start |
| `UI_FIXES_SUMMARY.md` | Recent UI bug fixes |
| `PREDICTIVE_MAINTENANCE_ARCHITECTURE.md` | AI architecture |
| `MAINTENANCE_FEATURE_GUIDE.md` | Feature documentation |
| `LOGIN_PAGE_REDESIGN.md` | Login redesign notes |
| `LOGO_UPDATE_SUMMARY.md` | Logo changes |
| `UI_ENHANCEMENT_GUIDE.md` | UI improvements |

### Batch Files (Quick Start Scripts)

| File | Purpose |
| ------ | --------- |
| `start-fullstack.bat` | Run both frontend & backend |
| `start-backend.bat` | Run backend only |
| `start-backend-simple.bat` | Simplified backend start |
| `start-frontend.bat` | Run frontend only |

---

## 🌐 Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/` folder (optional):

```env
# Database
DATABASE_URL=sqlite:///./smartvahaan.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend Environment Variables

Create `.env` file in `frontend/` folder (optional):

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
```

---

## 🎯 Development Workflow

### 1. Start Development Session

```powershell
# Terminal 1 - Backend
cd c:\smartvahan
.\.venv\Scripts\activate
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd c:\smartvahan\frontend
npm run dev
```

### 2. Make Changes

- **Backend**: Edit files in `backend/app/`, changes auto-reload
- **Frontend**: Edit files in `frontend/src/`, hot module replacement (HMR)

### 3. Test Changes

- **API**: <http://localhost:8000/docs> (Swagger UI)
- **Frontend**: <http://localhost:5173> (live browser)

### 4. Stop Servers

```powershell
# Press Ctrl+C in each terminal
# Or kill all processes:
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 📦 Production Build

### Build Frontend for Production

```powershell
cd c:\smartvahan\frontend
npm run build
```

Output: `frontend/dist/` folder with optimized static files

### Run Backend in Production Mode

```powershell
cd c:\smartvahan\backend
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🔥 Quick Commands Cheat Sheet

```powershell
# SETUP (First Time Only)
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend\requirements.txt
cd frontend; npm install

# RUN (Every Time)
.\start-fullstack.bat

# OR MANUALLY:
# Terminal 1: Backend
cd backend; ..\\.venv\Scripts\activate; uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend; npm run dev

# CLEAN RESTART
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item backend\smartvahaan.db -ErrorAction SilentlyContinue
.\start-fullstack.bat

# UPDATE DEPENDENCIES
pip install -r backend\requirements.txt --upgrade
cd frontend; npm update
```

---

## ✨ Features Verification

After starting both servers, verify these features work:

### Authentication

- ✅ Login with demo credentials
- ✅ Role-based access (Admin vs User)
- ✅ JWT token generation
- ✅ Protected routes

### AI Features

- ✅ Maintenance suggestions (Gemini AI)
- ✅ Risk analysis
- ✅ Predictive maintenance
- ✅ Driver behavior analysis

### UI Features

- ✅ Dark/Light theme toggle
- ✅ Responsive navbar with logo
- ✅ Dashboard with charts
- ✅ Feedback submission
- ✅ Service history tracking

### Data Management

- ✅ Vehicle CRUD operations
- ✅ User management (Admin)
- ✅ Telemetry data collection
- ✅ Maintenance logs

---

## 🎉 Success Indicators

Your setup is complete when you see:

### Backend

```text
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Frontend

```text
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

**🚀 You're all set! Start building with SmartVahaan!**

**Next Steps:**

1. Open <http://localhost:5173>
2. Login with admin credentials
3. Explore the dashboard
4. Test AI maintenance features
5. Submit feedback

**Need Help?** Check the troubleshooting section or documentation files in the project root.
