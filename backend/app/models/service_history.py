from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from app.database.base import Base
from datetime import datetime

class ServiceHistory(Base):
    __tablename__ = "service_history"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, nullable=False)  # Reference to vehicle
    service_type = Column(String(100), nullable=False)  # Oil Change, Brake Service, etc.
    service_date = Column(DateTime, nullable=False)
    mileage = Column(Integer, nullable=False)
    cost = Column(Float, nullable=True)
    service_center = Column(String(200), nullable=True)
    technician = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    next_service_date = Column(DateTime, nullable=True)
    next_service_mileage = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
