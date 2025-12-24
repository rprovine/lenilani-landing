"""
Tests for Pydantic schema models.
"""

import pytest
from datetime import date, datetime
from pydantic import ValidationError

from app.models.schemas import (
    Alert,
    AlertSeverity,
    AlertType,
    BleachingRisk,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    Coordinates,
    CurrentConditionsResponse,
    DataRefreshRequest,
    ForecastDataPoint,
    HealthResponse,
    HistoricalDataPoint,
    OceanConditions,
    RiskColor,
    RiskLevel,
    Site,
    SiteDifficulty,
    SiteType,
    SiteWithConditions,
)


class TestCoordinates:
    """Tests for Coordinates model."""

    def test_valid_coordinates(self):
        """Test valid coordinates."""
        coords = Coordinates(latitude=21.2693, longitude=-157.6943)
        assert coords.latitude == 21.2693
        assert coords.longitude == -157.6943

    def test_latitude_out_of_range(self):
        """Test that latitude out of range fails validation."""
        with pytest.raises(ValidationError):
            Coordinates(latitude=91.0, longitude=0.0)

        with pytest.raises(ValidationError):
            Coordinates(latitude=-91.0, longitude=0.0)

    def test_longitude_out_of_range(self):
        """Test that longitude out of range fails validation."""
        with pytest.raises(ValidationError):
            Coordinates(latitude=0.0, longitude=181.0)

        with pytest.raises(ValidationError):
            Coordinates(latitude=0.0, longitude=-181.0)

    def test_edge_case_coordinates(self):
        """Test edge case coordinate values."""
        # Extreme valid values
        coords = Coordinates(latitude=90.0, longitude=180.0)
        assert coords.latitude == 90.0

        coords = Coordinates(latitude=-90.0, longitude=-180.0)
        assert coords.latitude == -90.0


class TestRiskLevel:
    """Tests for RiskLevel enum."""

    def test_risk_level_values(self):
        """Test RiskLevel enum values."""
        assert RiskLevel.LOW.value == "Low"
        assert RiskLevel.MODERATE.value == "Moderate"
        assert RiskLevel.HIGH.value == "High"
        assert RiskLevel.SEVERE.value == "Severe"
        assert RiskLevel.UNKNOWN.value == "Unknown"


class TestBleachingRisk:
    """Tests for BleachingRisk model."""

    def test_valid_bleaching_risk(self):
        """Test valid bleaching risk."""
        risk = BleachingRisk(
            level=RiskLevel.LOW,
            color=RiskColor.GREEN,
            score=0,
            description="Normal conditions"
        )
        assert risk.level == RiskLevel.LOW
        assert risk.score == 0

    def test_score_validation(self):
        """Test that score validation works."""
        # Valid scores
        BleachingRisk(level=RiskLevel.LOW, color=RiskColor.GREEN, score=-1, description="Test")
        BleachingRisk(level=RiskLevel.LOW, color=RiskColor.GREEN, score=3, description="Test")

        # Invalid scores
        with pytest.raises(ValidationError):
            BleachingRisk(level=RiskLevel.LOW, color=RiskColor.GREEN, score=-2, description="Test")

        with pytest.raises(ValidationError):
            BleachingRisk(level=RiskLevel.LOW, color=RiskColor.GREEN, score=4, description="Test")


class TestOceanConditions:
    """Tests for OceanConditions model."""

    def test_valid_ocean_conditions(self):
        """Test valid ocean conditions."""
        conditions = OceanConditions(
            sst=26.5,
            sst_anomaly=0.3,
            hotspot=0.5,
            dhw=2.1,
            temperature_trend="stable"
        )
        assert conditions.sst == 26.5
        assert conditions.dhw == 2.1

    def test_optional_fields(self):
        """Test that all fields are optional."""
        conditions = OceanConditions()
        assert conditions.sst is None
        assert conditions.dhw is None

    def test_dhw_non_negative(self):
        """Test that DHW must be non-negative."""
        with pytest.raises(ValidationError):
            OceanConditions(dhw=-1.0)


class TestSite:
    """Tests for Site model."""

    def test_valid_site(self):
        """Test valid site creation."""
        site = Site(
            id="test-site",
            name="Test Site",
            coordinates=Coordinates(latitude=21.0, longitude=-157.0),
            type=SiteType.BEACH,
            description="A test site",
            best_conditions="Morning",
            difficulty=SiteDifficulty.BEGINNER
        )
        assert site.id == "test-site"
        assert site.type == SiteType.BEACH

    def test_facilities_default(self):
        """Test that facilities defaults to empty list."""
        site = Site(
            id="test",
            name="Test",
            coordinates=Coordinates(latitude=21.0, longitude=-157.0),
            type=SiteType.BEACH,
            description="Test",
            best_conditions="Any",
            difficulty=SiteDifficulty.ALL_LEVELS
        )
        assert site.facilities == []


class TestSiteWithConditions:
    """Tests for SiteWithConditions model."""

    def test_valid_site_with_conditions(self):
        """Test valid site with conditions."""
        site = SiteWithConditions(
            id="test-site",
            name="Test Site",
            coordinates=Coordinates(latitude=21.0, longitude=-157.0),
            type=SiteType.BEACH,
            description="A test site",
            best_conditions="Morning",
            difficulty=SiteDifficulty.BEGINNER,
            conditions=OceanConditions(sst=26.5),
            risk=BleachingRisk(
                level=RiskLevel.LOW,
                color=RiskColor.GREEN,
                score=0,
                description="Normal"
            )
        )
        assert site.conditions.sst == 26.5

    def test_conditions_optional(self):
        """Test that conditions can be None."""
        site = SiteWithConditions(
            id="test",
            name="Test",
            coordinates=Coordinates(latitude=21.0, longitude=-157.0),
            type=SiteType.BEACH,
            description="Test",
            best_conditions="Any",
            difficulty=SiteDifficulty.ALL_LEVELS,
            risk=BleachingRisk(
                level=RiskLevel.UNKNOWN,
                color=RiskColor.GRAY,
                score=-1,
                description="Unknown"
            )
        )
        assert site.conditions is None


class TestHistoricalDataPoint:
    """Tests for HistoricalDataPoint model."""

    def test_valid_historical_data_point(self):
        """Test valid historical data point."""
        point = HistoricalDataPoint(
            date=date.today(),
            sst=26.5,
            sst_anomaly=0.3,
            dhw=2.1,
            risk_level=RiskLevel.LOW
        )
        assert point.sst == 26.5

    def test_optional_fields(self):
        """Test that data fields are optional."""
        point = HistoricalDataPoint(date=date.today())
        assert point.sst is None
        assert point.dhw is None


class TestForecastDataPoint:
    """Tests for ForecastDataPoint model."""

    def test_valid_forecast_data_point(self):
        """Test valid forecast data point."""
        point = ForecastDataPoint(
            date=date.today(),
            predicted_sst=26.5,
            predicted_dhw=2.1,
            predicted_risk=RiskLevel.LOW,
            confidence=0.9
        )
        assert point.confidence == 0.9

    def test_confidence_validation(self):
        """Test that confidence must be between 0 and 1."""
        with pytest.raises(ValidationError):
            ForecastDataPoint(
                date=date.today(),
                predicted_sst=26.5,
                predicted_dhw=2.1,
                predicted_risk=RiskLevel.LOW,
                confidence=1.5
            )

        with pytest.raises(ValidationError):
            ForecastDataPoint(
                date=date.today(),
                predicted_sst=26.5,
                predicted_dhw=2.1,
                predicted_risk=RiskLevel.LOW,
                confidence=-0.1
            )


class TestAlert:
    """Tests for Alert model."""

    def test_valid_alert(self):
        """Test valid alert creation."""
        alert = Alert(
            id="alert-1",
            type=AlertType.BLEACHING,
            severity=AlertSeverity.WARNING,
            title="Test Alert",
            description="Test description",
            created_at=datetime.utcnow()
        )
        assert alert.is_active is True
        assert alert.affected_sites == []

    def test_alert_with_affected_sites(self):
        """Test alert with affected sites."""
        alert = Alert(
            id="alert-1",
            type=AlertType.BLEACHING,
            severity=AlertSeverity.ALERT,
            title="Test",
            description="Test",
            affected_sites=["site1", "site2"],
            created_at=datetime.utcnow()
        )
        assert len(alert.affected_sites) == 2


class TestChatModels:
    """Tests for chat-related models."""

    def test_valid_chat_message(self):
        """Test valid chat message."""
        msg = ChatMessage(role="user", content="Hello")
        assert msg.role == "user"

    def test_chat_message_invalid_role(self):
        """Test that invalid role fails validation."""
        with pytest.raises(ValidationError):
            ChatMessage(role="system", content="Hello")

    def test_chat_request(self):
        """Test chat request model."""
        request = ChatRequest(message="How are conditions?")
        assert request.include_context is True
        assert request.session_id is None

    def test_chat_request_message_limits(self):
        """Test chat request message length limits."""
        # Valid message
        ChatRequest(message="Hello")

        # Empty message fails
        with pytest.raises(ValidationError):
            ChatRequest(message="")

        # Too long message fails
        with pytest.raises(ValidationError):
            ChatRequest(message="x" * 2001)

    def test_chat_response(self):
        """Test chat response model."""
        response = ChatResponse(
            response="The conditions are great!",
            session_id="abc123",
            context_used=True,
            model="claude-sonnet"
        )
        assert response.response == "The conditions are great!"


class TestHealthResponse:
    """Tests for HealthResponse model."""

    def test_valid_health_response(self):
        """Test valid health response."""
        response = HealthResponse(
            status="healthy",
            version="1.0.0",
            timestamp=datetime.utcnow()
        )
        assert response.status == "healthy"
        assert response.checks == {}

    def test_health_response_with_checks(self):
        """Test health response with component checks."""
        response = HealthResponse(
            status="degraded",
            version="1.0.0",
            timestamp=datetime.utcnow(),
            checks={"api": "healthy", "database": "unhealthy"}
        )
        assert len(response.checks) == 2
