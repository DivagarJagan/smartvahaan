"""
Two-Wheeler Specific Intelligence Layer
Specialized logic for motorcycles and scooters in Indian conditions
"""
from typing import Dict, List


class TwoWheelerAnalyzer:
    """
    Specialized analyzer for two-wheelers (motorcycles, scooters)
    Accounts for unique maintenance needs and Indian usage patterns
    """
    
    # Common Indian two-wheeler models
    POPULAR_MODELS = {
        "Honda": ["Activa", "Dio", "CB Shine", "Unicorn", "Hornet"],
        "Hero": ["Splendor", "Passion", "Glamour", "Xtreme", "Destini"],
        "Bajaj": ["Pulsar", "Platina", "CT", "Avenger", "Chetak"],
        "TVS": ["Jupiter", "NTORQ", "Apache", "Radeon", "iQube"],
        "Suzuki": ["Access", "Burgman", "Gixxer", "Avenis"],
        "Yamaha": ["FZ", "R15", "MT-15", "Fascino", "Ray ZR"],
        "Royal Enfield": ["Classic", "Bullet", "Himalayan", "Meteor"],
    }
    
    # Two-wheeler specific component lifespans (in km)
    COMPONENT_LIFESPANS = {
        "chain_sprocket": {"normal": 25000, "high_dust": 15000},
        "front_brake_pads": 15000,
        "rear_brake_shoes": 20000,
        "clutch_plates": 50000,
        "spark_plug": 12000,
        "air_filter": {"normal": 8000, "pollution": 4000},
        "engine_oil": {"normal": 3000, "synthetic": 5000},
        "battery": 40000,
        "tires_front": 25000,
        "tires_rear": 20000,  # Rear wears faster
        "brake_fluid": 20000,
        "coolant": 24000,  # For liquid-cooled bikes
    }
    
    # Usage categories
    USAGE_CATEGORIES = {
        "daily_commuter": {
            "avg_km_per_day": 30,
            "description": "Daily city commute",
            "wear_factor": 1.2,  # Higher wear in traffic
        },
        "delivery": {
            "avg_km_per_day": 80,
            "description": "Commercial delivery",
            "wear_factor": 1.5,  # Very high wear
        },
        "weekend_rider": {
            "avg_km_per_day": 15,
            "description": "Occasional use",
            "wear_factor": 0.9,
        },
        "touring": {
            "avg_km_per_day": 60,
            "description": "Long-distance riding",
            "wear_factor": 1.1,
        },
    }
    
    def identify_two_wheeler_type(self, make: str, model: str) -> str:
        """Identify specific two-wheeler category"""
        model_lower = model.lower()
        
        # Scooters
        scooters = ["activa", "dio", "access", "jupiter", "destini", "fascino", "ray", "ntorq", "burgman", "chetak", "avenis", "iqube"]
        if any(s in model_lower for s in scooters):
            return "scooter"
        
        # Sports bikes
        sports = ["r15", "mt", "apache", "pulsar", "gixxer", "hornet", "fz", "xtreme"]
        if any(s in model_lower for s in sports):
            return "sports"
        
        # Cruisers
        cruisers = ["classic", "bullet", "meteor", "avenger"]
        if any(c in model_lower for c in cruisers):
            return "cruiser"
        
        # Commuter bikes
        return "commuter"
    
    def analyze_chain_wear(self, mileage: float, cleaning_frequency: str, city: str) -> Dict:
        """
        Analyze chain and sprocket wear
        Critical for two-wheelers in dusty Indian conditions
        """
        from app.utils.indian_conditions import POTHOLE_CITIES
        
        base_life = self.COMPONENT_LIFESPANS["chain_sprocket"]["normal"]
        
        # Adjust for maintenance
        maintenance_factors = {
            "regular": 1.0,  # Cleaned every 500km
            "occasional": 0.75,  # Cleaned every 1000km
            "never": 0.5,  # Rarely or never cleaned
        }
        
        factor = maintenance_factors.get(cleaning_frequency, 0.75)
        
        # Dusty conditions reduce chain life
        if city.lower() in ["rajasthan", "delhi", "gurgaon", "jaipur"]:
            factor *= 0.8
        
        adjusted_life = base_life * factor
        remaining_km = max(0, adjusted_life - mileage)
        wear_percentage = (mileage / adjusted_life) * 100
        
        return {
            "component": "Chain & Sprocket",
            "remaining_km": round(remaining_km, 0),
            "wear_percentage": round(min(wear_percentage, 100), 1),
            "recommendation": self._get_chain_recommendation(wear_percentage, cleaning_frequency),
            "estimated_cost": self._estimate_chain_replacement_cost(),
        }
    
    def analyze_brake_pads(self, mileage: float, vehicle_type: str, city_usage_pct: float) -> Dict:
        """Analyze brake pad wear for two-wheelers"""
        base_life = self.COMPONENT_LIFESPANS["front_brake_pads"]
        
        # City riding wears brakes faster
        city_factor = 1.0 - (city_usage_pct / 100 * 0.3)  # Up to 30% reduction
        
        # Scooters typically use rear drum brakes (longer life)
        if vehicle_type == "scooter":
            base_life = self.COMPONENT_LIFESPANS["rear_brake_shoes"]
            city_factor = 1.0 - (city_usage_pct / 100 * 0.2)
        
        adjusted_life = base_life * city_factor
        remaining_km = max(0, adjusted_life - mileage)
        wear_percentage = (mileage / adjusted_life) * 100
        
        return {
            "component": "Brake Pads" if vehicle_type != "scooter" else "Brake Shoes",
            "remaining_km": round(remaining_km, 0),
            "wear_percentage": round(min(wear_percentage, 100), 1),
            "recommendation": self._get_brake_recommendation(wear_percentage),
            "estimated_cost": 800 if vehicle_type == "scooter" else 1200,
        }
    
    def detect_usage_category(self, avg_km_per_day: float, trip_pattern: Dict) -> Dict:
        """Detect how the two-wheeler is being used"""
        if avg_km_per_day > 70:
            return {
                "category": "delivery",
                **self.USAGE_CATEGORIES["delivery"]
            }
        elif avg_km_per_day > 50:
            return {
                "category": "touring",
                **self.USAGE_CATEGORIES["touring"]
            }
        elif avg_km_per_day > 20:
            return {
                "category": "daily_commuter",
                **self.USAGE_CATEGORIES["daily_commuter"]
            }
        else:
            return {
                "category": "weekend_rider",
                **self.USAGE_CATEGORIES["weekend_rider"]
            }
    
    def get_two_wheeler_specific_tips(self, vehicle_data: Dict) -> List[str]:
        """Get two-wheeler specific maintenance tips for Indian conditions"""
        tips = []
        vehicle_type = self.identify_two_wheeler_type(
            vehicle_data.get("make", ""), 
            vehicle_data.get("model", "")
        )
        city = vehicle_data.get("city", "").lower()
        
        # Universal tips
        tips.append("🔧 Check chain tension every 500km (critical in India)")
        tips.append("🛢️ Engine oil change every 3000km for city riding")
        
        # Vehicle type specific
        if vehicle_type == "scooter":
            tips.append("⚙️ CVT oil change every 8000km (often neglected)")
            tips.append("🌡️ Check coolant for liquid-cooled scooters every 6 months")
        elif vehicle_type == "sports":
            tips.append("🏍️ Monitor tire pressure weekly (critical for safety)")
            tips.append("⚡ High-performance bikes need more frequent oil changes")
        
        # City specific
        if "delhi" in city or "mumbai" in city:
            tips.append("💨 Replace air filter every 4000km due to high pollution")
        
        if "bangalore" in city or "pune" in city:
            tips.append("🌧️ Check brake pads frequently (wet weather + traffic)")
        
        # Usage specific
        mileage = vehicle_data.get("mileage", 0)
        if mileage > 30000:
            tips.append("🔋 Get battery tested (typical life 40,000km in India)")
        
        if mileage > 20000:
            tips.append("🛞 Check front fork oil and seals")
        
        return tips
    
    def calculate_service_cost(self, service_type: str, vehicle_type: str) -> Dict:
        """Estimate service costs (INR) for two-wheelers"""
        costs = {
            "commuter": {
                "basic_service": 500,
                "engine_oil_change": 800,
                "chain_cleaning": 200,
                "brake_pad_replacement": 800,
                "air_filter": 300,
                "spark_plug": 250,
            },
            "scooter": {
                "basic_service": 600,
                "engine_oil_change": 900,
                "brake_shoe_replacement": 600,
                "air_filter": 350,
                "spark_plug": 200,
                "cvt_oil": 400,
            },
            "sports": {
                "basic_service": 800,
                "engine_oil_change": 1500,
                "chain_cleaning": 300,
                "brake_pad_replacement": 1500,
                "air_filter": 500,
                "spark_plug": 400,
            },
            "cruiser": {
                "basic_service": 1000,
                "engine_oil_change": 1800,
                "chain_cleaning": 350,
                "brake_pad_replacement": 1200,
                "air_filter": 600,
                "spark_plug": 300,
            },
        }
        
        vehicle_costs = costs.get(vehicle_type, costs["commuter"])
        
        return {
            "service_type": service_type,
            "vehicle_type": vehicle_type,
            "estimated_cost": vehicle_costs.get(service_type, 500),
            "currency": "INR",
            "includes_labor": True,
        }
    
    def predict_two_wheeler_rul(self, vehicle_data: Dict) -> Dict:
        """Comprehensive RUL prediction for two-wheeler"""
        vehicle_type = self.identify_two_wheeler_type(
            vehicle_data.get("make", ""),
            vehicle_data.get("model", "")
        )
        
        mileage = vehicle_data.get("mileage", 0)
        city = vehicle_data.get("city", "")
        city_usage_pct = vehicle_data.get("city_usage_pct", 70)
        
        # Chain analysis (most critical for two-wheelers)
        chain_analysis = self.analyze_chain_wear(
            mileage, 
            vehicle_data.get("chain_cleaning", "occasional"),
            city
        )
        
        # Brake analysis
        brake_analysis = self.analyze_brake_pads(mileage, vehicle_type, city_usage_pct)
        
        # Engine oil (frequent changes needed in India)
        oil_due_km = 3000 - (mileage % 3000)
        
        # Battery
        battery_age_km = mileage - vehicle_data.get("battery_replaced_at", 0)
        battery_remaining = max(0, 40000 - battery_age_km)
        
        return {
            "vehicle_type": vehicle_type,
            "overall_health": self._calculate_two_wheeler_health([
                chain_analysis["wear_percentage"],
                brake_analysis["wear_percentage"],
                (battery_age_km / 40000) * 100
            ]),
            "components": {
                "chain_sprocket": chain_analysis,
                "brakes": brake_analysis,
                "engine_oil": {
                    "due_in_km": oil_due_km,
                    "recommendation": f"Next oil change in {oil_due_km}km",
                    "estimated_cost": 800,
                },
                "battery": {
                    "remaining_km": battery_remaining,
                    "wear_percentage": round((battery_age_km / 40000) * 100, 1),
                    "recommendation": "Monitor if > 3 years old",
                    "estimated_cost": 2500,
                },
            },
            "priority_items": self._get_priority_items([chain_analysis, brake_analysis]),
            "monthly_maintenance_cost": self._estimate_monthly_cost(vehicle_type),
        }
    
    def _get_chain_recommendation(self, wear_pct: float, cleaning: str) -> str:
        """Get chain maintenance recommendation"""
        if wear_pct > 90:
            return "⚠️ URGENT: Replace chain & sprocket immediately"
        elif wear_pct > 75:
            return "⚠️ Plan replacement within 1000km"
        elif cleaning == "never":
            return "ℹ️ Start regular chain cleaning (every 500km)"
        else:
            return "✓ Continue regular maintenance"
    
    def _get_brake_recommendation(self, wear_pct: float) -> str:
        """Get brake maintenance recommendation"""
        if wear_pct > 85:
            return "⚠️ URGENT: Replace immediately for safety"
        elif wear_pct > 70:
            return "⚠️ Get checked within 500km"
        else:
            return "✓ Brakes in good condition"
    
    def _estimate_chain_replacement_cost(self) -> int:
        """Estimate chain + sprocket replacement cost"""
        return 2500  # Average cost in India (chain + front/rear sprocket)
    
    def _calculate_two_wheeler_health(self, wear_percentages: List[float]) -> int:
        """Calculate overall two-wheeler health score"""
        avg_wear = sum(wear_percentages) / len(wear_percentages)
        health = 100 - min(avg_wear, 100)
        return round(health)
    
    def _get_priority_items(self, analyses: List[Dict]) -> List[str]:
        """Get priority maintenance items"""
        priority = []
        for analysis in analyses:
            if analysis["wear_percentage"] > 75:
                priority.append(f"{analysis['component']}: {analysis['recommendation']}")
        return priority if priority else ["No urgent items"]
    
    def _estimate_monthly_cost(self, vehicle_type: str) -> int:
        """Estimate average monthly maintenance cost"""
        base_costs = {
            "commuter": 400,
            "scooter": 450,
            "sports": 800,
            "cruiser": 1000,
        }
        return base_costs.get(vehicle_type, 400)


# Singleton instance
two_wheeler_analyzer = TwoWheelerAnalyzer()
