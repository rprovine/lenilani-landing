"""
Forecast Service for ReefWatch Oahu.

Generates 7-day forecasts for ocean conditions using historical trends
and persistence modeling. In production, this would integrate with
NOAA forecast products.
"""

import logging
from datetime import date, datetime, timedelta
from typing import List, Optional

from app.core.config import get_settings, OAHU_SITES
from app.models.schemas import (
    ForecastDataPoint,
    RiskLevel,
    SiteForecastResponse,
)
from app.services.bigquery_service import get_site_history, get_current_conditions

logger = logging.getLogger(__name__)
settings = get_settings()


def _calculate_risk_from_dhw(dhw: float) -> RiskLevel:
    """Calculate risk level from DHW value."""
    if dhw < 4:
        return RiskLevel.LOW
    elif dhw < 8:
        return RiskLevel.MODERATE
    elif dhw < 12:
        return RiskLevel.HIGH
    else:
        return RiskLevel.SEVERE


def _simple_persistence_forecast(
    recent_sst: List[float],
    recent_dhw: List[float],
    days: int = 7
) -> List[dict]:
    """
    Generate a simple persistence-based forecast.

    Uses recent trends to project forward. This is a basic approach;
    in production, you'd use NOAA forecast products or ML models.
    """
    if not recent_sst or not recent_dhw:
        return []

    # Calculate recent trend (last 7 days)
    if len(recent_sst) >= 7:
        sst_trend = (recent_sst[-1] - recent_sst[-7]) / 7
    elif len(recent_sst) >= 2:
        sst_trend = (recent_sst[-1] - recent_sst[0]) / len(recent_sst)
    else:
        sst_trend = 0

    if len(recent_dhw) >= 7:
        dhw_trend = (recent_dhw[-1] - recent_dhw[-7]) / 7
    elif len(recent_dhw) >= 2:
        dhw_trend = (recent_dhw[-1] - recent_dhw[0]) / len(recent_dhw)
    else:
        dhw_trend = 0

    # Start from most recent values
    current_sst = recent_sst[-1]
    current_dhw = recent_dhw[-1]

    forecast = []
    today = date.today()

    for i in range(1, days + 1):
        forecast_date = today + timedelta(days=i)

        # Project forward with damping (trend decreases over time)
        damping = 1 - (i * 0.1)  # Reduces confidence each day
        damping = max(damping, 0.3)  # Keep at least 30% of trend

        predicted_sst = current_sst + (sst_trend * i * damping)
        predicted_dhw = max(0, current_dhw + (dhw_trend * i * damping))

        # Add some realistic bounds
        predicted_sst = max(22, min(32, predicted_sst))  # Hawaiian waters range
        predicted_dhw = max(0, min(20, predicted_dhw))

        # Confidence decreases with forecast horizon
        confidence = max(0.3, 1 - (i * 0.1))

        forecast.append({
            "date": forecast_date,
            "predicted_sst": round(predicted_sst, 1),
            "predicted_dhw": round(predicted_dhw, 1),
            "predicted_risk": _calculate_risk_from_dhw(predicted_dhw),
            "confidence": round(confidence, 2)
        })

    return forecast


async def get_site_forecast(
    site_id: str,
    days: int = 7
) -> Optional[SiteForecastResponse]:
    """
    Generate a forecast for a specific site.

    Args:
        site_id: Site identifier
        days: Number of days to forecast (1-7)

    Returns:
        SiteForecastResponse with forecast data
    """
    # Get site metadata
    site = next((s for s in OAHU_SITES if s["id"] == site_id), None)
    if not site:
        logger.warning(f"Site not found: {site_id}")
        return None

    # Get recent historical data for trend analysis
    history = await get_site_history(site_id, days=14)

    if not history:
        logger.warning(f"No historical data for forecast: {site_id}")
        # Return a basic forecast with unknown confidence
        return SiteForecastResponse(
            site_id=site_id,
            site_name=site["name"],
            forecast=[
                ForecastDataPoint(
                    date=date.today() + timedelta(days=i),
                    predicted_sst=26.0,  # Average Hawaiian water temp
                    predicted_dhw=2.0,   # Low baseline
                    predicted_risk=RiskLevel.LOW,
                    confidence=0.2
                )
                for i in range(1, days + 1)
            ],
            generated_at=datetime.utcnow()
        )

    # Extract SST and DHW values
    sst_values = [h.sst for h in history if h.sst is not None]
    dhw_values = [h.dhw for h in history if h.dhw is not None]

    # Generate forecast
    forecast_data = _simple_persistence_forecast(sst_values, dhw_values, days)

    forecast_points = [
        ForecastDataPoint(**f) for f in forecast_data
    ]

    return SiteForecastResponse(
        site_id=site_id,
        site_name=site["name"],
        forecast=forecast_points,
        generated_at=datetime.utcnow()
    )


async def get_all_forecasts(days: int = 7) -> List[SiteForecastResponse]:
    """
    Generate forecasts for all sites.

    Returns:
        List of forecasts for each site
    """
    forecasts = []

    for site in OAHU_SITES:
        forecast = await get_site_forecast(site["id"], days)
        if forecast:
            forecasts.append(forecast)

    return forecasts


async def get_best_sites_for_date(target_date: date) -> List[dict]:
    """
    Get recommended sites for a specific date based on forecasted conditions.

    Returns sites ranked by predicted risk level (lowest first).
    """
    days_ahead = (target_date - date.today()).days

    if days_ahead < 1 or days_ahead > 7:
        return []

    forecasts = await get_all_forecasts(days=days_ahead)

    site_predictions = []
    for forecast in forecasts:
        if forecast.forecast and len(forecast.forecast) >= days_ahead:
            prediction = forecast.forecast[days_ahead - 1]
            site_predictions.append({
                "site_id": forecast.site_id,
                "site_name": forecast.site_name,
                "predicted_sst": prediction.predicted_sst,
                "predicted_dhw": prediction.predicted_dhw,
                "predicted_risk": prediction.predicted_risk.value,
                "confidence": prediction.confidence
            })

    # Sort by risk (low to high) then by confidence (high to low)
    risk_order = {"Low": 0, "Moderate": 1, "High": 2, "Severe": 3, "Unknown": 4}
    site_predictions.sort(
        key=lambda x: (risk_order.get(x["predicted_risk"], 4), -x["confidence"])
    )

    return site_predictions
