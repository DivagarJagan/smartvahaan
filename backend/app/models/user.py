from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from datetime import datetime
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    role = Column(String, default="user")  # user / admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Premium Features
    is_premium = Column(Boolean, default=False)
    premium_until = Column(DateTime, nullable=True)
    ai_chat_usage_count = Column(Integer, default=0)
    latitude = Column(Float, nullable=True)  # User's last known location
    longitude = Column(Float, nullable=True)  # User's last known location
    
    # Relationships
    feedbacks = relationship("Feedback", back_populates="user")