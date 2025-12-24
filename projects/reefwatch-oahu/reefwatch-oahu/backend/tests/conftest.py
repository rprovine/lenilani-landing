"""
Pytest configuration and fixtures for ReefWatch Oahu tests.
"""

import pytest
from datetime import date, datetime
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import (
    BleachingRisk,
    Coordinates,
    HistoricalDataPoint,
    OceanConditions,
    RiskColor,
    RiskLevel,
    SiteWithConditions,
    Alert,
    AlertSeverity,
    AlertType,
)


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def mock_site_with_conditions():
    """Create a mock SiteWithConditions for testing."""
    return SiteWithConditions(
        id="hanauma-bay",
        name="Hanauma Bay",
        coordinates=Coordinates(latitude=21.2693, longitude=-157.6943),
        type="bay",
        description="Marine life conservation area",
        facilities=["restrooms", "parking"],
        best_conditions="Morning, calm days",
        difficulty="beginner",
        conditions=OceanConditions(
            sst=26.5,
            sst_anomaly=0.3,
            hotspot=0.5,
            dhw=2.1,
            temperature_trend="stable"
        ),
        risk=BleachingRisk(
            level=RiskLevel.LOW,
            color=RiskColor.GREEN,
            score=0,
            description="Conditions are normal."
        ),
        last_updated=datetime.utcnow()
    )


@pytest.fixture
def mock_sites_list(mock_site_with_conditions):
    """Create a list of mock sites for testing."""
    return [
        mock_site_with_conditions,
        SiteWithConditions(
            id="sharks-cove",
            name="Sharks Cove",
            coordinates=Coordinates(latitude=21.6447, longitude=-158.0631),
            type="cove",
            description="Rocky tide pools",
            facilities=["parking"],
            best_conditions="Summer months",
            difficulty="intermediate",
            conditions=OceanConditions(
                sst=27.2,
                sst_anomaly=0.8,
                hotspot=1.0,
                dhw=5.5,
                temperature_trend="rising"
            ),
            risk=BleachingRisk(
                level=RiskLevel.MODERATE,
                color=RiskColor.YELLOW,
                score=1,
                description="Slightly elevated temperatures."
            ),
            last_updated=datetime.utcnow()
        )
    ]


@pytest.fixture
def mock_historical_data():
    """Create mock historical data for testing."""
    today = date.today()
    return [
        HistoricalDataPoint(
            date=today,
            sst=26.5,
            sst_anomaly=0.3,
            dhw=2.1,
            risk_level=RiskLevel.LOW
        ),
        HistoricalDataPoint(
            date=today,
            sst=26.8,
            sst_anomaly=0.5,
            dhw=2.3,
            risk_level=RiskLevel.LOW
        )
    ]


@pytest.fixture
def mock_alert():
    """Create a mock alert for testing."""
    return Alert(
        id="test-alert-1",
        type=AlertType.BLEACHING,
        severity=AlertSeverity.WARNING,
        title="Coral Bleaching Warning",
        description="Elevated bleaching risk detected.",
        affected_sites=["sharks-cove", "pupukea"],
        created_at=datetime.utcnow(),
        is_active=True
    )


@pytest.fixture
def mock_bigquery_service(mock_sites_list, mock_historical_data, mock_alert):
    """Mock the BigQuery service for testing."""
    with patch("app.api.routes.bigquery_service") as mock:
        mock.get_current_conditions = AsyncMock(return_value=mock_sites_list)
        mock.get_site_history = AsyncMock(return_value=mock_historical_data)
        mock.get_site_statistics = AsyncMock(return_value={
            "avg_sst": 26.5,
            "max_sst": 28.0,
            "min_sst": 25.0,
            "avg_dhw": 2.5,
            "max_dhw": 5.0,
            "days_at_risk": 3,
            "data_coverage": 0.95
        })
        mock.get_active_alerts = AsyncMock(return_value=[mock_alert])
        mock.get_data_summary = AsyncMock(return_value={
            "date": date.today().isoformat(),
            "total_sites": 15,
            "sites_with_data": 15,
            "average_sst": 26.5,
            "max_sst": 28.0,
            "average_dhw": 2.5,
            "max_dhw": 5.0,
            "risk_distribution": {
                "low": 10,
                "moderate": 3,
                "high": 2,
                "severe": 0
            },
            "sites": []
        })
        mock.clear_cache = MagicMock()
        yield mock


@pytest.fixture
def mock_forecast_service():
    """Mock the forecast service for testing."""
    from app.models.schemas import ForecastDataPoint, SiteForecastResponse

    today = date.today()
    mock_forecast = SiteForecastResponse(
        site_id="hanauma-bay",
        site_name="Hanauma Bay",
        forecast=[
            ForecastDataPoint(
                date=today,
                predicted_sst=26.5,
                predicted_dhw=2.1,
                predicted_risk=RiskLevel.LOW,
                confidence=0.9
            )
        ],
        generated_at=datetime.utcnow()
    )

    with patch("app.api.routes.forecast_service") as mock:
        mock.get_all_forecasts = AsyncMock(return_value=[mock_forecast])
        mock.get_site_forecast = AsyncMock(return_value=mock_forecast)
        mock.get_best_sites_for_date = AsyncMock(return_value=[
            {
                "site_id": "hanauma-bay",
                "site_name": "Hanauma Bay",
                "predicted_sst": 26.5,
                "predicted_dhw": 2.1,
                "predicted_risk": "Low",
                "confidence": 0.9
            }
        ])
        yield mock


@pytest.fixture
def mock_chat_service():
    """Mock the chat service for testing."""
    with patch("app.api.routes.chat_service") as mock:
        mock.chat = AsyncMock(return_value=(
            "The water conditions look great today!",
            "test-session-123"
        ))
        mock.chat_stream = AsyncMock()
        mock.clear_session = MagicMock(return_value=True)
        yield mock
