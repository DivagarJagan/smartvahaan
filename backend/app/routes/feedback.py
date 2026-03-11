from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.dependencies import get_current_user, get_db
from app.models.feedback import Feedback
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/feedback", tags=["Feedback"])

class FeedbackCreate(BaseModel):
    rating: int  # 1-5
    category: str  # UI/Performance/Features/Support/Other
    message: str

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    rating: int
    category: str
    message: str
    status: str
    created_at: datetime
    admin_response: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdminFeedbackUpdate(BaseModel):
    status: str
    admin_response: Optional[str] = None

@router.post("/submit", response_model=FeedbackResponse)
def submit_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Submit feedback about the application"""
    
    # Validate rating
    if feedback_data.rating < 1 or feedback_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Validate category
    valid_categories = ["UI", "Performance", "Features", "Support", "Other"]
    if feedback_data.category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {', '.join(valid_categories)}")
    
    # Create feedback
    feedback = Feedback(
        user_id=user["id"],
        rating=feedback_data.rating,
        category=feedback_data.category,
        message=feedback_data.message,
        status="pending"
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    return feedback

@router.get("/my-feedback")
def get_my_feedback(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get all feedback submitted by current user"""
    feedbacks = db.query(Feedback).filter(Feedback.user_id == user["id"]).order_by(Feedback.created_at.desc()).all()
    return {"feedbacks": feedbacks, "count": len(feedbacks)}

@router.get("/all")
def get_all_feedback(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get all feedback (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(Feedback).count()
    
    # Calculate statistics
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0
    
    return {
        "feedbacks": feedbacks,
        "total": total,
        "average_rating": round(avg_rating, 2),
        "pending_count": db.query(Feedback).filter(Feedback.status == "pending").count()
    }

@router.put("/{feedback_id}")
def update_feedback(
    feedback_id: int,
    update_data: AdminFeedbackUpdate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Update feedback status and add admin response (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.status = update_data.status # type: ignore
    if update_data.admin_response:
        feedback.admin_response = update_data.admin_response # pyright: ignore[reportAttributeAccessIssue]
    feedback.updated_at = datetime.utcnow() # type: ignore
    
    db.commit()
    db.refresh(feedback)
    
    return {"message": "Feedback updated successfully", "feedback": feedback}

@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Delete feedback (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db.delete(feedback)
    db.commit()
    
    return {"message": "Feedback deleted successfully"}

@router.get("/stats")
def get_feedback_stats(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get feedback statistics (admin only)"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total = db.query(Feedback).count()
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0
    
    # Get rating distribution
    rating_dist = {}
    for i in range(1, 6):
        rating_dist[f"{i}_stars"] = db.query(Feedback).filter(Feedback.rating == i).count()
    
    # Get category distribution
    categories = db.query(Feedback.category, func.count(Feedback.id)).group_by(Feedback.category).all()
    category_dist = {cat: count for cat, count in categories}
    
    return {
        "total_feedback": total,
        "average_rating": round(avg_rating, 2),
        "rating_distribution": rating_dist,
        "category_distribution": category_dist,
        "pending": db.query(Feedback).filter(Feedback.status == "pending").count(),
        "resolved": db.query(Feedback).filter(Feedback.status == "resolved").count()
    }
