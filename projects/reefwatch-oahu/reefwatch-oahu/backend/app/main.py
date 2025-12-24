"""
ReefWatch Oahu API - Main Application Entry Point

FastAPI application that serves the ReefWatch Oahu backend API.
Provides endpoints for ocean conditions, site information,
alerts, forecasts, and AI chat assistance.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api.routes import router
from app.core.config import get_settings
from app.services import chat_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")

    yield

    # Shutdown
    logger.info("Shutting down...")
    # Clean up old chat sessions
    cleaned = chat_service.cleanup_old_sessions(max_age_hours=24)
    logger.info(f"Cleaned up {cleaned} old chat sessions")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="""
    ReefWatch Oahu API provides real-time ocean conditions and coral bleaching
    risk information for popular dive and snorkel sites around Oahu, Hawaii.

    ## Features
    - Current ocean conditions (SST, anomaly, DHW)
    - Coral bleaching risk assessments
    - 7-day forecasts
    - Active alerts and warnings
    - AI-powered chat assistance

    ## Data Sources
    - NOAA Coral Reef Watch
    - PacIOOS Hawaii
    """,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"]
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# Include API routes
app.include_router(router, prefix="/api")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "documentation": "/docs",
        "endpoints": {
            "current_conditions": "/api/current-conditions",
            "sites": "/api/sites",
            "alerts": "/api/alerts",
            "forecast": "/api/forecast",
            "chat": "/api/chat",
            "health": "/api/health"
        }
    }


# For local development
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
