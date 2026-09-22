from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.schemas.user_schema import UserProfile, UserProfileUpdate, UserResponse
from app.core.dependencies import get_current_user, get_db
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=UserProfile)
def get_profile(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user's profile information
    """
    db_user = db.query(User).filter(User.email == user["email"]).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "first_name": db_user.first_name or "",
        "last_name": db_user.last_name or "",
        "email": db_user.email,
        "phone": db_user.phone or "",
        "role": db_user.role,
        "is_premium": bool(db_user.is_premium),
        "premium_until": db_user.premium_until
    }

@router.put("/profile", response_model=UserProfile)
def update_profile(
    profile_update: UserProfileUpdate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information
    """
    db_user = db.query(User).filter(User.email == user["email"]).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only provided fields
    update_data = profile_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    return {
        "first_name": db_user.first_name or "",
        "last_name": db_user.last_name or "",
        "email": db_user.email,
        "phone": db_user.phone or "",
        "role": db_user.role,
        "is_premium": bool(db_user.is_premium),
        "premium_until": db_user.premium_until
    }
