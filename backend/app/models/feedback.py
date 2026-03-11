from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from datetime import datetime

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    category = Column(String(50), nullable=False)  # UI/Performance/Features/Support
    message = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending/reviewed/resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    admin_response = Column(Text, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="feedbacks")
