import google.generativeai as genai # type: ignore
import os
from datetime import datetime, timedelta
from functools import lru_cache
import hashlib
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Cache for AI responses (in-memory cache)
ai_cache = {}
CACHE_DURATION = 3600  # 1 hour in seconds

class AICache:
    """Simple cache with TTL for AI responses"""
    def __init__(self):
        self.cache = {}
    
    def get(self, key):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if (datetime.now() - timestamp).seconds < CACHE_DURATION:
                return data
            else:
                del self.cache[key]
        return None
    
    def set(self, key, value):
        self.cache[key] = (value, datetime.now())

response_cache = AICache()

def get_cache_key(vehicle_data):
    """Generate cache key from vehicle data"""
    key_data = f"{vehicle_data.get('make')}_{vehicle_data.get('model')}_{vehicle_data.get('mileage')}_{vehicle_data.get('city')}"
    return hashlib.md5(key_data.encode()).hexdigest()

def generate_maintenance_analysis(vehicle_data, use_cache=True):
    """
    Generate comprehensive maintenance analysis using Gemini AI
    considering Indian road conditions - with caching and timeout
    """
    # Check cache first
    if use_cache:
        cache_key = get_cache_key(vehicle_data)
        cached_result = response_cache.get(cache_key)
        if cached_result:
            return cached_result
    
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"))
    
    # Shortened prompt for faster response
    prompt = f"""
    Quick maintenance check for {vehicle_data.get('make')} {vehicle_data.get('model')} ({vehicle_data.get('year')})
    Mileage: {vehicle_data.get('mileage', 0)}km | City: {vehicle_data.get('city', 'Unknown')}
    
    Provide:
    1. Health Score (0-100)
    2. Top 3 urgent items
    3. Brief Indian road advice
    
    Be concise (max 150 words).
    """
    
    try:
        # Add timeout to prevent hanging
        with ThreadPoolExecutor() as executor:
            future = executor.submit(model.generate_content, prompt)
            try:
                response = future.result(timeout=10)  # 10 second timeout
                result = response.text
                
                # Cache the result
                if use_cache:
                    cache_key = get_cache_key(vehicle_data)
                    response_cache.set(cache_key, result)
                
                return result
            except TimeoutError:
                return "AI analysis timed out. Using rule-based analysis only."
    except Exception as e:
        return f"AI analysis unavailable: {str(e)}"

def calculate_maintenance_priority(vehicle_data, include_ai=False):
    """
    Calculate maintenance priority based on multiple factors
    Fast mode: Rule-based only (instant)
    Full mode: Includes AI analysis (slower)
    """
    from app.services.rule_engine import apply_indian_rules
    from app.services.risk_analyzer import calculate_severity
    from app.utils.indian_conditions import POTHOLE_CITIES
    
    score = apply_indian_rules(vehicle_data)
    severity = calculate_severity(score)
    
    # Determine specific recommendations
    recommendations = []
    timeline = []
    
    mileage = vehicle_data.get('mileage', 0)
    city = vehicle_data.get('city', '').lower()
    
    # Suspension check (critical for Indian roads)
    if city in [c.lower() for c in POTHOLE_CITIES]:
        recommendations.append({
            "component": "Suspension System",
            "reason": f"High pothole density in {vehicle_data.get('city')}",
            "urgency": "High" if mileage > 40000 else "Medium",
            "estimated_cost": "₹3,000 - ₹8,000"
        })
        timeline.append("Within 2 weeks")
    
    # Brake inspection
    if mileage > 50000:
        recommendations.append({
            "component": "Brake Pads & Rotors",
            "reason": "High mileage wear",
            "urgency": "High",
            "estimated_cost": "₹2,500 - ₹6,000"
        })
        timeline.append("Within 1 week")
    
    # Engine oil change
    if mileage % 10000 < 1000:  # Near service interval
        recommendations.append({
            "component": "Engine Oil & Filter",
            "reason": "Due for regular service",
            "urgency": "Medium",
            "estimated_cost": "₹1,500 - ₹3,500"
        })
        timeline.append("Within 1 month")
    
    # Air filter (dust-prone areas)
    if city in [c.lower() for c in POTHOLE_CITIES]:
        recommendations.append({
            "component": "Air Filter",
            "reason": "High dust and pollution levels",
            "urgency": "Low",
            "estimated_cost": "₹500 - ₹1,200"
        })
        timeline.append("Within 2 months")
    
    # Tire inspection
    if mileage > 30000:
        recommendations.append({
            "component": "Tire Rotation & Alignment",
            "reason": "Rough road conditions",
            "urgency": "Medium",
            "estimated_cost": "₹1,000 - ₹2,500"
        })
        timeline.append("Within 3 weeks")
    
    result = {
        "severity": severity,
        "risk_score": score,
        "recommendations": recommendations,
        "next_service_date": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
    }
    
    # Only include AI analysis if requested (optional for speed)
    if include_ai:
        result["ai_analysis"] = generate_maintenance_analysis(vehicle_data, use_cache=True)
    else:
        result["ai_analysis"] = None
    
    return result

def generate_ai_message(vehicle, severity):
    """Legacy function - kept for backward compatibility"""
    return (
        f"Based on your vehicle usage in {vehicle['city']} and total distance "
        f"covered, the suspension and braking system may experience accelerated "
        f"wear due to Indian road conditions. Severity level: {severity}. "
        f"A preventive inspection is recommended."
    )