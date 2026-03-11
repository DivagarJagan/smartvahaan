# 🚀 Backend Deployment Guide (Railway/Render)

## 📋 Backend Deployment Options

Your FastAPI backend can be deployed to various platforms. This guide covers the two easiest free options:

---

## 🚂 Option 1: Railway (Recommended)

### **Why Railway?**
- ✅ Free tier with 500 hours/month
- ✅ Auto-detects Python projects
- ✅ Easy GitHub integration
- ✅ Free PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Fast deployments

### **Step-by-Step Deployment:**

#### **1. Prepare Your Repository**
Make sure these files exist (already done ✅):
- `backend/requirements.txt` - Python dependencies
- `backend/app/main.py` - FastAPI application
- `backend/.env.example` - Environment template

#### **2. Sign Up on Railway**
1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your repositories

#### **3. Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `smartvahan` repository
4. Railway will auto-detect it's a Python project

#### **4. Configure Build Settings**
Railway usually auto-detects, but verify:
- **Root Directory**: `backend/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

If not auto-detected, create `railway.json` in backend folder:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **5. Set Environment Variables**
In Railway dashboard → Your service → Variables tab:

**Required:**
```env
PORT=8000
DATABASE_URL=sqlite:///./smartvahan.db
JWT_SECRET_KEY=prod-secret-key-change-me-to-random-string
CORS_ORIGINS=https://your-frontend.vercel.app
```

**Optional (for AI features):**
```env
GOOGLE_API_KEY=your-google-gemini-api-key
```

**⚠️ IMPORTANT:** After deploying frontend to Vercel, update `CORS_ORIGINS`:
```env
CORS_ORIGINS=https://your-app.vercel.app,https://smartvahan.vercel.app
```

#### **6. Deploy**
1. Click "Deploy" (or push to GitHub - auto-deploys)
2. Wait 2-3 minutes for first deployment
3. Railway provides a URL like: `https://smartvahan-production.up.railway.app`

#### **7. Test Your Backend**
Visit: `https://your-backend-url.up.railway.app/docs`

You should see the FastAPI Swagger UI! Test endpoints.

---

## 🎨 Option 2: Render

### **Why Render?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Simple setup
- ✅ Good documentation

### **Step-by-Step Deployment:**

#### **1. Sign Up on Render**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

#### **2. Create Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `smartvahan` repo

#### **3. Configure Service**
Fill in the form:

**Basic:**
- **Name**: `smartvahan-backend`
- **Region**: Choose closest to your users (Singapore for India)
- **Branch**: `main`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Choose `Free` (good for testing, but spins down after 15 min inactivity)

#### **4. Environment Variables**
Add in Render dashboard:

```env
PORT=10000
DATABASE_URL=sqlite:///./smartvahan.db
JWT_SECRET_KEY=prod-secret-key-change-me-to-random-string
CORS_ORIGINS=https://your-frontend.vercel.app
PYTHON_VERSION=3.11.0
```

#### **5. Deploy**
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Render provides URL: `https://smartvahan.onrender.com`

#### **6. Test**
Visit: `https://smartvahan.onrender.com/docs`

---

## 🗄️ Database Options

### **SQLite (Current Setup) - Local File Database**
**Pros:**
- ✅ No setup needed
- ✅ Free
- ✅ Simple

**Cons:**
- ❌ Data lost on redeployment (Railway/Render may wipe filesystem)
- ❌ Not suitable for production with multiple instances

**Current config:**
```env
DATABASE_URL=sqlite:///./smartvahan.db
```

### **PostgreSQL (Recommended for Production)**

#### **With Railway:**
1. In Railway → "New" → "Database" → "Add PostgreSQL"
2. Railway auto-generates `DATABASE_URL`
3. Link database to your service
4. Update your code to use PostgreSQL:

```bash
# Add to backend/requirements.txt
psycopg2-binary==2.9.9
```

```python
# backend/app/database/session.py
# Change SQLite to PostgreSQL
from sqlalchemy import create_engine
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # For PostgreSQL
    echo=True
)
```

---

## 🔧 Post-Deployment Configuration

### **1. Update Frontend Environment Variable**

After backend is deployed, update your Vercel environment variable:

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Update `VITE_API_URL` to your backend URL:
   ```
   VITE_API_URL=https://smartvahan-production.up.railway.app
   ```
4. Redeploy frontend for changes to take effect

### **2. Update Backend CORS**

Update `CORS_ORIGINS` in Railway/Render to include your Vercel URL:
```env
CORS_ORIGINS=https://your-app.vercel.app
```

**For both localhost and production:**
```env
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### **3. Verify Integration**

Test the full stack:
1. Visit your Vercel frontend
2. Try logging in
3. Check if data loads
4. Open browser DevTools → Network tab
5. Verify API calls go to your Railway/Render URL

---

## 🐛 Troubleshooting

### **CORS Errors**
**Symptom:** Browser console shows "CORS policy blocked"

**Solution:**
1. Verify `CORS_ORIGINS` includes your Vercel URL (with HTTPS)
2. No trailing slash in URL
3. Restart backend service after changing env vars

### **502 Bad Gateway**
**Symptom:** Backend URL returns 502

**Solution:**
1. Check Railway/Render logs
2. Verify start command is correct
3. Check if port binding is correct (`--host 0.0.0.0 --port $PORT`)

### **Database Errors**
**Symptom:** "no such table" errors

**Solution:**
1. SQLite file might not persist
2. Consider using Railway PostgreSQL
3. Ensure tables are created on startup (check `app/main.py` startup event)

### **Module Not Found**
**Symptom:** Import errors in logs

**Solution:**
1. Verify all dependencies in `requirements.txt`
2. Check Python version compatibility
3. Clear build cache and redeploy

---

## 📊 Monitoring & Logs

### **Railway:**
- Dashboard → Your service → "Deployments" tab
- Click deployment to see logs
- Real-time log streaming

### **Render:**
- Dashboard → Your service → "Logs" tab
- Shows startup and runtime logs
- Filter by level (info, error, etc.)

---

## 💰 Cost Estimates

### **Railway Free Tier:**
- 500 execution hours/month
- $5 credit/month
- Good for 1-2 small projects

### **Render Free Tier:**
- Unlimited hours BUT spins down after 15 min inactivity
- Slow cold starts (takes 30+ seconds to wake up)
- Good for demos, not production

### **Production Recommendations:**
- **Railway Hobby Plan:** $5/month - No spin-down, better performance
- **Render Starter:** $7/month - Always on, faster

---

## 🔄 Continuous Deployment

Both platforms support auto-deployment:

```bash
# Make changes
git add .
git commit -m "Update backend"
git push origin main

# Railway/Render auto-detects push and redeploys!
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL accessible (test `/docs` endpoint)
- [ ] Environment variables set correctly
- [ ] CORS includes frontend Vercel URL
- [ ] JWT secret key changed from default
- [ ] Database connected and working
- [ ] Frontend `VITE_API_URL` updated to backend URL
- [ ] Login works end-to-end
- [ ] API calls succeed from frontend
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 🎉 Success Indicators

Your backend is working correctly when:

1. ✅ `/docs` shows Swagger UI
2. ✅ Root endpoint `/` returns JSON with status
3. ✅ No CORS errors in browser console
4. ✅ Frontend can login successfully
5. ✅ Data loads from backend
6. ✅ Logs show no errors

---

## 📝 Quick Command Reference

```bash
# Test backend locally
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Test specific endpoint
curl https://your-backend.railway.app/

# View deployed logs
# Railway: Dashboard → Logs
# Render: Dashboard → Logs tab
```

---

## 🔗 Integration with Frontend

After backend deployment:

1. Copy your backend URL
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Set: `VITE_API_URL=https://your-backend.railway.app`
4. Redeploy frontend
5. Test full integration

---

**Last Updated:** March 11, 2026
**Status:** ✅ Backend ready for deployment
