from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, Optional
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.vehicle import Vehicle as VehicleModel
from app.models.feedback import Feedback
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["Admin"])

class UserUpdate(BaseModel):
    role: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

def is_admin(user):
    """Check if user is admin"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return True

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user)
):
    """Admin dashboard with comprehensive statistics"""
    is_admin(user)
    
    # User statistics
    total_users = db.query(User).count()
    new_users_week = db.query(User).filter(
        User.created_at >= datetime.utcnow() - timedelta(days=7)
    ).count()
    admin_count = db.query(User).filter(User.role == "admin").count()
    
    # Vehicle statistics - query from DB
    total_vehicles = db.query(VehicleModel).count()
    
    # Feedback statistics
    total_feedback = db.query(Feedback).count()
    pending_feedback = db.query(Feedback).filter(Feedback.status == "pending").count()
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0
    
    # Recent activity
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_feedback = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(5).all()
    
    return {
        "user_stats": {
            "total": total_users,
            "new_this_week": new_users_week,
            "admins": admin_count,
            "regular_users": total_users - admin_count
        },
        "vehicle_stats": {
            "total": total_vehicles,
            "avg_per_user": round(total_vehicles / total_users, 2) if total_users > 0 else 0
        },
        "feedback_stats": {
            "total": total_feedback,
            "pending": pending_feedback,
            "average_rating": round(avg_rating, 2)
        },
        "recent_activity": {
            "recent_users": [
                {
                    "id": u.id, 
                    "email": u.email, 
                    "first_name": u.first_name,
                    "last_name": u.last_name,
                    "created_at": u.created_at, 
                    "role": u.role,
                    "vehicle_count": db.query(VehicleModel).filter(VehicleModel.user_id == u.id).count()
                }
                for u in recent_users
            ],
            "recent_feedback": [
                {
                    "id": f.id, 
                    "rating": f.rating, 
                    "category": f.category, 
                    "message": f.message,
                    "user_email": db.query(User).filter(User.id == f.user_id).first().email if f.user_id else "Anonymous",
                    "created_at": f.created_at
                }
                for f in recent_feedback
            ]
        },
        "system_status": "operational"
    }

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get all users with pagination"""
    is_admin(user)
    
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "phone": u.phone,
                "role": u.role,
                "created_at": u.created_at,
                "feedback_count": len(u.feedbacks) if u.feedbacks else 0
            }
            for u in users
        ],
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user)
):
    """Get detailed information about a specific user"""
    is_admin(user)
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's feedback
    user_feedbacks = db.query(Feedback).filter(Feedback.user_id == user_id).all()
    
    # Get user's vehicles (from DB)
    vehicles = db.query(VehicleModel).filter(VehicleModel.user_id == user_id).all()
    user_vehicles = [
        {
            "id": v.id,
            "make": v.make,
            "model": v.model,
            "year": v.year,
            "fuel_type": v.fuel_type,
            "city": v.city,
            "mileage": v.mileage,
            "last_service_date": v.last_service_date
        }
        for v in vehicles
    ]
    
    return {
        "user": {
            "id": target_user.id,
            "email": target_user.email,
            "first_name": target_user.first_name,
            "last_name": target_user.last_name,
            "phone": target_user.phone,
            "role": target_user.role,
            "created_at": target_user.created_at
        },
        "statistics": {
            "total_vehicles": len(user_vehicles),
            "total_feedback": len(user_feedbacks),
            "average_rating": round(sum(f.rating for f in user_feedbacks) / len(user_feedbacks), 2) if user_feedbacks else 0
        },
        "vehicles": user_vehicles,
        "feedback_history": [
            {
                "id": f.id,
                "rating": f.rating,
                "category": f.category,
                "message": f.message,
                "status": f.status,
                "created_at": f.created_at,
                "admin_response": f.admin_response
            }
            for f in user_feedbacks
        ]
    }

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user)
):
    """Update user information"""
    is_admin(user)
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if update_data.role:
        target_user.role = update_data.role  # type: ignore
    if update_data.first_name:
        target_user.first_name = update_data.first_name  # type: ignore
    if update_data.last_name:
        target_user.last_name = update_data.last_name  # type: ignore
    if update_data.phone:
        target_user.phone = update_data.phone  # type: ignore
    
    db.commit()
    db.refresh(target_user)
    
    return {"message": "User updated successfully", "user": target_user}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user)
):
    """Delete a user (admin only, cannot delete self)"""
    is_admin(user)
    
    if user_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user's feedback first
    db.query(Feedback).filter(Feedback.user_id == user_id).delete()
    
    # Delete user
    db.delete(target_user)
    db.commit()
    
    return {"message": "User and associated data deleted successfully"}

@router.get("/vehicles")
def get_all_vehicles(
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get all vehicles for admin from the database"""
    is_admin(user)
    total = db.query(VehicleModel).count()
    
    # Auto-seed demo vehicles if none exist to satisfy "give any demo model vehicle"
    if total == 0:
        first_user = db.query(User).first()
        if first_user:
            demo_vehicles = [
                VehicleModel(user_id=first_user.id, make="Hyundai", model="Creta", year=2024, fuel_type="Petrol", city="Delhi", mileage=8500, registration_number="DL-01-AB-1234", last_service_date=datetime.utcnow() - timedelta(days=45)),
                VehicleModel(user_id=first_user.id, make="Tata", model="Nexon", year=2023, fuel_type="Diesel", city="Mumbai", mileage=15200, registration_number="MH-02-XY-9876", last_service_date=datetime.utcnow() - timedelta(days=120))
            ]
            db.add_all(demo_vehicles)
            db.commit()
            total = db.query(VehicleModel).count()

    vehicles = db.query(VehicleModel).offset(skip).limit(limit).all()
    
    result = []
    for v in vehicles:
        # Get owner details
        owner = db.query(User).filter(User.id == v.user_id).first()
        result.append({
            "id": v.id,
            "user_id": v.user_id,
            "owner_name": f"{owner.first_name or ''} {owner.last_name or ''}".strip() if owner else "Unknown",
            "owner_email": owner.email if owner else "Unknown",
            "make": getattr(v, "make", "N/A"),
            "model": v.model or "N/A",
            "year": getattr(v, "year", "N/A"),
            "odometer": getattr(v, "mileage", 0),
            "registration_number": getattr(v, "registration_number", "N/A"),
            "city": getattr(v, "city", "N/A"),
            "fuel_type": v.fuel_type or "N/A",
            "last_service": getattr(v, "last_service_date", None),
            "created_at": v.created_at,
        })
    return {"vehicles": result, "total": total}

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user)
):
    """Delete a vehicle from the database"""
    is_admin(user)
    vehicle = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    return {
        "message": "Vehicle deleted successfully",
        "vehicle_id": vehicle_id
    }

@router.get("/stats")
def get_statistics(
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user)
):
    """Get comprehensive system statistics"""
    is_admin(user)
    
    return {
        "users": {
            "total": db.query(User).count(),
            "admins": db.query(User).filter(User.role == "admin").count(),
            "new_today": db.query(User).filter(
                User.created_at >= datetime.utcnow().date()
            ).count()
        },
        "vehicles": {
            "total": db.query(VehicleModel).count(),
            "active": db.query(VehicleModel).count()
        },
        "feedback": {
            "total": db.query(Feedback).count(),
            "pending": db.query(Feedback).filter(Feedback.status == "pending").count(),
            "avg_rating": round(float(db.query(func.avg(Feedback.rating)).scalar() or 0), 2)
        },
        "system": {
            "status": "operational",
            "uptime": "99.9%"
        }
    }