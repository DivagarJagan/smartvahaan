"""
Telemetry and OBD-II Data Models for Real-time Vehicle Monitoring
Supports both OBD-II devices and smartphone sensors
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON
from datetime import datetime
from app.database.base import Base


class OBDDevice(Base):
    """OBD-II device registration and metadata"""
    __tablename__ = "obd_devices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    device_id = Column(String, unique=True, index=True)  # MAC address or unique ID
    device_type = Column(String)  # bluetooth, wifi, usb
    manufacturer = Column(String)
    model = Column(String)
    is_active = Column(Boolean, default=True)
    last_connected = Column(DateTime)
    firmware_version = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TelemetryData(Base):
    """Real-time telemetry data from OBD-II or sensors"""
    __tablename__ = "telemetry_data"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    device_id = Column(Integer, ForeignKey("obd_devices.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Engine Parameters
    rpm = Column(Integer)  # Revolutions per minute
    speed = Column(Float)  # km/h
    throttle_position = Column(Float)  # Percentage
    engine_load = Column(Float)  # Percentage
    coolant_temp = Column(Float)  # Celsius
    oil_temp = Column(Float)  # Celsius
    intake_air_temp = Column(Float)  # Celsius
    maf = Column(Float)  # Mass Air Flow (g/s)
    fuel_pressure = Column(Float)  # kPa
    
    # Fuel & Emissions
    fuel_level = Column(Float)  # Percentage
    fuel_rate = Column(Float)  # L/hour
    short_term_fuel_trim = Column(Float)  # Percentage
    long_term_fuel_trim = Column(Float)  # Percentage
    
    # Battery & Electric
    battery_voltage = Column(Float)  # Volts
    alternator_voltage = Column(Float)  # Volts
    
    # Location & GPS (from phone sensors)
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float)
    gps_speed = Column(Float)  # km/h from GPS
    
    # Accelerometer (from phone sensors)
    accel_x = Column(Float)  # g-force
    accel_y = Column(Float)
    accel_z = Column(Float)
    
    # Computed metrics
    trip_distance = Column(Float)  # km since last reset
    trip_fuel_consumption = Column(Float)  # liters
    instant_fuel_economy = Column(Float)  # km/l
    
    # Diagnostic Trouble Codes
    dtc_count = Column(Integer, default=0)
    mil_status = Column(Boolean, default=False)  # Malfunction Indicator Light
    
    created_at = Column(DateTime, default=datetime.utcnow)


class ComponentHealth(Base):
    """Component-level health tracking with RUL predictions"""
    __tablename__ = "component_health"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    component_name = Column(String, index=True)  # battery, brake, engine, clutch, suspension
    component_type = Column(String)  # consumable, durable, critical
    
    # Health Metrics
    health_score = Column(Float)  # 0-100
    wear_percentage = Column(Float)  # 0-100
    remaining_life_km = Column(Float)  # Predicted km before replacement
    remaining_life_days = Column(Integer)  # Predicted days before failure
    confidence_score = Column(Float)  # 0-1 prediction confidence
    
    # Failure Prediction
    failure_probability = Column(Float)  # 0-1
    failure_risk = Column(String)  # low, medium, high, critical
    next_service_km = Column(Float)
    next_service_date = Column(DateTime)
    
    # Maintenance History
    last_replaced = Column(DateTime)
    last_serviced = Column(DateTime)
    service_count = Column(Integer, default=0)
    total_operating_hours = Column(Float)
    
    # Cost Estimation
    estimated_repair_cost = Column(Float)  # INR
    estimated_replacement_cost = Column(Float)  # INR
    
    # Alerts
    alert_sent = Column(Boolean, default=False)
    alert_level = Column(String)  # info, warning, critical
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class DriverBehavior(Base):
    """Driver behavior profiling for personalized predictions"""
    __tablename__ = "driver_behavior"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    
    # Driving Style Metrics
    aggression_score = Column(Float)  # 0-100 (harsh acceleration/braking)
    smoothness_score = Column(Float)  # 0-100
    avg_speed = Column(Float)  # km/h
    max_speed_recorded = Column(Float)  # km/h
    
    # Behavior Patterns
    harsh_acceleration_count = Column(Integer, default=0)
    harsh_braking_count = Column(Integer, default=0)
    rapid_lane_change_count = Column(Integer, default=0)
    overspeeding_count = Column(Integer, default=0)
    
    # Usage Patterns
    city_driving_percentage = Column(Float)  # 0-100
    highway_driving_percentage = Column(Float)  # 0-100
    night_driving_percentage = Column(Float)  # 0-100
    avg_trip_distance = Column(Float)  # km
    avg_trips_per_day = Column(Float)
    
    # Environmental Stress
    pothole_hits = Column(Integer, default=0)
    rough_road_km = Column(Float)  # km on bad roads
    traffic_jam_hours = Column(Float)  # hours in traffic
    high_temp_exposure_hours = Column(Float)  # hours above 40°C
    
    # Clustering
    driver_cluster = Column(String)  # conservative, moderate, aggressive
    usage_pattern = Column(String)  # daily_commuter, weekend_driver, long_distance
    
    # Time Windows
    analysis_start_date = Column(DateTime)
    analysis_end_date = Column(DateTime)
    total_trips_analyzed = Column(Integer)
    total_distance_analyzed = Column(Float)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class VehicleDTC(Base):
    """Diagnostic Trouble Codes history"""
    __tablename__ = "vehicle_dtc"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    dtc_code = Column(String, index=True)  # P0420, P0171, etc.
    description = Column(String)
    severity = Column(String)  # info, warning, critical
    status = Column(String)  # active, pending, cleared
    first_detected = Column(DateTime, default=datetime.utcnow)
    last_detected = Column(DateTime)
    cleared_at = Column(DateTime)
    occurrence_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class MaintenancePrediction(Base):
    """Predictive maintenance recommendations with ML confidence"""
    __tablename__ = "maintenance_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), index=True)
    component_id = Column(Integer, ForeignKey("component_health.id"))
    
    prediction_type = Column(String)  # RUL, failure_probability, service_due
    predicted_value = Column(Float)
    confidence_score = Column(Float)  # 0-1
    
    # Recommendation
    recommendation = Column(String)
    urgency = Column(String)  # low, medium, high, critical
    estimated_cost = Column(Float)  # INR
    recommended_action_date = Column(DateTime)
    
    # Model metadata
    model_version = Column(String)
    model_type = Column(String)  # rule_based, ml_model, hybrid
    features_used = Column(JSON)  # Store feature values used for prediction
    
    # User interaction
    user_acknowledged = Column(Boolean, default=False)
    user_feedback = Column(String)  # helpful, not_helpful, false_alarm
    
    prediction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
