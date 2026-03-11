from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.core.dependencies import get_current_user
from app.data.vehicles_data import VEHICLES # type: ignore
from app.services.gemini_service import calculate_maintenance_priority, generate_maintenance_analysis
import google.generativeai as genai # type: ignore
import os

router = APIRouter(prefix="/ai", tags=["AI Predictions"])

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"))

@router.get("/maintenance/suggestions")
def get_maintenance_suggestions(
    user=Depends(get_current_user),
    include_ai: bool = False  # Make AI analysis optional for faster response
):
    """
    Get AI-powered maintenance suggestions for user's vehicles
    Fast mode: Returns rule-based analysis immediately
    Full mode: Includes Gemini AI analysis (slower but more detailed)
    """
    if not VEHICLES:
        return {
            "severity": "Low",
            "message": "No vehicles registered. Please add a vehicle first.",
            "recommendations": [],
            "ai_analysis": None,
            "processing_time": "instant"
        }
    
    # Get the first vehicle (or most recently added)
    vehicle = VEHICLES[-1] if VEHICLES else {}
    
    # Add default values if missing
    vehicle_data = {
        "make": vehicle.get("make", "Unknown"),
        "model": vehicle.get("model", "Unknown"),
        "year": vehicle.get("year", 2020),
        "mileage": vehicle.get("mileage", 0),
        "city": vehicle.get("city", "Mumbai"),
        "fuel_type": vehicle.get("fuel_type", "Petrol"),
        "last_service_date": vehicle.get("last_service_date", "Not recorded"),
        "usage_pattern": vehicle.get("usage_pattern", "Regular"),
        "distance": vehicle.get("mileage", 0)  # For rule engine compatibility
    }
    
    # Calculate comprehensive maintenance priority (fast - rule based)
    analysis = calculate_maintenance_priority(vehicle_data, include_ai=include_ai)
    
    # Format message based on severity
    if analysis["severity"] == "High":
        message = "⚠️ URGENT: Immediate maintenance required! Your vehicle shows critical wear patterns typical of Indian road conditions."
    elif analysis["severity"] == "Medium":
        message = "🔧 Based on Indian road conditions and your usage, a suspension inspection within 2 weeks is recommended."
    else:
        message = "✅ Your vehicle is in good condition. Continue regular maintenance schedule."
    
    return {
        "severity": analysis["severity"],
        "risk_score": analysis["risk_score"],
        "message": message,
        "recommendations": analysis["recommendations"],
        "ai_analysis": analysis.get("ai_analysis"),
        "next_service_date": analysis["next_service_date"],
        "vehicle_info": {
            "make": vehicle_data["make"],
            "model": vehicle_data["model"],
            "mileage": vehicle_data["mileage"]
        },
        "processing_time": "fast" if not include_ai else "detailed"
    }

@router.get("/maintenance/vehicle/{vehicle_id}")
def get_vehicle_maintenance(vehicle_id: int, user=Depends(get_current_user)):
    """
    Get maintenance analysis for a specific vehicle
    """
    if vehicle_id >= len(VEHICLES) or vehicle_id < 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = VEHICLES[vehicle_id]
    vehicle_data = {
        "make": vehicle.get("make", "Unknown"),
        "model": vehicle.get("model", "Unknown"),
        "year": vehicle.get("year", 2020),
        "mileage": vehicle.get("mileage", 0),
        "city": vehicle.get("city", "Mumbai"),
        "fuel_type": vehicle.get("fuel_type", "Petrol"),
        "last_service_date": vehicle.get("last_service_date", "Not recorded"),
        "usage_pattern": vehicle.get("usage_pattern", "Regular"),
        "distance": vehicle.get("mileage", 0)
    }
    
    analysis = calculate_maintenance_priority(vehicle_data)
    
    return {
        "vehicle_id": vehicle_id,
        "vehicle": vehicle,
        "severity": analysis["severity"],
        "recommendations": analysis["recommendations"],
        "ai_analysis": analysis["ai_analysis"],
        "next_service_date": analysis["next_service_date"]
    }

@router.post("/predict")
def predict_maintenance(vehicle_id: int, user=Depends(get_current_user)):
    """Legacy endpoint - use /maintenance/suggestions instead"""
    if vehicle_id >= len(VEHICLES):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = VEHICLES[vehicle_id]
    
    # Generate AI prediction
    prompt = f"""
    Analyze this vehicle for maintenance prediction:
    Make: {vehicle.get('make')}
    Model: {vehicle.get('model')}
    Year: {vehicle.get('year')}
    Mileage: {vehicle.get('mileage')} km
    Last Service: {vehicle.get('last_service_date')}
    
    Provide maintenance recommendations and predict next service date.
    """
    
    try:
        response = model.generate_content(prompt)
        return {
            "vehicle": vehicle,
            "prediction": response.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI prediction failed: {str(e)}")

@router.get("/vehicles/{vehicle_id}/health")
def get_vehicle_health(vehicle_id: int, user=Depends(get_current_user)):
    if vehicle_id >= len(VEHICLES):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = VEHICLES[vehicle_id]
    return {"vehicle": vehicle, "status": "healthy"}