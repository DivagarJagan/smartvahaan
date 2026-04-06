from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean # type: ignore
from datetime import datetime
from app.database.base import Base

class Garage(Base):
    __tablename__ = "garages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String)
    email = Column(String)
    services = Column(String)  # Comma-separated services
    rating = Column(Float, default=4.5)
    is_certified = Column(Boolean, default=False)
    opening_time = Column(String, default="09:00")  # HH:MM format
    closing_time = Column(String, default="18:00")  # HH:MM format
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Demo flag to indicate if this is demo data
    is_demo = Column(Boolean, default=True)
