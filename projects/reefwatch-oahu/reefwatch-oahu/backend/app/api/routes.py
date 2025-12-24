"""
API Routes for ReefWatch Oahu.

Defines all REST API endpoints for the application including
ocean conditions, sites, alerts, forecasts, and chat.
"""

import logging
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings, OAHU_SITES, get_site_by_id
from app.models.schemas import (
    AlertsResponse,
    ChatRequest,
    ChatResponse,
    Coordinates,
    CurrentConditionsResponse,
    DataRefreshRequest,
    DataRefreshResponse,
    ForecastResponse,
    HealthResponse,
    Site,
    SiteDifficulty,
    SiteHistoryResponse,
    SiteListResponse,
    SiteType,
)
from app.services import bigquery_service, chat_service, forecast_service

logger = logging.getLogger(__name__)
settings = get_settings()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create router
router = APIRouter()


# Health & Status Endpoints

@router.get("/health", response_model=HealthResponse, tags=["Status"])
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.

    Returns service status and individual component health.
    """
    checks = {
        "api": "healthy",
        "bigquery": "unknown",
        "anthropic": "unknown"
    }

    # Test BigQuery connection
    try:
        conditions = await bigquery_service.get_current_conditions()
        checks["bigquery"] = "healthy" if conditions else "degraded"
    except Exception as e:
        logger.error(f"BigQuery health check failed: {e}")
        checks["bigquery"] = "unhealthy"

    # Determine overall status
    if all(v == "healthy" for v in checks.values()):
        status = "healthy"
    elif checks["api"] == "healthy" and checks["bigquery"] in ["healthy", "degraded"]:
        status = "degraded"
    else:
        status = "unhealthy"

    return HealthResponse(
        status=status,
        version=settings.app_version,
        timestamp=datetime.utcnow(),
        checks=checks
    )


# Sites Endpoints

@router.get("/sites", response_model=SiteListResponse, tags=["Sites"])
async def get_sites(
    type: Optional[SiteType] = Query(None, description="Filter by site type"),
    difficulty: Optional[SiteDifficulty] = Query(None, description="Filter by difficulty")
):
    """
    Get list of all dive/snorkel sites on Oahu.

    Optionally filter by site type or difficulty level.
    """
    sites = []

    for site_data in OAHU_SITES:
        # Apply filters
        if type and site_data["type"] != type.value:
            continue
        if difficulty and site_data.get("difficulty") != difficulty.value:
            continue

        site = Site(
            id=site_data["id"],
            name=site_data["name"],
            coordinates=Coordinates(
                latitude=site_data["lat"],
                longitude=site_data["lon"]
            ),
            type=site_data["type"],
            description=site_data["description"],
            facilities=site_data.get("facilities", []),
            best_conditions=site_data.get("best_conditions", ""),
            difficulty=site_data.get("difficulty", "all_levels")
        )
        sites.append(site)

    return SiteListResponse(sites=sites, count=len(sites))


@router.get("/sites/{site_id}", response_model=Site, tags=["Sites"])
async def get_site(site_id: str):
    """Get detailed information for a specific site."""
    site_data = get_site_by_id(site_id)

    if not site_data:
        raise HTTPException(status_code=404, detail=f"Site not found: {site_id}")

    return Site(
        id=site_data["id"],
        name=site_data["name"],
        coordinates=Coordinates(
            latitude=site_data["lat"],
            longitude=site_data["lon"]
        ),
        type=site_data["type"],
        description=site_data["description"],
        facilities=site_data.get("facilities", []),
        best_conditions=site_data.get("best_conditions", ""),
        difficulty=site_data.get("difficulty", "all_levels")
    )


@router.get("/sites/{site_id}/history", response_model=SiteHistoryResponse, tags=["Sites"])
async def get_site_history(
    site_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days of history")
):
    """
    Get historical ocean conditions for a specific site.

    Returns up to 365 days of historical data including SST,
    SST anomaly, DHW, and risk levels.
    """
    site_data = get_site_by_id(site_id)
    if not site_data:
        raise HTTPException(status_code=404, detail=f"Site not found: {site_id}")

    history = await bigquery_service.get_site_history(site_id, days)
    statistics = await bigquery_service.get_site_statistics(site_id, days)

    # Calculate period
    if history:
        period_start = history[0].date
        period_end = history[-1].date
    else:
        period_end = date.today()
        period_start = date.today()

    return SiteHistoryResponse(
        site_id=site_id,
        site_name=site_data["name"],
        data=history,
        period_start=period_start,
        period_end=period_end,
        statistics=statistics
    )


# Current Conditions Endpoints

@router.get("/current-conditions", response_model=CurrentConditionsResponse, tags=["Conditions"])
async def get_current_conditions():
    """
    Get current ocean conditions for all Oahu sites.

    Returns the most recent data available for each site including
    SST, anomaly, DHW, and calculated bleaching risk.
    """
    sites = await bigquery_service.get_current_conditions()

    # Get the most recent data date
    data_dates = [s.last_updated.date() for s in sites if s.last_updated]
    data_date = max(data_dates) if data_dates else date.today()

    return CurrentConditionsResponse(
        sites=sites,
        data_date=data_date,
        updated_at=datetime.utcnow()
    )


# Alerts Endpoints

@router.get("/alerts", response_model=AlertsResponse, tags=["Alerts"])
async def get_alerts():
    """
    Get all active coral bleaching and weather alerts.

    Returns both stored alerts and dynamically generated alerts
    based on current conditions.
    """
    alerts = await bigquery_service.get_active_alerts()

    return AlertsResponse(
        alerts=alerts,
        count=len(alerts)
    )


# Forecast Endpoints

@router.get("/forecast", response_model=ForecastResponse, tags=["Forecast"])
async def get_forecast(
    days: int = Query(7, ge=1, le=7, description="Number of days to forecast")
):
    """
    Get 7-day forecast for all sites.

    Forecasts include predicted SST, DHW, and risk levels
    with confidence scores that decrease over the forecast horizon.
    """
    forecasts = await forecast_service.get_all_forecasts(days)

    return ForecastResponse(
        forecasts=forecasts,
        generated_at=datetime.utcnow()
    )


@router.get("/forecast/{site_id}", tags=["Forecast"])
async def get_site_forecast(
    site_id: str,
    days: int = Query(7, ge=1, le=7, description="Number of days to forecast")
):
    """Get forecast for a specific site."""
    site_data = get_site_by_id(site_id)
    if not site_data:
        raise HTTPException(status_code=404, detail=f"Site not found: {site_id}")

    forecast = await forecast_service.get_site_forecast(site_id, days)

    if not forecast:
        raise HTTPException(status_code=404, detail="Could not generate forecast")

    return forecast


@router.get("/recommendations", tags=["Forecast"])
async def get_recommendations(
    target_date: date = Query(..., description="Date to get recommendations for")
):
    """
    Get recommended sites for a specific date.

    Returns sites ranked by predicted conditions, with lowest
    risk sites listed first.
    """
    days_ahead = (target_date - date.today()).days

    if days_ahead < 1:
        raise HTTPException(status_code=400, detail="Date must be in the future")
    if days_ahead > 7:
        raise HTTPException(status_code=400, detail="Cannot recommend beyond 7 days")

    recommendations = await forecast_service.get_best_sites_for_date(target_date)

    return {
        "target_date": target_date.isoformat(),
        "recommendations": recommendations
    }


# Chat Endpoints

@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
@limiter.limit("30/minute")
async def chat(request: Request, chat_request: ChatRequest):
    """
    Send a message to the AI assistant.

    The assistant can answer questions about ocean conditions,
    coral health, and provide recommendations for visitors.
    Detects Hawaiian Pidgin and responds in kind.
    """
    response_text, session_id = await chat_service.chat(
        message=chat_request.message,
        session_id=chat_request.session_id,
        include_context=chat_request.include_context
    )

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        context_used=chat_request.include_context,
        model=settings.chat_model
    )


@router.post("/chat/stream", tags=["Chat"])
@limiter.limit("30/minute")
async def chat_stream(request: Request, chat_request: ChatRequest):
    """
    Stream a chat response for better UX.

    Returns Server-Sent Events with response chunks.
    """
    async def generate():
        async for chunk, is_final, session_id in chat_service.chat_stream(
            message=chat_request.message,
            session_id=chat_request.session_id,
            include_context=chat_request.include_context
        ):
            if is_final:
                yield f"data: {{\"done\": true, \"session_id\": \"{session_id}\"}}\n\n"
            else:
                # Escape for JSON
                escaped = chunk.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
                yield f"data: {{\"content\": \"{escaped}\"}}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.delete("/chat/{session_id}", tags=["Chat"])
async def clear_chat_session(session_id: str):
    """Clear a chat session and its history."""
    success = chat_service.clear_session(session_id)

    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"message": "Session cleared", "session_id": session_id}


# Admin Endpoints

@router.post("/admin/refresh", response_model=DataRefreshResponse, tags=["Admin"])
@limiter.limit("5/minute")
async def refresh_data(request: Request, refresh_request: DataRefreshRequest):
    """
    Manually trigger a data refresh.

    Admin endpoint to force a refresh of ocean data from sources.
    Rate limited to prevent abuse.
    """
    # Clear cache
    bigquery_service.clear_cache()

    # In production, this would trigger the Cloud Function
    # For now, just clear cache and return
    return DataRefreshResponse(
        status="success",
        message="Cache cleared. Data will refresh on next request.",
        records_updated=0,
        timestamp=datetime.utcnow()
    )


@router.get("/admin/stats", tags=["Admin"])
async def get_admin_stats():
    """Get administrative statistics about the data."""
    summary = await bigquery_service.get_data_summary()

    return {
        "data_summary": summary,
        "cache_info": {
            "max_size": settings.cache_max_size,
            "ttl_seconds": settings.cache_ttl_seconds
        }
    }
