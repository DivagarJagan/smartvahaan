# 🚀 SmartVahaan - Quick Start Guide

## Current Status: ✅ Backend Running

Your backend server should now be running successfully!

---

## 📍 What You Have Open

**Terminal:** `C:\smartvahan\backend` with `venv` activated  
**Command Running:** `python.exe -m uvicorn app.main:app --reload --port 8000`

---

## ✅ Verify Backend is Running

In your terminal, you should see:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

If you see `Application startup complete.` ✅ **You're good to go!**

---

## 🌐 Test Your Backend

Open these URLs in your browser:

1. **API Docs:** <http://localhost:8000/docs>
2. **Alternative Docs:** <http://localhost:8000/redoc>
3. **Root Endpoint:** <http://localhost:8000>

You should see the interactive API documentation (Swagger UI).

---

## 🎨 Start the Frontend

Open a **NEW terminal** (keep the backend running) and run:

```powershell
cd c:\smartvahan\frontend
npm run dev
```

Then open: **<http://localhost:5173>**

---

## 🔐 Login Credentials

- **Email:** `admin@smartvahaan.com`
- **Password:** `admin123`

---

## 🛠️ Available Features

### ✅ Working (Fully Functional)

- 🔐 **Authentication** - Login/logout
- 🚗 **Vehicles** - View and manage vehicles
- 🤖 **AI Predictions** - Maintenance suggestions  
- 📊 **Dashboard** - Overview and analytics
- 💬 **Feedback** - Submit and view feedback
- 📝 **Service History** - Track maintenance records
- 👥 **Admin Panel** - User management (admin only)
- 🔮 **Predictive Maintenance** - AI-powered predictions

### ⚠️ Temporarily Disabled

- 📡 **Telemetry/OBD Data** - Disabled due to database schema issues

The telemetry module will be re-enabled once the foreign key constraints are properly resolved.

---

## 📝 Common Commands

### Stop the Backend

In the backend terminal, press: **Ctrl + C**

### Stop All Servers

```powershell
Get-Process -Name python,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Restart Backend

```powershell
cd c:\smartvahan\backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

### Restart Frontend

```powershell
cd c:\smartvahan\frontend
npm run dev
```

---

## 🔍 Troubleshooting

### Backend doesn't respond

1. Check if the terminal shows "Application startup complete"
2. Wait 5-10 seconds after startup for the server to be fully ready
3. Try: <http://localhost:8000/docs>

### Frontend can't connect to backend

1. Verify backend is running on port 8000
2. Check for CORS errors in browser console
3. Ensure both servers are running simultaneously

### Database errors

```powershell
cd c:\smartvahan\backend
Remove-Item smartvahaan.db -Force
# Then restart the backend - it will recreate the database
```

---

## 📚 Full Documentation

- **[WORKING_RUN_COMMANDS.md](WORKING_RUN_COMMANDS.md)** - Detailed setup and troubleshooting
- **[RUN_COMMANDS.md](RUN_COMMANDS.md)** - Comprehensive reference guide
- **[UI_FIXES_SUMMARY.md](UI_FIXES_SUMMARY.md)** - Recent UI improvements

---

## 🎯 Next Steps

1. ✅ Verify backend is running (check terminal output)
2. ✅ Open <http://localhost:8000/docs> to see API docs
3. ✅ Start frontend in a new terminal
4. ✅ Open <http://localhost:5173> and login
5. ✅ Explore the dashboard and features!

---

**💡 Pro Tip:** Keep both terminals open side-by-side to monitor logs from both backend and frontend while developing.

**🎉 Happy coding with SmartVahaan!**
