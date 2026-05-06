from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean # type: ignore
from datetime import datetime, timedelta
from app.database.base import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    plan_type = Column(String, default="premium")  # premium, pro, etc
    amount = Column(Float)
    currency = Column(String, default="INR")
    transaction_id = Column(String, unique=True)  # Payment gateway transaction ID
    status = Column(String, default="completed")  # pending, completed, failed, cancelled
    started_at = Column(DateTime, default=datetime.utcnow)
    expired_at = Column(DateTime)  # When the subscription expires
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Payment method info
    payment_method = Column(String, default="upi")  # upi, card, wallet, etc
    notes = Column(String, nullable=True)
