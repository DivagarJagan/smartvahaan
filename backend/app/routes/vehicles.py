from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.vehicle_schema import VehicleSchema
from app.core.dependencies import get_current_user, get_db
from app.models.vehicle import Vehicle as VehicleModel

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("/")
def add_vehicle(vehicle: VehicleSchema, user=Depends(get_current_user), db: Session = Depends(get_db)):
    new_vehicle = VehicleModel(
        user_id=user["id"],
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        fuel_type=vehicle.fuel_type,
        city=vehicle.city,
        mileage=vehicle.mileage,
        last_service_date=vehicle.last_service_date
    )
    db.add(new_vehicle)
    db.commit()
    return {"message": "Vehicle saved successfully"}

@router.get("/")
def get_vehicles(user=Depends(get_current_user), db: Session = Depends(get_db)):
    vehicles = db.query(VehicleModel).filter(VehicleModel.user_id == user["id"]).all()
    # Normalize output to match frontend schema
    result = []
    for v in vehicles:
        result.append({
            "id": v.id,
            "make": getattr(v, "make", ""),
            "model": v.model,
            "year": getattr(v, "year", ""),
            "fuelType": v.fuel_type,
            "city": getattr(v, "city", ""),
            "mileage": getattr(v, "mileage", 0),
            "lastServiceDate": getattr(v, "last_service_date", None)
        })
    return {"vehicles": result}