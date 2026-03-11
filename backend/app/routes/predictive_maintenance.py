"""
Predictive Maintenance API Routes
Advanced RUL predictions, component health, and driver behavior analysis
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from datetime import datetime

from app.services.rul_predictor import rul_predictor
from app.services.driver_behavior import driver_analyzer
from app.services.two_wheeler_intelligence import two_wheeler_analyzer
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/predict", tags=["Predictive Maintenance"])


@router.post("/rul")
async def predict_remaining_useful_life(
    vehicle_data: Dict,
    telemetry_stats: Dict = None, # type: ignore
    driver_behavior: Dict = None, # type: ignore
    current_user: dict = Depends(get_current_user)
):
    """
    Predict Remaining Useful Life for all vehicle components
    
    Returns component-level predictions with confidence scores
    """
    try:
        # Detect if two-wheeler
        is_two_wheeler = vehicle_data.get("vehicle_type") == "two_wheeler"
        
        if is_two_wheeler:
            # Use specialized two-wheeler analyzer
            prediction = two_wheeler_analyzer.predict_two_wheeler_rul(vehicle_data)
        else:
            # Use general RUL predictor
            prediction = rul_predictor.predict_all_components(
                vehicle_data, 
                telemetry_stats, 
                driver_behavior
            )
        
        return {
            "success": True,
            "prediction": prediction,
            "generated_at": datetime.now().isoformat(),
            "user_id": current_user.get("sub"),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/component/{component_name}")
async def predict_component_rul(
    component_name: str,
    vehicle_data: Dict,
    telemetry_stats: Dict = None, # type: ignore
    driver_behavior: Dict = None, # type: ignore
    current_user: dict = Depends(get_current_user)
):
    """
    Predict RUL for a specific component
    
    Supported components:
    - battery, brake_pads, clutch, engine_oil, air_filter
    - suspension, tires, spark_plugs, timing_belt, coolant
    """
    try:
        prediction = rul_predictor.predict_component_rul(
            component_name,
            vehicle_data,
            telemetry_stats,
            driver_behavior
        )
        
        return {
            "success": True,
            "component": component_name,
            "prediction": prediction,
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Component prediction failed: {str(e)}")


@router.post("/driver-behavior")
async def analyze_driver_behavior(
    telemetry_data: List[Dict],
    vehicle_data: Dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze driver behavior from telemetry data
    
    Returns:
    - Aggression score
    - Smoothness score
    - Driver cluster (conservative/moderate/aggressive)
    - Environmental stress factors
    - Personalized recommendations
    """
    try:
        # Analyze trip behavior
        behavior = driver_analyzer.analyze_trip_behavior(telemetry_data)
        
        # Calculate scores
        aggression_score = driver_analyzer.calculate_aggression_score(behavior)
        smoothness_score = driver_analyzer.calculate_smoothness_score(behavior)
        
        # Classify driver
        classification = driver_analyzer.classify_driver(aggression_score, smoothness_score)
        
        # Calculate environmental stress
        stress = driver_analyzer.calculate_environmental_stress(vehicle_data, behavior)
        
        return {
            "success": True,
            "behavior_metrics": behavior,
            "aggression_score": aggression_score,
            "smoothness_score": smoothness_score,
            "classification": classification,
            "environmental_stress": stress,
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Behavior analysis failed: {str(e)}")


@router.post("/usage-pattern")
async def detect_usage_pattern(
    behavior_history: List[Dict],
    current_user: dict = Depends(get_current_user)
):
    """
    Detect usage pattern from historical behavior data
    
    Returns:
    - City vs highway percentage
    - Usage pattern (commuter/cruiser/mixed)
    - Average trip distance
    - Night driving percentage
    """
    try:
        pattern = driver_analyzer.detect_usage_pattern(behavior_history)
        
        return {
            "success": True,
            "usage_pattern": pattern,
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern detection failed: {str(e)}")


@router.get("/health-score")
async def get_vehicle_health_score(
    vehicle_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive vehicle health score
    
    Combines:
    - Component health
    - Driver behavior
    - Environmental factors
    - Maintenance history
    """
    try:
        # In production, fetch from database
        # For now, return mock but realistic score
        
        return {
            "success": True,
            "vehicle_id": vehicle_id,
            "health_score": 78,
            "risk_level": "medium",
            "components_at_risk": [
                {"name": "Brake Pads", "health": 65, "remaining_km": 3500},
                {"name": "Air Filter", "health": 45, "remaining_km": 1200},
            ],
            "next_service_due": "2026-04-15",
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health score calculation failed: {str(e)}")


@router.post("/two-wheeler/tips")
async def get_two_wheeler_tips(
    vehicle_data: Dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Get two-wheeler specific maintenance tips for Indian conditions
    
    Covers:
    - Chain maintenance
    - Oil change intervals
    - City-specific recommendations
    - Model-specific tips
    """
    try:
        tips = two_wheeler_analyzer.get_two_wheeler_specific_tips(vehicle_data)
        vehicle_type = two_wheeler_analyzer.identify_two_wheeler_type(
            vehicle_data.get("make", ""),
            vehicle_data.get("model", "")
        )
        
        return {
            "success": True,
            "vehicle_type": vehicle_type,
            "tips": tips,
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tips generation failed: {str(e)}")


@router.post("/cost-estimate")
async def estimate_maintenance_cost(
    component: str,
    vehicle_data: Dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Estimate repair/replacement cost for a component
    
    Returns INR cost estimate including labor
    """
    try:
        # Basic cost estimation (in production, would use actual pricing data)
        cost_map = {
            "battery": {"car": 5000, "two_wheeler": 2500},
            "brake_pads": {"car": 3500, "two_wheeler": 1200},
            "clutch": {"car": 12000, "two_wheeler": 3500},
            "engine_oil": {"car": 2500, "two_wheeler": 800},
            "air_filter": {"car": 800, "two_wheeler": 300},
            "suspension": {"car": 15000, "two_wheeler": 5000},
            "tires": {"car": 20000, "two_wheeler": 4000},
        }
        
        vehicle_type = vehicle_data.get("vehicle_type", "car")
        cost = cost_map.get(component, {}).get(vehicle_type, 1000)
        
        return {
            "success": True,
            "component": component,
            "vehicle_type": vehicle_type,
            "estimated_cost": cost,
            "currency": "INR",
            "includes_labor": True,
            "note": "Prices may vary based on location and service center",
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cost estimation failed: {str(e)}")


@router.post("/failure-probability")
async def predict_failure_probability(
    vehicle_data: Dict,
    component: str = None, # type: ignore
    current_user: dict = Depends(get_current_user)
):
    """
    Predict failure probability for component(s)
    
    Returns probability score (0-1) and risk level
    """
    try:
        if component:
            # Single component prediction
            prediction = rul_predictor.predict_component_rul(component, vehicle_data)
            return {
                "success": True,
                "component": component,
                "failure_probability": prediction["failure_probability"],
                "risk_level": prediction["risk_level"],
                "remaining_km": prediction["remaining_km"],
            }
        else:
            # All components
            predictions = rul_predictor.predict_all_components(vehicle_data)
            
            # Extract failure probabilities
            component_risks = {}
            for comp, data in predictions["component_predictions"].items():
                component_risks[comp] = {
                    "probability": data["failure_probability"],
                    "risk": data["risk_level"],
                }
            
            return {
                "success": True,
                "overall_risk": predictions["overall_risk"],
                "component_risks": component_risks,
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failure prediction failed: {str(e)}")
