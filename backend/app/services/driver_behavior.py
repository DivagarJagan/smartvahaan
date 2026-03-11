"""
Driver Behavior Profiling and Pattern Recognition
Analyzes driving style to personalize maintenance predictions
"""
from typing import Dict, List
import statistics
from datetime import datetime, timedelta


class DriverBehaviorAnalyzer:
    """
    Analyzes driver behavior from telemetry data
    Profiles drivers into clusters for personalized predictions
    """
    
    # Thresholds for behavior classification
    THRESHOLDS = {
        "harsh_acceleration": 0.4,  # g-force
        "harsh_braking": -0.4,  # g-force
        "overspeed_threshold": 20,  # km/h above speed limit
        "aggressive_rpm": 4000,  # RPM threshold
        "rapid_lane_change": 0.3,  # lateral g-force
    }
    
    DRIVER_CLUSTERS = {
        "conservative": {
            "aggression_max": 30,
            "smoothness_min": 70,
            "description": "Gentle driver, optimal for vehicle longevity",
            "wear_multiplier": 0.85,
        },
        "moderate": {
            "aggression_max": 60,
            "smoothness_min": 50,
            "description": "Balanced driving style",
            "wear_multiplier": 1.0,
        },
        "aggressive": {
            "aggression_max": 100,
            "smoothness_min": 0,
            "description": "High-stress driving, accelerated wear",
            "wear_multiplier": 1.35,
        },
    }
    
    def analyze_trip_behavior(self, telemetry_data: List[Dict]) -> Dict:
        """
        Analyze a single trip's telemetry data
        Returns behavior metrics for the trip
        """
        if not telemetry_data:
            return self._empty_behavior()
        
        behaviors = {
            "harsh_acceleration_count": 0,
            "harsh_braking_count": 0,
            "rapid_lane_changes": 0,
            "avg_speed": 0,
            "max_speed": 0,
            "avg_rpm": 0,
            "max_rpm": 0,
            "pothole_hits": 0,
            "smooth_driving_percentage": 0,
        }
        
        speeds = []
        rpms = []
        smooth_driving_samples = 0
        
        for i, point in enumerate(telemetry_data):
            # Speed analysis
            speed = point.get("speed", 0)
            speeds.append(speed)
            
            # RPM analysis
            rpm = point.get("rpm", 0)
            if rpm:
                rpms.append(rpm)
            
            # Acceleration analysis
            accel_x = point.get("accel_x", 0)
            accel_y = point.get("accel_y", 0)
            accel_z = point.get("accel_z", 0)
            
            if accel_x > self.THRESHOLDS["harsh_acceleration"]:
                behaviors["harsh_acceleration_count"] += 1
            elif accel_x < self.THRESHOLDS["harsh_braking"]:
                behaviors["harsh_braking_count"] += 1
            
            # Lateral acceleration (lane changes)
            if abs(accel_y) > self.THRESHOLDS["rapid_lane_change"]:
                behaviors["rapid_lane_changes"] += 1
            
            # Pothole detection (sharp vertical acceleration)
            if abs(accel_z) > 1.5:  # Significant vertical jolt
                behaviors["pothole_hits"] += 1
            
            # Smooth driving (low acceleration variance)
            if abs(accel_x) < 0.2 and abs(accel_y) < 0.2:
                smooth_driving_samples += 1
        
        # Calculate averages
        behaviors["avg_speed"] = statistics.mean(speeds) if speeds else 0
        behaviors["max_speed"] = max(speeds) if speeds else 0
        behaviors["avg_rpm"] = statistics.mean(rpms) if rpms else 0
        behaviors["max_rpm"] = max(rpms) if rpms else 0
        behaviors["smooth_driving_percentage"] = (smooth_driving_samples / len(telemetry_data)) * 100 # type: ignore
        
        return behaviors
    
    def calculate_aggression_score(self, behavior_data: Dict) -> float:
        """
        Calculate aggression score (0-100)
        Higher score = more aggressive driving
        """
        score = 0
        
        # Harsh acceleration/braking contributes heavily
        harsh_events = (
            behavior_data.get("harsh_acceleration_count", 0) +
            behavior_data.get("harsh_braking_count", 0)
        )
        score += min(harsh_events * 2, 40)  # Max 40 points
        
        # High speed contributes
        max_speed = behavior_data.get("max_speed", 0)
        if max_speed > 100:
            score += min((max_speed - 100) / 2, 20)  # Max 20 points
        
        # High RPM contributes
        avg_rpm = behavior_data.get("avg_rpm", 0)
        if avg_rpm > 3000:
            score += min((avg_rpm - 3000) / 100, 20)  # Max 20 points
        
        # Rapid lane changes
        lane_changes = behavior_data.get("rapid_lane_changes", 0)
        score += min(lane_changes * 3, 20)  # Max 20 points
        
        return min(score, 100)
    
    def calculate_smoothness_score(self, behavior_data: Dict) -> float:
        """
        Calculate smoothness score (0-100)
        Higher score = smoother driving
        """
        smooth_percentage = behavior_data.get("smooth_driving_percentage", 50)
        
        # Penalize for harsh events
        harsh_events = (
            behavior_data.get("harsh_acceleration_count", 0) +
            behavior_data.get("harsh_braking_count", 0)
        )
        penalty = min(harsh_events * 5, 50)
        
        return max(smooth_percentage - penalty, 0)
    
    def detect_usage_pattern(self, behavior_history: List[Dict]) -> Dict:
        """
        Detect usage pattern from historical data
        Returns: city/highway split, trip patterns, etc.
        """
        if not behavior_history:
            return {
                "city_percentage": 50,
                "highway_percentage": 50,
                "pattern": "mixed",
            }
        
        total_city_km = 0
        total_highway_km = 0
        total_night_km = 0
        trip_distances = []
        
        for trip in behavior_history:
            distance = trip.get("distance", 0)
            avg_speed = trip.get("avg_speed", 0)
            hour = trip.get("trip_hour", 12)
            
            # Classify as city or highway based on average speed
            if avg_speed < 40:
                total_city_km += distance
            else:
                total_highway_km += distance
            
            # Night driving (8 PM to 6 AM)
            if hour >= 20 or hour < 6:
                total_night_km += distance
            
            trip_distances.append(distance)
        
        total_km = total_city_km + total_highway_km
        
        if total_km == 0:
            return {
                "city_percentage": 50,
                "highway_percentage": 50,
                "night_percentage": 0,
                "pattern": "mixed",
                "avg_trip_distance": 0,
            }
        
        city_pct = (total_city_km / total_km) * 100
        highway_pct = (total_highway_km / total_km) * 100
        night_pct = (total_night_km / total_km) * 100
        
        # Determine pattern
        if city_pct > 70:
            pattern = "city_commuter"
        elif highway_pct > 60:
            pattern = "highway_cruiser"
        else:
            pattern = "mixed"
        
        return {
            "city_percentage": round(city_pct, 1),
            "highway_percentage": round(highway_pct, 1),
            "night_percentage": round(night_pct, 1),
            "pattern": pattern,
            "avg_trip_distance": statistics.mean(trip_distances) if trip_distances else 0,
        }
    
    def classify_driver(self, aggression_score: float, smoothness_score: float) -> Dict:
        """Classify driver into cluster"""
        if aggression_score <= 30 and smoothness_score >= 70:
            cluster = "conservative"
        elif aggression_score <= 60 and smoothness_score >= 50:
            cluster = "moderate"
        else:
            cluster = "aggressive"
        
        cluster_info = self.DRIVER_CLUSTERS[cluster]
        
        return {
            "cluster": cluster,
            "description": cluster_info["description"],
            "wear_multiplier": cluster_info["wear_multiplier"],
            "recommendations": self._get_driver_recommendations(cluster),
        }
    
    def calculate_environmental_stress(self, vehicle_data: Dict, behavior_data: Dict) -> Dict:
        """Calculate environmental stress factors"""
        from app.utils.indian_conditions import POTHOLE_CITIES, HIGH_POLLUTION_CITIES
        
        city = vehicle_data.get("city", "").lower()
        
        stress = {
            "pothole_stress": 0,
            "pollution_stress": 0,
            "traffic_stress": 0,
            "heat_stress": 0,
            "overall_stress": 0,
        }
        
        # Pothole stress
        if city in [c.lower() for c in POTHOLE_CITIES]:
            stress["pothole_stress"] = 70
        pothole_hits = behavior_data.get("pothole_hits", 0)
        stress["pothole_stress"] = min(stress["pothole_stress"] + pothole_hits * 5, 100)
        
        # Pollution stress
        if city in [c.lower() for c in HIGH_POLLUTION_CITIES]:
            stress["pollution_stress"] = 80
        
        # Traffic stress (based on city driving percentage)
        city_pct = behavior_data.get("city_percentage", 50)
        stress["traffic_stress"] = city_pct * 0.8
        
        # Heat stress (assumed high for most Indian cities)
        stress["heat_stress"] = 70
        
        # Overall stress
        stress["overall_stress"] = statistics.mean([ # type: ignore
            stress["pothole_stress"],
            stress["pollution_stress"],
            stress["traffic_stress"],
            stress["heat_stress"],
        ])
        
        return stress
    
    def _get_driver_recommendations(self, cluster: str) -> List[str]:
        """Get personalized recommendations"""
        recommendations = {
            "conservative": [
                "✓ Your smooth driving style is ideal for vehicle longevity",
                "Continue maintaining steady acceleration and braking",
                "Your components will last longer than average",
            ],
            "moderate": [
                "Good balanced driving style",
                "Monitor tire pressure regularly for optimal performance",
                "Consider smoother acceleration in city traffic",
            ],
            "aggressive": [
                "⚠️ Aggressive driving increases wear by 35%",
                "Reduce harsh braking to extend brake pad life",
                "Smooth acceleration saves fuel and reduces stress",
                "Consider defensive driving techniques",
            ],
        }
        return recommendations.get(cluster, [])
    
    def _empty_behavior(self) -> Dict:
        """Return empty behavior stats"""
        return {
            "harsh_acceleration_count": 0,
            "harsh_braking_count": 0,
            "rapid_lane_changes": 0,
            "avg_speed": 0,
            "max_speed": 0,
            "avg_rpm": 0,
            "max_rpm": 0,
            "pothole_hits": 0,
            "smooth_driving_percentage": 50,
        }


# Singleton instance
driver_analyzer = DriverBehaviorAnalyzer()
