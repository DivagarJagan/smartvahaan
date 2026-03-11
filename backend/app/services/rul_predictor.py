"""
Remaining Useful Life (RUL) Prediction Engine
Predicts component failure and remaining lifespan using hybrid ML + rule-based approach
Optimized for Indian vehicle conditions
"""
import numpy as np # type: ignore
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import math


class RULPredictor:
    """
    Hybrid RUL prediction engine combining:
    - Rule-based models for well-understood components
    - Statistical models for wear prediction
    - Indian condition modifiers
    """
    
    # Component baseline lifespans (in km) for Indian conditions
    BASELINE_LIFESPANS = {
        "battery": {
            "two_wheeler": 40000,
            "car": 60000,
            "high_heat": 0.7,  # Reduction factor for hot climates
        },
        "brake_pads": {
            "two_wheeler": 15000,
            "car": 35000,
            "city_factor": 0.75,  # Wears faster in city traffic
        },
        "clutch": {
            "two_wheeler": 50000,
            "car": 80000,
            "traffic_factor": 0.6,  # Heavy traffic reduces life
        },
        "engine_oil": {
            "petrol": 10000,
            "diesel": 8000,
            "cng": 8000,
            "two_wheeler": 6000,
        },
        "air_filter": {
            "normal": 15000,
            "pollution_factor": 0.5,  # High pollution reduces life
        },
        "spark_plugs": {
            "petrol": 30000,
            "two_wheeler": 15000,
        },
        "timing_belt": {
            "normal": 80000,
            "high_rpm_factor": 0.85,
        },
        "suspension": {
            "two_wheeler": 40000,
            "car": 60000,
            "pothole_factor": 0.6,  # Bad roads significantly reduce life
        },
        "tires": {
            "two_wheeler": 25000,
            "car": 45000,
            "road_factor": 0.8,
        },
        "coolant": {
            "interval": 40000,
            "heat_factor": 0.85,
        },
    }
    
    def __init__(self):
        self.confidence_threshold = 0.7
    
    def predict_component_rul(
        self, 
        component: str,
        vehicle_data: Dict,
        telemetry_stats: Dict = None, # type: ignore
        driver_behavior: Dict = None # type: ignore
    ) -> Dict:
        """
        Predict Remaining Useful Life for a specific component
        
        Returns:
        {
            'remaining_km': float,
            'remaining_days': int,
            'confidence': float,
            'failure_probability': float,
            'risk_level': str,
            'factors': list
        }
        """
        vehicle_type = vehicle_data.get("vehicle_type", "car")  # car or two_wheeler
        mileage = vehicle_data.get("mileage", 0)
        city = vehicle_data.get("city", "").lower()
        fuel_type = vehicle_data.get("fuel_type", "petrol").lower()
        usage_pattern = vehicle_data.get("usage_pattern", "city")
        
        # Get baseline lifespan
        if component not in self.BASELINE_LIFESPANS:
            return self._unknown_component_response()
        
        baseline = self._get_baseline_lifespan(component, vehicle_type, fuel_type)
        
        # Apply condition modifiers
        modifier, factors = self._calculate_condition_modifier(
            component, vehicle_data, telemetry_stats, driver_behavior
        )
        
        adjusted_lifespan = baseline * modifier
        
        # Calculate remaining life
        component_mileage = self._estimate_component_mileage(
            component, mileage, vehicle_data
        )
        remaining_km = max(0, adjusted_lifespan - component_mileage)
        
        # Estimate days based on average usage
        avg_km_per_day = vehicle_data.get("avg_km_per_day", 30)
        remaining_days = int(remaining_km / avg_km_per_day) if avg_km_per_day > 0 else 0
        
        # Calculate failure probability (higher as remaining life decreases)
        wear_percentage = (component_mileage / adjusted_lifespan) * 100
        failure_probability = self._calculate_failure_probability(wear_percentage)
        
        # Determine risk level
        risk_level = self._determine_risk_level(remaining_km, adjusted_lifespan, failure_probability)
        
        # Calculate confidence (higher for rule-based, lower for estimates)
        confidence = self._calculate_confidence(component, telemetry_stats)
        
        return {
            "component": component,
            "remaining_km": round(remaining_km, 0),
            "remaining_days": remaining_days,
            "confidence": round(confidence, 2),
            "failure_probability": round(failure_probability, 2),
            "risk_level": risk_level,
            "wear_percentage": round(wear_percentage, 1),
            "estimated_lifespan_km": round(adjusted_lifespan, 0),
            "factors": factors,
            "recommended_action": self._get_recommendation(risk_level, remaining_km),
        }
    
    def predict_all_components(self, vehicle_data: Dict, telemetry_stats: Dict = None, driver_behavior: Dict = None) -> Dict: # type: ignore
        """Predict RUL for all major components"""
        components = [
            "battery", "brake_pads", "clutch", "engine_oil", 
            "air_filter", "suspension", "tires"
        ]
        
        # Add vehicle-specific components
        if vehicle_data.get("fuel_type", "").lower() == "petrol":
            components.append("spark_plugs")
        
        if vehicle_data.get("vehicle_type") != "two_wheeler":
            components.append("coolant")
            components.append("timing_belt")
        
        predictions = {}
        for component in components:
            predictions[component] = self.predict_component_rul(
                component, vehicle_data, telemetry_stats, driver_behavior
            )
        
        # Calculate overall vehicle health score
        health_score = self._calculate_overall_health(predictions)
        
        # Get priority alerts
        priority_alerts = self._get_priority_alerts(predictions)
        
        return {
            "vehicle_health_score": health_score,
            "component_predictions": predictions,
            "priority_alerts": priority_alerts,
            "overall_risk": self._get_overall_risk(predictions),
            "next_service_date": self._calculate_next_service_date(predictions),
        }
    
    def _get_baseline_lifespan(self, component: str, vehicle_type: str, fuel_type: str) -> float:
        """Get baseline lifespan for component"""
        comp_data = self.BASELINE_LIFESPANS[component]
        
        # Check vehicle type specific
        if vehicle_type in comp_data:
            return comp_data[vehicle_type]
        
        # Check fuel type specific
        if fuel_type in comp_data:
            return comp_data[fuel_type]
        
        # Return default
        return comp_data.get("normal", comp_data.get("car", 50000))
    
    def _calculate_condition_modifier(
        self, 
        component: str, 
        vehicle_data: Dict,
        telemetry_stats: Dict,
        driver_behavior: Dict
    ) -> Tuple[float, List[str]]:
        """Calculate lifespan modifier based on Indian conditions"""
        from app.utils.indian_conditions import (
            POTHOLE_CITIES, HIGH_POLLUTION_CITIES, COASTAL_CITIES
        )
        
        modifier = 1.0
        factors = []
        
        city = vehicle_data.get("city", "").lower()
        usage_pattern = vehicle_data.get("usage_pattern", "mixed")
        
        # City-specific factors
        if city in [c.lower() for c in POTHOLE_CITIES]:
            if component in ["suspension", "tires"]:
                modifier *= 0.7
                factors.append("Pothole-prone city (-30%)")
        
        if city in [c.lower() for c in HIGH_POLLUTION_CITIES]:
            if component in ["air_filter", "engine_oil"]:
                modifier *= 0.6
                factors.append("High pollution (-40%)")
        
        if city in [c.lower() for c in COASTAL_CITIES]:
            if component == "battery":
                modifier *= 0.8
                factors.append("Coastal humidity (-20%)")
        
        # Usage pattern factors
        if usage_pattern == "city":
            if component in ["brake_pads", "clutch"]:
                modifier *= 0.75
                factors.append("City traffic (-25%)")
        
        # Driver behavior factors
        if driver_behavior:
            aggression = driver_behavior.get("aggression_score", 50)
            if aggression > 70:
                if component in ["brake_pads", "clutch", "tires"]:
                    modifier *= 0.8
                    factors.append("Aggressive driving (-20%)")
        
        # Temperature factors
        # Assume high heat for most Indian cities
        if component == "battery":
            modifier *= 0.85
            factors.append("High ambient temperature (-15%)")
        
        return modifier, factors
    
    def _estimate_component_mileage(self, component: str, vehicle_mileage: float, vehicle_data: Dict) -> float:
        """Estimate component's actual mileage (accounts for replacements)"""
        # In real implementation, this would check maintenance history
        # For now, assume component age equals vehicle mileage
        last_replaced_km = vehicle_data.get(f"{component}_last_replaced", 0)
        return vehicle_mileage - last_replaced_km
    
    def _calculate_failure_probability(self, wear_percentage: float) -> float:
        """Calculate failure probability based on wear"""
        if wear_percentage < 50:
            return 0.05
        elif wear_percentage < 70:
            return 0.15
        elif wear_percentage < 85:
            return 0.35
        elif wear_percentage < 95:
            return 0.60
        else:
            return 0.85
    
    def _determine_risk_level(self, remaining_km: float, total_lifespan: float, failure_prob: float) -> str:
        """Determine risk level"""
        wear_ratio = 1 - (remaining_km / total_lifespan) if total_lifespan > 0 else 1
        
        if failure_prob > 0.5 or remaining_km < 1000:
            return "critical"
        elif failure_prob > 0.3 or remaining_km < 3000:
            return "high"
        elif failure_prob > 0.15 or wear_ratio > 0.7:
            return "medium"
        else:
            return "low"
    
    def _calculate_confidence(self, component: str, telemetry_stats: Dict) -> float:
        """Calculate prediction confidence"""
        # Higher confidence for rule-based components
        rule_based_components = ["engine_oil", "air_filter"]
        
        if component in rule_based_components:
            return 0.9
        
        # Lower confidence if no telemetry data
        if not telemetry_stats:
            return 0.6
        
        return 0.75
    
    def _get_recommendation(self, risk_level: str, remaining_km: float) -> str:
        """Get actionable recommendation"""
        if risk_level == "critical":
            return f"⚠️ URGENT: Service immediately (within {int(remaining_km)}km)"
        elif risk_level == "high":
            return f"⚠️ Schedule service within {int(remaining_km)}km"
        elif risk_level == "medium":
            return f"ℹ️ Plan service in next {int(remaining_km)}km"
        else:
            return "✓ Component healthy, monitor regularly"
    
    def _calculate_overall_health(self, predictions: Dict) -> int:
        """Calculate overall vehicle health score (0-100)"""
        if not predictions:
            return 70
        
        total_score = 0
        count = 0
        
        for comp_data in predictions.values():
            wear = comp_data.get("wear_percentage", 50)
            # Convert wear to health (inverse)
            health = 100 - min(wear, 100)
            total_score += health
            count += 1
        
        return int(total_score / count) if count > 0 else 70
    
    def _get_priority_alerts(self, predictions: Dict) -> List[Dict]:
        """Get components requiring immediate attention"""
        alerts = []
        
        for component, data in predictions.items():
            if data["risk_level"] in ["critical", "high"]:
                alerts.append({
                    "component": component.replace("_", " ").title(),
                    "risk": data["risk_level"],
                    "remaining_km": data["remaining_km"],
                    "action": data["recommended_action"],
                })
        
        # Sort by risk
        alerts.sort(key=lambda x: 0 if x["risk"] == "critical" else 1)
        return alerts[:5]  # Top 5 priorities
    
    def _get_overall_risk(self, predictions: Dict) -> str:
        """Determine overall vehicle risk"""
        risk_scores = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        max_risk = 0
        
        for data in predictions.values():
            risk = risk_scores.get(data["risk_level"], 0)
            max_risk = max(max_risk, risk)
        
        if max_risk >= 4:
            return "critical"
        elif max_risk >= 3:
            return "high"
        elif max_risk >= 2:
            return "medium"
        return "low"
    
    def _calculate_next_service_date(self, predictions: Dict) -> str:
        """Calculate recommended next service date"""
        min_days = float('inf')
        
        for data in predictions.values():
            if data["risk_level"] in ["critical", "high"]:
                min_days = min(min_days, data["remaining_days"])
        
        if min_days == float('inf'):
            min_days = 30
        
        next_date = datetime.now() + timedelta(days=int(min_days))
        return next_date.strftime("%Y-%m-%d")
    
    def _unknown_component_response(self) -> Dict:
        """Default response for unknown components"""
        return {
            "component": "unknown",
            "remaining_km": 0,
            "remaining_days": 0,
            "confidence": 0.0,
            "failure_probability": 0.0,
            "risk_level": "unknown",
            "wear_percentage": 0,
            "estimated_lifespan_km": 0,
            "factors": [],
            "recommended_action": "No data available",
        }


# Singleton instance
rul_predictor = RULPredictor()
