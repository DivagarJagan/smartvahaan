from sqlalchemy import Column, Integer, String, DateTime # type: ignore
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
    
    # Relationships
    feedbacks = relationship("Feedback", back_populates="user")