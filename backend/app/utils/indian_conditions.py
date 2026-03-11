"""
Indian road conditions and environmental factors affecting vehicle maintenance
"""

# Cities known for high pothole density and poor road conditions
POTHOLE_CITIES = [
    "chennai", "bangalore", "mumbai", "delhi", "kolkata",
    "pune", "hyderabad", "gurgaon", "noida", "indore"
]

# Coastal cities with high humidity and corrosion risk
COASTAL_CITIES = [
    "mumbai", "chennai", "kochi", "goa", "visakhapatnam",
    "mangalore", "thiruvananthapuram"
]

# Cities with high pollution levels affecting air filters
HIGH_POLLUTION_CITIES = [
    "delhi", "gurgaon", "noida", "faridabad", "ghaziabad",
    "kanpur", "lucknow", "agra", "patna", "kolkata"
]

# Monsoon-heavy regions requiring extra care
MONSOON_PRONE_REGIONS = [
    "mumbai", "goa", "kochi", "mangalore", "shillong",
    "cherrapunji", "thiruvananthapuram"
]

# Standard service intervals for different conditions
SERVICE_INTERVALS = {
    "city_driving": 8000,  # km
    "highway_driving": 10000,  # km
    "mixed_driving": 9000,  # km
    "harsh_conditions": 6000,  # km
}

# Component-specific maintenance guidelines (in km)
MAINTENANCE_GUIDELINES = {
    "engine_oil": {
        "petrol": 10000,
        "diesel": 8000,
        "cng": 8000
    },
    "air_filter": {
        "normal": 15000,
        "high_pollution": 8000
    },
    "brake_pads": 30000,
    "tire_rotation": 10000,
    "suspension_check": 20000,
    "battery": 40000,  # or 3-4 years
}

def get_city_risk_factors(city):
    """
    Get risk factors for a specific city
    """
    city_lower = city.lower()
    factors = []
    
    if city_lower in POTHOLE_CITIES:
        factors.append("High pothole density")
    if city_lower in COASTAL_CITIES:
        factors.append("High humidity & corrosion risk")
    if city_lower in HIGH_POLLUTION_CITIES:
        factors.append("High pollution levels")
    if city_lower in MONSOON_PRONE_REGIONS:
        factors.append("Heavy monsoon impact")
    
    return factors if factors else ["Standard conditions"]