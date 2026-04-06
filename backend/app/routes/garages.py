from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from pydantic import BaseModel # type: ignore
from sqlalchemy.orm import Session # type: ignore
from math import radians, sin, cos, sqrt, atan2
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.garage import Garage

router = APIRouter(prefix="/api/garages", tags=["garages"])


class UpdateLocationRequest(BaseModel):
    latitude: float
    longitude: float

def get_distance_km(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula (in km)"""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance

def init_demo_garages(db: Session):
    """Initialize demo garage data for Coimbatore area"""
    demo_garages = [
        {
            "name": "Cartech Auto Service",
            "address": "123, Trichy Rd, Sungam, Coimbatore, Tamil Nadu 641018",
            "latitude": 11.0050,
            "longitude": 76.9821,
            "phone": "+91-9994445566",
            "email": "cartech.cbe@example.com",
            "services": "General Service,Car Wash,Wheel Alignment,Denting & Painting,AC Repair",
            "rating": 4.5,
            "is_certified": True,
            "opening_time": "09:00",
            "closing_time": "19:00"
        },
        {
            "name": "Pitstop Car & Bike Service",
            "address": "45, Avinashi Rd, near Hope College, Peelamedu, Coimbatore, Tamil Nadu 641004",
            "latitude": 11.0288,
            "longitude": 77.0239,
            "phone": "+91-8883337777",
            "email": "pitstop.cbe@example.com",
            "services": "General Service,Bike Service,Oil Change,Tyre Service,Brake Service",
            "rating": 4.2,
            "is_certified": False,
            "opening_time": "08:00",
            "closing_time": "20:00"
        },
        {
            "name": "Autobahn Car Service",
            "address": "7, V.C.V Layout, R.S. Puram, Coimbatore, Tamil Nadu 641002",
            "latitude": 11.0095,
            "longitude": 76.9536,
            "phone": "+91-9876512345",
            "email": "autobahn.rspuram@example.com",
            "services": "Premium Car Service,Engine Diagnostics,Suspension Tuning,Performance Upgrades",
            "rating": 4.8,
            "is_certified": True,
            "opening_time": "09:30",
            "closing_time": "18:30"
        },
        {
            "name": "Racer's Edge Automotive",
            "address": "21, Race Course Road, Coimbatore, Tamil Nadu 641018",
            "latitude": 11.0027,
            "longitude": 76.9727,
            "phone": "+91-9123456789",
            "email": "racersedge.cbe@example.com",
            "services": "Sports Car Tuning,Exhaust Systems,Brake Upgrades,ECU Remapping,Track Day Prep",
            "rating": 4.9,
            "is_certified": True,
            "opening_time": "10:00",
            "closing_time": "19:00"
        },
        {
            "name": "24/7 Auto Rescue",
            "address": "NH 544, Ettimadai, Coimbatore, Tamil Nadu 641105",
            "latitude": 10.8983,
            "longitude": 76.9033,
            "phone": "+91-9876554321",
            "email": "autorescue.247@example.com",
            "services": "24/7 Towing,Roadside Assistance,Flat Tire Repair,Battery Jumpstart,Emergency Fuel",
            "rating": 4.6,
            "is_certified": False,
            "opening_time": "00:00",
            "closing_time": "23:59"
        },
        {
            "name": "Bosch Car Service - Sree Vatsa Automotives",
            "address": "10/3, Mettupalayam Road, Kavundampalayam, Coimbatore, Tamil Nadu 641030",
            "latitude": 11.0452,
            "longitude": 76.9528,
            "phone": "+91-422-245-1111",
            "email": "bosch.sreevatsa@example.com",
            "services": "Bosch Certified Service,Advanced Diagnostics,Fuel Injection Service,ABS & Airbag Repair",
            "rating": 4.7,
            "is_certified": True,
            "opening_time": "09:00",
            "closing_time": "19:00"
        },
        {
            "name": "Mahindra First Choice Services",
            "address": "345, Thadagam Main Rd, Edayarpalayam, Coimbatore, Tamil Nadu 641025",
            "latitude": 11.0321,
            "longitude": 76.9284,
            "phone": "+91-95009-99123",
            "email": "mfc.edayarpalayam@example.com",
            "services": "Multi-Brand Car Service,Periodic Maintenance,Body Repair,Cashless Insurance Claims",
            "rating": 4.4,
            "is_certified": True,
            "opening_time": "09:00",
            "closing_time": "18:00"
        },
        {
            "name": "MyTVS - Ganapathy",
            "address": "No 1, Sathy Rd, near Ramakrishna Kalyana Mandapam, Ganapathy, Coimbatore, Tamil Nadu 641006",
            "latitude": 11.0398,
            "longitude": 76.9952,
            "phone": "+91-80690-56789",
            "email": "mytvs.ganapathy@example.com",
            "services": "24-hour Roadside Assistance,Car Detailing,Battery & Tire Services,Insurance Renewals",
            "rating": 4.3,
            "is_certified": True,
            "opening_time": "08:30",
            "closing_time": "20:30"
        },
        {
            "name": "GoMechanic - The Automotive Company",
            "address": "15, Nehru St, Ram Nagar, Gandhipuram, Coimbatore, Tamil Nadu 641009",
            "latitude": 11.0183,
            "longitude": 76.9697,
            "phone": "+91-83969-83969",
            "email": "gomechanic.gandhipuram@example.com",
            "services": "Car Wash,Denting & Painting,AC Service,Wheel Care,Custom Repairs",
            "rating": 4.1,
            "is_certified": False,
            "opening_time": "09:00",
            "closing_time": "21:00"
        },
        {
            "name": "3M Car Care - RS Puram",
            "address": "36, E Venkatasamy Rd, R.S. Puram, Coimbatore, Tamil Nadu 641002",
            "latitude": 11.0082,
            "longitude": 76.9501,
            "phone": "+91-98940-12345",
            "email": "3m.rspuram@example.com",
            "services": "Car Detailing,Ceramic Coating,Paint Protection Film,Interior Cleaning,Underbody Coating",
            "rating": 4.8,
            "is_certified": True,
            "opening_time": "10:00",
            "closing_time": "20:00"
        }
    ]

    # Check if garages already exist
    if db.query(Garage).count() == 0:
        for garage_data in demo_garages:
            garage = Garage(**garage_data)
            db.add(garage)
        db.commit()

@router.get("/nearby")
async def get_nearby_garages(
    latitude: float,
    longitude: float,
    radius_km: float = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get nearby garages (requires premium subscription)"""
    
    # Query the actual user from database
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_premium = bool(getattr(user, "is_premium", False))
    premium_until = getattr(user, "premium_until", None)
    
    # Check if user is premium
    if not is_premium:
        raise HTTPException(
            status_code=403,
            detail="This feature is only available for premium users. Please upgrade to access garage maps."
        )
    
    # Check if premium is still valid
    from datetime import datetime
    if premium_until and premium_until < datetime.utcnow():
        raise HTTPException(
            status_code=403,
            detail="Your premium subscription has expired. Please renew to access this feature."
        )
    
    # Initialize demo data if needed
    init_demo_garages(db)
    
    # Get all garages
    garages = db.query(Garage).all()
    
    # Filter by radius and calculate distance
    nearby_garages = []
    for garage in garages:
        distance = get_distance_km(latitude, longitude, garage.latitude, garage.longitude)
        if distance <= radius_km:
            nearby_garages.append({
                "id": garage.id,
                "name": garage.name,
                "address": garage.address,
                "latitude": garage.latitude,
                "longitude": garage.longitude,
                "phone": garage.phone,
                "email": garage.email,
                "services": garage.services.split(","),
                "rating": garage.rating,
                "is_certified": garage.is_certified,
                "opening_time": garage.opening_time,
                "closing_time": garage.closing_time,
                "distance_km": round(distance, 2)
            })
    
    # Sort by distance
    nearby_garages.sort(key=lambda x: x["distance_km"])
    
    return {
        "total_found": len(nearby_garages),
        "radius_km": radius_km,
        "user_location": {"latitude": latitude, "longitude": longitude},
        "garages": nearby_garages
    }

@router.get("/demo-data")
async def get_demo_garages(db: Session = Depends(get_db)):
    """Get all demo garages (public endpoint for testing)"""
    init_demo_garages(db)
    garages = db.query(Garage).filter(Garage.is_demo == True).all()
    
    return {
        "total": len(garages),
        "garages": [
            {
                "id": g.id,
                "name": g.name,
                "address": g.address,
                "latitude": g.latitude,
                "longitude": g.longitude,
                "phone": g.phone,
                "email": g.email,
                "services": g.services.split(","),
                "rating": g.rating,
                "is_certified": g.is_certified,
                "opening_time": g.opening_time,
                "closing_time": g.closing_time
            }
            for g in garages
        ]
    }

@router.post("/update-location")
async def update_user_location(
    payload: Optional[UpdateLocationRequest] = Body(default=None),
    latitude: Optional[float] = Query(default=None),
    longitude: Optional[float] = Query(default=None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's current location"""
    resolved_latitude = payload.latitude if payload else latitude
    resolved_longitude = payload.longitude if payload else longitude

    if resolved_latitude is None or resolved_longitude is None:
        raise HTTPException(status_code=400, detail="latitude and longitude are required")

    # Query the actual user from database
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    setattr(user, "latitude", resolved_latitude)
    setattr(user, "longitude", resolved_longitude)
    db.add(user)
    db.commit()
    
    return {"message": "Location updated", "latitude": resolved_latitude, "longitude": resolved_longitude}
