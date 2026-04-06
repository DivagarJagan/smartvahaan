from sqlalchemy import Column, Integer, String, ForeignKey, DateTime # type: ignore
from datetime import datetime
from app.database.base import Base
# Shared vehicles data

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    fuel_type = Column(String)
    city = Column(String)
    mileage = Column(Integer)
    registration_number = Column(String)
    last_service_date = Column(DateTime)
    driving_pattern = Column(String)
    traffic_exposure = Column(String)
    road_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)