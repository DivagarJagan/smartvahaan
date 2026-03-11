from app.utils.indian_conditions import POTHOLE_CITIES

def apply_indian_rules(vehicle):
    """
    Calculate risk score based on Indian road conditions and vehicle usage
    Returns a score from 0-5
    """
    score = 0
    
    # High mileage increases wear
    mileage = vehicle.get("mileage", 0) or vehicle.get("distance", 0)
    if mileage > 80000:
        score += 3
    elif mileage > 50000:
        score += 2
    elif mileage > 30000:
        score += 1
    
    # Pothole-prone cities increase suspension wear
    city = vehicle.get("city", "").lower()
    if city in [c.lower() for c in POTHOLE_CITIES]:
        score += 2
    
    # Diesel vehicles need more frequent maintenance
    fuel_type = vehicle.get("fuel_type", "").lower()
    if fuel_type == "diesel":
        score += 1
    
    # Vehicle age matters
    year = vehicle.get("year", 2020)
    from datetime import datetime
    vehicle_age = datetime.now().year - year
    if vehicle_age > 10:
        score += 2
    elif vehicle_age > 5:
        score += 1
    
    # Cap the score at 5
    return min(score, 5)