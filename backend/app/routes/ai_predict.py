from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from app.core.dependencies import get_current_user
from app.core.dependencies import get_db
from app.data.vehicles_data import VEHICLES # type: ignore
from app.services.gemini_service import calculate_maintenance_priority, generate_maintenance_analysis
import google.generativeai as genai # type: ignore
import os
from pydantic import BaseModel # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Predictions"])

# ── Configure Gemini AI at module load ─────────────────────────────────────────
_gemini_api_key = os.getenv("GEMINI_API_KEY")
_gemini_model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
if _gemini_api_key:
    genai.configure(api_key=_gemini_api_key)
model = genai.GenerativeModel(_gemini_model_name)

FREE_CHAT_LIMIT = 10


class ChatHistoryItem(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatHistoryItem] = []


def _get_db_user(current_user: dict, db: Session) -> User:
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _usage_payload(user: User) -> dict:
    used = int(getattr(user, "ai_chat_usage_count", 0) or 0)
    is_premium = bool(getattr(user, "is_premium", False))
    remaining = max(0, FREE_CHAT_LIMIT - used) if not is_premium else None
    return {
        "is_premium": is_premium,
        "used": used,
        "free_limit": FREE_CHAT_LIMIT,
        "remaining": remaining,
    }


@router.get("/chat/usage")
def get_chat_usage(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = _get_db_user(user, db)
    return _usage_payload(db_user)


@router.post("/chat")
def chat_with_ai(
    payload: ChatRequest,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = _get_db_user(user, db)
    usage = _usage_payload(db_user)

    if not usage["is_premium"] and usage["used"] >= FREE_CHAT_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "code": "FREE_LIMIT_REACHED",
                "message": "Free AI chat limit reached. Upgrade to Premium for unlimited chats.",
                "usage": usage,
            },
        )

    prompt_message = payload.message.strip()
    if not prompt_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI service is not configured on backend")

    recent_history = payload.history[-6:]
    history_lines = []
    for item in recent_history:
        role = "Assistant" if item.role == "ai" else "User"
        history_lines.append(f"{role}: {item.text}")

    prompt = "\n".join([
        "You are SmartVahaan AI, an automotive assistant focused on four-wheelers,",
        "maintenance troubleshooting, and practical advice.",
        "Reply in the same language as the user message. Keep responses concise and useful.",
        "",
        "Recent conversation:",
        *history_lines,
        "",
        f"User: {prompt_message}",
        "Assistant:",
    ])

    try:
        response = model.generate_content(prompt)
        reply_text = (response.text or "").strip()
        if not reply_text:
            reply_text = "I couldn't generate a response this time. Please try again."
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI provider error: {str(exc)}")

    if not usage["is_premium"]:
        current_used = int(getattr(db_user, "ai_chat_usage_count", 0) or 0)
        setattr(db_user, "ai_chat_usage_count", current_used + 1)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    return {
        "reply": reply_text,
        "usage": _usage_payload(db_user),
    }


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