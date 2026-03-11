from sqlalchemy import Column, Integer, String, ForeignKey, DateTime # type: ignore
from datetime import datetime
from app.database.base import Base
# Shared vehicles data

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model = Column(String)
    fuel_type = Column(String)
    driving_pattern = Column(String)
    traffic_exposure = Column(String)
    road_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)