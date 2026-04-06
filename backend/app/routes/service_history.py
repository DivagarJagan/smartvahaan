from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.service_history import ServiceHistory
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/service-history", tags=["Service History"])

class ServiceHistoryCreate(BaseModel):
    vehicle_id: int
    service_type: str
    service_date: datetime
    mileage: int
    cost: Optional[float] = None
    service_center: Optional[str] = None
    technician: Optional[str] = None
    notes: Optional[str] = None
    next_service_date: Optional[datetime] = None
    next_service_mileage: Optional[int] = None

class ServiceHistoryResponse(BaseModel):
    id: int
    vehicle_id: int
    service_type: str
    service_date: datetime
    mileage: int
    cost: Optional[float]
    service_center: Optional[str]
    technician: Optional[str]
    notes: Optional[str]
    next_service_date: Optional[datetime]
    next_service_mileage: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/add", response_model=ServiceHistoryResponse)
def add_service_record(
    service_data: ServiceHistoryCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Add a new service history record"""
    
    service = ServiceHistory(
        vehicle_id=service_data.vehicle_id,
        service_type=service_data.service_type,
        service_date=service_data.service_date,
        mileage=service_data.mileage,
        cost=service_data.cost,
        service_center=service_data.service_center,
        technician=service_data.technician,
        notes=service_data.notes,
        next_service_date=service_data.next_service_date,
        next_service_mileage=service_data.next_service_mileage
    )
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

@router.get("/vehicle/{vehicle_id}")
def get_vehicle_service_history(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get all service history for a vehicle"""
    
    services = db.query(ServiceHistory).filter(
        ServiceHistory.vehicle_id == vehicle_id
    ).order_by(ServiceHistory.service_date.desc()).all()
    
    # Calculate statistics
    total_cost = sum(s.cost or 0 for s in services)
    total_services = len(services)
    
    # Get service type distribution
    service_types = {}
    for s in services:
        service_types[s.service_type] = service_types.get(s.service_type, 0) + 1
    
    return {
        "vehicle_id": vehicle_id,
        "history": services,
        "statistics": {
            "total_services": total_services,
            "total_cost": round(float(total_cost), 2),  # type: ignore
            "service_types": service_types,
            "last_service": services[0].service_date if services else None
        }
    }

@router.get("/all")
def get_all_service_history(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get all service history records (for current user's vehicles)"""
    from app.models.vehicle import Vehicle
    
    # Get user's vehicles
    user_vehicles = db.query(Vehicle.id).filter(Vehicle.user_id == user["id"]).all()
    vehicle_ids = [v[0] for v in user_vehicles]
    
    if not vehicle_ids:
        return {"services": [], "total": 0}
        
    services = db.query(ServiceHistory).filter(ServiceHistory.vehicle_id.in_(vehicle_ids)).offset(skip).limit(limit).all()
    total = db.query(ServiceHistory).filter(ServiceHistory.vehicle_id.in_(vehicle_ids)).count()
    
    return {
        "services": services,
        "total": total
    }

@router.put("/{service_id}")
def update_service_record(
    service_id: int,
    service_data: ServiceHistoryCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Update a service history record"""
    
    service = db.query(ServiceHistory).filter(ServiceHistory.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    # Update fields
    service.service_type = service_data.service_type  # type: ignore
    service.service_date = service_data.service_date  # type: ignore
    service.mileage = service_data.mileage  # type: ignore
    service.cost = service_data.cost  # type: ignore
    service.service_center = service_data.service_center  # type: ignore
    service.technician = service_data.technician  # type: ignore
    service.notes = service_data.notes  # type: ignore
    service.next_service_date = service_data.next_service_date  # type: ignore
    service.next_service_mileage = service_data.next_service_mileage  # type: ignore
    service.updated_at = datetime.utcnow()  # type: ignore
    
    db.commit()
    db.refresh(service)
    
    return {"message": "Service record updated", "service": service}

@router.delete("/{service_id}")
def delete_service_record(
    service_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Delete a service history record"""
    
    service = db.query(ServiceHistory).filter(ServiceHistory.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    db.delete(service)
    db.commit()
    
    return {"message": "Service record deleted"}

@router.get("/upcoming")
def get_upcoming_services(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    """Get upcoming service reminders"""
    
    now = datetime.utcnow()
    upcoming = db.query(ServiceHistory).filter(
        ServiceHistory.next_service_date != None,
        ServiceHistory.next_service_date >= now
    ).order_by(ServiceHistory.next_service_date.asc()).limit(10).all()
    
    return {
        "upcoming_services": upcoming,
        "count": len(upcoming)
    }
