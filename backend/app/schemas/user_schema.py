from pydantic import BaseModel, EmailStr # type: ignore
from typing import Optional
from datetime import datetime

class UserLogin(BaseModel):
    email: str
    role: str

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    role: str = "user"

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    role: str
    is_premium: bool = False
    premium_until: Optional[datetime] = None

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    role: str
    
    class Config:
        from_attributes = True