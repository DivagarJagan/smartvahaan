from pydantic import BaseModel, Field # type: ignore
from typing import Optional
from datetime import date

class VehicleSchema(BaseModel):
    make: str = Field(..., description="Vehicle manufacturer (e.g., Maruti Suzuki, Tata)")
    model: str = Field(..., description="Vehicle model (e.g., Swift, Nexon)")
    year: int = Field(..., ge=1990, le=2026, description="Year of manufacture")
    fuel_type: str = Field(..., description="Fuel type: Petrol, Diesel, CNG, Electric")
    city: str = Field(..., description="City where vehicle is primarily used")
    mileage: int = Field(default=0, ge=0, description="Current mileage in kilometers")
    distance: Optional[int] = Field(default=None, description="Alias for mileage (for backward compatibility)")
    last_service_date: Optional[str] = Field(default=None, description="Last service date (YYYY-MM-DD)")
    usage_pattern: Optional[str] = Field(default="Regular", description="Usage pattern: City, Highway, Mixed, Regular")
    registration_number: Optional[str] = Field(default=None, description="Vehicle registration number")
    owner_name: Optional[str] = Field(default=None, description="Owner name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "make": "Maruti Suzuki",
                "model": "Swift",
                "year": 2020,
                "fuel_type": "Petrol",
                "city": "Mumbai",
                "mileage": 45000,
                "last_service_date": "2024-12-15",
                "usage_pattern": "City",
                "registration_number": "MH01AB1234",
                "owner_name": "John Doe"
            }
        }