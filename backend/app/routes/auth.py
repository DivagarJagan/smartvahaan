from fastapi import APIRouter, Depends # type: ignore
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserLogin
from app.core.security import create_access_token
from app.core.dependencies import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    # Find or create user (for development/demo purposes)
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        # Create a new user if doesn't exist
        user = User(
            email=data.email,
            role=data.role,
            first_name="Demo",
            last_name="User",
            phone="1234567890"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create JWT token with user id, email and role
    token = create_access_token(
        {"id": user.id, "email": user.email, "role": user.role, "sub": user.email}
    )
    return {"access_token": token, "token_type": "bearer"}