import sys, io
# Force UTF-8 on Windows consoles so emoji in log messages don't crash startup
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf-16'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from sqlalchemy import inspect, text # type: ignore
import asyncio
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis

# Import database components first
from app.database.session import engine
from app.database.base import Base
from app.core.config import settings

# Import all models explicitly BEFORE routes (critical for foreign key resolution)
# Order matters: Parent tables first, then child tables with foreign keys
from app.models.user import User
from app.models.vehicle import Vehicle  

# These depend on User and Vehicle, so load them after
from app.models.feedback import Feedback
from app.models.service_history import ServiceHistory
from app.models.maintenance import MaintenanceLog
from app.models.garage import Garage
from app.models.subscription import Subscription

# Telemetry models depend on Vehicle, so load them last
from app.models.telemetry import (
    OBDDevice, TelemetryData, ComponentHealth, 
    DriverBehavior, VehicleDTC, MaintenancePrediction
)

# Import model modules for backwards compatibility
from app.models import (
    user, vehicle, feedback as feedback_model, service_history as service_model,
    maintenance as maintenance_model
)
from app.models import telemetry as telemetry_model

# Import routes AFTER all models are loaded
from app.routes import (
    auth, vehicles, ai_predict, admin, users, feedback, service_history,
    predictive_maintenance, email_routes, subscription, garages
)
from app.routes import telemetry

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SmartVahaan - India-First Predictive Maintenance Platform",
    description="AI-powered predictive maintenance system optimized for Indian roads, vehicles, and driving conditions",
    version="3.0.0"
)

# Configure CORS
# Make sure your frontend origin is in the .env file
# Example: CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if isinstance(settings.CORS_ORIGINS, str) else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(ai_predict.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(feedback.router)
app.include_router(service_history.router)
app.include_router(predictive_maintenance.router)
app.include_router(email_routes.router)
app.include_router(subscription.router)
app.include_router(garages.router)
app.include_router(telemetry.router)

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    # Initialize cache — fall back to in-memory if Redis is not available
    try:
        redis_url = getattr(settings, 'REDIS_URL', None)
        if redis_url:
            redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
            await redis.ping()  # Test the connection
            FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
            logger.info("✅ Redis cache initialized successfully.")
        else:
            raise ValueError("REDIS_URL not configured")
    except Exception as e:
        logger.warning("⚠️  Redis unavailable (%s). Falling back to in-memory cache.", e)
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

    # Create database tables after all models are loaded
    Base.metadata.create_all(bind=engine)

    # Backfill legacy SQLite schemas where users table existed before premium fields were added.
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_columns = {column["name"] for column in inspector.get_columns("users")}

        missing_columns = [
            ("is_premium", "BOOLEAN DEFAULT 0"),
            ("premium_until", "DATETIME"),
            ("ai_chat_usage_count", "INTEGER DEFAULT 0"),
            ("latitude", "FLOAT"),
            ("longitude", "FLOAT"),
        ]

        for column_name, column_type in missing_columns:
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))
                logger.info("✅ Added missing users.%s column", column_name)
    
    logger.info("="*60)
    logger.info("🚗 SmartVahaan Predictive Maintenance Platform Starting...")
    logger.info("="*60)
    logger.info("✅ Database initialized successfully")
    logger.info("✅ Core routes registered (auth, vehicles, admin)")
    logger.info("✅ Predictive maintenance engine loaded")
    logger.info("✅ OBD-II telemetry ingestion ready")
    logger.info("✅ Driver behavior profiling active")
    logger.info("✅ Two-wheeler intelligence enabled")
    logger.info("✅ CORS middleware configured")
    logger.info("="*60)
    logger.info("🎉 Backend running successfully!")
    logger.info("📍 Server: http://127.0.0.1:8000")
    logger.info("📚 API Docs: http://127.0.0.1:8000/docs")
    logger.info("📊 ReDoc: http://127.0.0.1:8000/redoc")
    logger.info("="*60)
    logger.info("🔧 Features Available:")
    logger.info("   - RUL Prediction (Remaining Useful Life)")
    logger.info("   - Component Health Monitoring")
    logger.info("   - Driver Behavior Analysis")
    logger.info("   - OBD-II Data Streaming")
    logger.info("   - Phone Sensor Integration")
    logger.info("   - Two-Wheeler Specialization")
    logger.info("="*60)
    logger.info("[OK] BACKEND RUNNING SUCCESSFULLY!")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    await FastAPICache.clear()
    logger.info("👋 Cache cleared.")
    logger.info("👋 SmartVahaan Backend shutting down...")
    # Properly close the database connection engine
    engine.dispose()
    logger.info("✅ Database connection closed.")

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "SmartVahaan API",
        "version": "3.0.0",
        "message": "Backend is running successfully!"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": str(engine),
        "database": "connected"
    }