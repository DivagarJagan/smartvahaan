from fastapi import APIRouter, Depends
from app.schemas.vehicle_schema import VehicleSchema
from app.core.dependencies import get_current_user
from app.data.vehicles_data import VEHICLES # type: ignore

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("/")
def add_vehicle(vehicle: VehicleSchema, user=Depends(get_current_user)):
    VEHICLES.append(vehicle.dict())
    return {"message": "Vehicle saved successfully"}

@router.get("/")
def get_vehicles(user=Depends(get_current_user)):
    return {"vehicles": VEHICLES}