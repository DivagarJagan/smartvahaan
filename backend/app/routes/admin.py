from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, Optional
from app.core.dependencies import get_current_user, get_db
from app.data.vehicles_data import VEHICLES
from app.models.user import User
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
    
    # Vehicle statistics
    total_vehicles = len(VEHICLES)
    
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
                {"id": u.id, "email": u.email, "created_at": u.created_at, "role": u.role}
                for u in recent_users
            ],
            "recent_feedback": [
                {"id": f.id, "rating": f.rating, "category": f.category, "created_at": f.created_at}
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
    
    # Get user's vehicles (from VEHICLES list)
    user_vehicles = [v for v in VEHICLES if v.get("user_email") == target_user.email]
    
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
            "average_rating": round(sum(f.rating for f in user_feedbacks) / len(user_feedbacks), 2) if user_feedbacks else 0  # type: ignore
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
def get_all_vehicles(user: Any = Depends(get_current_user)):
    """Get all vehicles for admin"""
    is_admin(user)
    return {"vehicles": VEHICLES, "total": len(VEHICLES)}

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, user: Any = Depends(get_current_user)):
    """Delete a vehicle"""
    is_admin(user)
    if vehicle_id >= len(VEHICLES):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    deleted_vehicle = VEHICLES.pop(vehicle_id)
    return {
        "message": "Vehicle deleted successfully",
        "vehicle": deleted_vehicle
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
            "total": len(VEHICLES),
            "active": len(VEHICLES)
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