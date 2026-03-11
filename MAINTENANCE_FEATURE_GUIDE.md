# 🔧 Maintenance Suggestions Feature - Complete Guide

## Overview

The SmartVahaan AI-powered maintenance prediction system analyzes vehicles based on Indian road conditions and provides actionable maintenance recommendations with severity levels, timelines, and cost estimates.

---

## 🎯 Features Implemented

### 1. **AI-Powered Analysis**

- Uses Google Gemini AI for comprehensive vehicle health assessment
- Considers Indian-specific road conditions
- Provides detailed recommendations with reasoning

### 2. **Risk Scoring System**

- **Score Range**: 0-5
- **Factors Considered**:
  - Vehicle mileage
  - City road conditions (potholes)
  - Fuel type
  - Vehicle age
  - Usage patterns

### 3. **Severity Levels**

- **High** (Score ≥ 4): 🚨 Immediate attention required
- **Medium** (Score ≥ 2): ⚠️ Schedule maintenance within 2 weeks
- **Low** (Score < 2): ✅ Continue regular maintenance

### 4. **Component-Specific Recommendations**

Each recommendation includes:

- Component name (e.g., Suspension System, Brake Pads)
- Reason for maintenance
- Urgency level (High/Medium/Low)
- Estimated cost in INR

### 5. **Indian Road Conditions Integration**

- **Pothole-prone cities**: Mumbai, Bangalore, Chennai, Delhi, etc.
- **Coastal cities**: High humidity & corrosion risk
- **High pollution cities**: Frequent air filter changes
- **Monsoon-heavy regions**: Extra care for electrical components

---

## 📁 Files Changed/Created

### Backend Files

#### 1. **`backend/app/services/gemini_service.py`** ✨ Enhanced

**Changes**:

- Added `generate_maintenance_analysis()` - Full AI analysis using Gemini
- Added `calculate_maintenance_priority()` - Comprehensive risk assessment
- Considers multiple factors: mileage, city, fuel type, age
- Returns structured recommendations with timeline and costs

**Key Functions**:

```python
generate_maintenance_analysis(vehicle_data)  # AI-powered analysis
calculate_maintenance_priority(vehicle_data)  # Risk scoring & recommendations
```

---

#### 2. **`backend/app/routes/ai_predict.py`** ✨ Enhanced

**Changes**:

- Added new endpoint: `GET /ai/maintenance/suggestions`
- Added endpoint: `GET /ai/maintenance/vehicle/{vehicle_id}`
- Returns severity, recommendations, AI analysis, and next service date

**API Endpoints**:

```http
GET /ai/maintenance/suggestions          # Get suggestions for logged-in user
GET /ai/maintenance/vehicle/{id}         # Get maintenance for specific vehicle
POST /ai/predict?vehicle_id={id}         # Legacy endpoint (kept for compatibility)
```

---

#### 3. **`backend/app/services/rule_engine.py`** ✨ Enhanced

**Changes**:

- Improved risk scoring algorithm
- Added vehicle age factor
- Better handling of missing data
- Score capped at 5 for consistency

---

#### 4. **`backend/app/utils/indian_conditions.py`** ✨ Enhanced

**Changes**:

- Expanded city lists (10+ cities per category)
- Added coastal cities list
- Added high pollution cities
- Added monsoon-prone regions
- Added maintenance guidelines constants
- Added `get_city_risk_factors()` function

**Key Constants**:

```python
POTHOLE_CITIES = ["chennai", "bangalore", "mumbai", ...]
COASTAL_CITIES = ["mumbai", "chennai", "kochi", ...]
HIGH_POLLUTION_CITIES = ["delhi", "gurgaon", "noida", ...]
SERVICE_INTERVALS = {...}
MAINTENANCE_GUIDELINES = {...}
```

---

### Frontend Files

#### 5. **`frontend/src/services/aiService.js`** ✨ Enhanced

**Changes**:

- Connected to real backend API (no more hardcoded data!)
- Added error handling
- Added multiple service functions

**Functions**:

```javascript
getSuggestions()                    // Get maintenance suggestions
getVehicleMaintenance(vehicleId)    // Get vehicle-specific maintenance
predictMaintenance(vehicleId)       // Get AI prediction
```

---

#### 6. **`frontend/src/pages/MaintenanceSuggestions.jsx`** ✨ Complete Redesign

**Changes**:

- Beautiful, modern UI with color-coded severity
- Displays vehicle information
- Shows risk score
- Lists all recommendations with urgency badges
- Displays AI analysis in formatted text
- Shows Indian road conditions info
- Refresh button to fetch latest data
- Responsive grid layout

**Visual Features**:

- 🚨 High severity: Red border & icon
- ⚠️ Medium severity: Yellow/orange border & icon
- ✅ Low severity: Green border & icon
- Color-coded urgency badges on recommendations
- Cost estimates in INR
- Next service date display

---

## 🚀 Additional Features Added

### 1. **Timeline Predictions**

- Calculates next recommended service date
- Based on severity and current condition
- Displayed in user-friendly format

### 2. **Cost Estimation**

- Provides cost ranges in INR
- Based on component type
- Helps users budget for maintenance

### 3. **Multi-City Support**

- 30+ Indian cities covered
- City-specific risk factors
- Tailored recommendations based on location

### 4. **Component Tracking**

- Suspension system
- Brake pads & rotors
- Engine oil & filter
- Air filter
- Tire rotation & alignment
- Battery health

### 5. **Refresh Functionality**

- Real-time data fetching
- Updates recommendations on demand

### 6. **Error Handling**

- Graceful fallbacks if API fails
- User-friendly error messages
- Retry mechanisms

---

## 🔌 API Response Structure

### GET `/ai/maintenance/suggestions`

**Response**:

```json
{
  "severity": "Medium",
  "risk_score": 3,
  "message": "🔧 Based on Indian road conditions...",
  "recommendations": [
    {
      "component": "Suspension System",
      "reason": "High pothole density in Mumbai",
      "urgency": "High",
      "estimated_cost": "₹3,000 - ₹8,000"
    }
  ],
  "ai_analysis": "Detailed AI analysis text...",
  "next_service_date": "2026-03-15",
  "vehicle_info": {
    "make": "Maruti Suzuki",
    "model": "Swift",
    "mileage": 45000
  }
}
```

---

## 🎨 UI Components

### Severity Card

- Large, prominent display
- Color-coded border (red/yellow/green)
- Icon indicator
- Risk score
- Main message
- Next service date

### Recommendations Grid

- Responsive layout (cards)
- Component name
- Urgency badge (color-coded)
- Reason explanation
- Cost estimate in INR

### AI Analysis Section

- Pre-formatted text display
- Detailed breakdown
- Professional monospace font

### Indian Conditions Info

- Lists all factors considered
- Educational for users

---

## 🛠️ Usage Instructions

### For Users

1. **Add a Vehicle**:
   - Go to "Add Vehicle" section
   - Fill in details: make, model, year, mileage, city, fuel type
   - Submit

2. **View Maintenance Suggestions**:
   - Navigate to "Maintenance Suggestions"
   - View severity level and recommendations
   - Check cost estimates and timelines
   - Read AI analysis for detailed insights

3. **Take Action**:
   - Follow recommendations based on urgency
   - Schedule maintenance for high-priority items
   - Track next service date

### For Developers

**Run Backend**:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Run Frontend**:

```bash
cd frontend
npm install
npm run dev
```

**Test API**:

```bash
# Get maintenance suggestions
curl http://localhost:8000/ai/maintenance/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Backend URL
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Customize Maintenance Guidelines

Edit `backend/app/utils/indian_conditions.py`:

```python
SERVICE_INTERVALS = {
    "city_driving": 8000,  # Adjust as needed
    "highway_driving": 10000,
    # ...
}
```

---

## 📊 Risk Scoring Logic

```text
Score Calculation:
- Mileage > 80,000 km: +3 points
- Mileage > 50,000 km: +2 points
- Mileage > 30,000 km: +1 point
- Pothole-prone city: +2 points
- Diesel vehicle: +1 point
- Vehicle age > 10 years: +2 points
- Vehicle age > 5 years: +1 point

Total Score (0-5) → Severity Level:
- 4-5: High
- 2-3: Medium
- 0-1: Low
```

---

## 🎯 Future Enhancements (Planned)

1. **Maintenance History Tracking**
   - Store past maintenance records
   - Track spending over time

2. **Push Notifications**
   - Alert users when maintenance is due
   - Reminders for upcoming service

3. **Service Provider Integration**
   - Find nearby service centers
   - Compare prices
   - Book appointments

4. **Predictive Analytics**
   - Machine learning for failure prediction
   - Historical data analysis

5. **Multi-Vehicle Support**
   - Switch between vehicles
   - Compare maintenance costs

6. **Export Reports**
   - Download PDF reports
   - Share with mechanics

---

## 🐛 Troubleshooting

### Issue: "AI analysis unavailable"

**Solution**: Check your Gemini API key in `.env` file

### Issue: "No vehicles registered"

**Solution**: Add a vehicle first before checking maintenance

### Issue: Frontend not connecting to backend

**Solution**:

1. Check backend is running on port 8000
2. Verify CORS settings in `main.py`
3. Check API base URL in `frontend/src/services/api.js`

### Issue: Module not found errors

**Solution**:

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

---

## 📝 Testing the Feature

### Manual Testing Steps

1. **Start Backend**:

   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow**:
   - Login/Register
   - Add a vehicle with these details:
     - Make: Maruti Suzuki
     - Model: Swift
     - Year: 2018
     - Mileage: 55000
     - City: Mumbai
     - Fuel Type: Petrol
   - Navigate to "Maintenance Suggestions"
   - Verify:
     - ✅ Severity shows "Medium" or "High"
     - ✅ Recommendations appear
     - ✅ Cost estimates shown
     - ✅ AI analysis displayed
     - ✅ Next service date shown

---

## 📞 Support

For issues or questions:

- Check the code comments
- Review API documentation at `http://localhost:8000/docs`
- Check browser console for errors
- Verify backend logs

---

## ✅ Summary

**What was fixed**:

- ❌ Hardcoded maintenance data → ✅ Real AI-powered analysis
- ❌ No Indian conditions → ✅ Full Indian road conditions integration
- ❌ Basic UI → ✅ Rich, interactive UI with color coding
- ❌ No recommendations → ✅ Component-specific recommendations
- ❌ No cost info → ✅ Cost estimates in INR

**Key Benefits**:

- 🎯 Accurate predictions based on real data
- 🇮🇳 Tailored for Indian road conditions
- 💰 Cost transparency
- ⏰ Timeline guidance
- 🤖 AI-powered insights

---

**Created by**: SmartVahaan Development Team
**Last Updated**: March 2, 2026
**Version**: 2.0
