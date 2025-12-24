"""
Tests for forecast service.
"""

import pytest
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch

from app.models.schemas import RiskLevel, HistoricalDataPoint
from app.services.forecast_service import (
    _calculate_risk_from_dhw,
    _simple_persistence_forecast,
)


class TestCalculateRiskFromDhw:
    """Tests for _calculate_risk_from_dhw function."""

    def test_low_risk(self):
        """Test low risk for DHW < 4."""
        assert _calculate_risk_from_dhw(0) == RiskLevel.LOW
        assert _calculate_risk_from_dhw(2.5) == RiskLevel.LOW
        assert _calculate_risk_from_dhw(3.9) == RiskLevel.LOW

    def test_moderate_risk(self):
        """Test moderate risk for DHW 4-8."""
        assert _calculate_risk_from_dhw(4) == RiskLevel.MODERATE
        assert _calculate_risk_from_dhw(6) == RiskLevel.MODERATE
        assert _calculate_risk_from_dhw(7.9) == RiskLevel.MODERATE

    def test_high_risk(self):
        """Test high risk for DHW 8-12."""
        assert _calculate_risk_from_dhw(8) == RiskLevel.HIGH
        assert _calculate_risk_from_dhw(10) == RiskLevel.HIGH
        assert _calculate_risk_from_dhw(11.9) == RiskLevel.HIGH

    def test_severe_risk(self):
        """Test severe risk for DHW >= 12."""
        assert _calculate_risk_from_dhw(12) == RiskLevel.SEVERE
        assert _calculate_risk_from_dhw(15) == RiskLevel.SEVERE
        assert _calculate_risk_from_dhw(20) == RiskLevel.SEVERE


class TestSimplePersistenceForecast:
    """Tests for _simple_persistence_forecast function."""

    def test_empty_input_returns_empty(self):
        """Test that empty input returns empty list."""
        result = _simple_persistence_forecast([], [], 7)
        assert result == []

    def test_forecast_length_matches_days(self):
        """Test that forecast length matches requested days."""
        sst = [26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6]
        dhw = [2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6]

        result = _simple_persistence_forecast(sst, dhw, 7)
        assert len(result) == 7

        result = _simple_persistence_forecast(sst, dhw, 3)
        assert len(result) == 3

    def test_forecast_has_required_fields(self):
        """Test that forecast points have required fields."""
        sst = [26.0, 26.1, 26.2]
        dhw = [2.0, 2.1, 2.2]

        result = _simple_persistence_forecast(sst, dhw, 3)

        for point in result:
            assert "date" in point
            assert "predicted_sst" in point
            assert "predicted_dhw" in point
            assert "predicted_risk" in point
            assert "confidence" in point

    def test_forecast_dates_are_future(self):
        """Test that forecast dates are in the future."""
        sst = [26.0, 26.1, 26.2]
        dhw = [2.0, 2.1, 2.2]
        today = date.today()

        result = _simple_persistence_forecast(sst, dhw, 3)

        for i, point in enumerate(result):
            expected_date = today + timedelta(days=i + 1)
            assert point["date"] == expected_date

    def test_confidence_decreases_over_time(self):
        """Test that confidence decreases with forecast horizon."""
        sst = [26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6]
        dhw = [2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6]

        result = _simple_persistence_forecast(sst, dhw, 7)

        # Confidence should decrease
        for i in range(len(result) - 1):
            assert result[i]["confidence"] >= result[i + 1]["confidence"]

    def test_sst_within_bounds(self):
        """Test that predicted SST stays within realistic bounds."""
        # Extreme values
        sst = [30.0, 31.0, 32.0, 33.0, 34.0, 35.0, 36.0]
        dhw = [10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0]

        result = _simple_persistence_forecast(sst, dhw, 7)

        for point in result:
            assert 22 <= point["predicted_sst"] <= 32

    def test_dhw_non_negative(self):
        """Test that predicted DHW is never negative."""
        sst = [26.0, 25.5, 25.0, 24.5, 24.0, 23.5, 23.0]
        dhw = [1.0, 0.8, 0.6, 0.4, 0.2, 0.1, 0.0]

        result = _simple_persistence_forecast(sst, dhw, 7)

        for point in result:
            assert point["predicted_dhw"] >= 0

    def test_short_history_handled(self):
        """Test that short history is handled correctly."""
        sst = [26.0, 26.5]
        dhw = [2.0, 2.5]

        result = _simple_persistence_forecast(sst, dhw, 3)
        assert len(result) == 3


class TestGetSiteForecast:
    """Tests for get_site_forecast function."""

    @pytest.mark.asyncio
    async def test_get_site_forecast_nonexistent_site(self):
        """Test that nonexistent site returns None."""
        from app.services.forecast_service import get_site_forecast
        result = await get_site_forecast("nonexistent-site", 7)
        assert result is None

    @pytest.mark.asyncio
    async def test_get_site_forecast_returns_response(self):
        """Test that valid site returns forecast response."""
        with patch("app.services.forecast_service.get_site_history") as mock_history:
            mock_history.return_value = [
                HistoricalDataPoint(date=date.today() - timedelta(days=i), sst=26.0 + i * 0.1, dhw=2.0 + i * 0.1)
                for i in range(14)
            ]

            from app.services.forecast_service import get_site_forecast
            result = await get_site_forecast("hanauma-bay", 7)

            assert result is not None
            assert result.site_id == "hanauma-bay"
            assert result.site_name == "Hanauma Bay"
            assert len(result.forecast) == 7

    @pytest.mark.asyncio
    async def test_get_site_forecast_no_history(self):
        """Test forecast with no historical data returns default."""
        with patch("app.services.forecast_service.get_site_history") as mock_history:
            mock_history.return_value = []

            from app.services.forecast_service import get_site_forecast
            result = await get_site_forecast("hanauma-bay", 7)

            assert result is not None
            assert len(result.forecast) == 7
            # Should have low confidence
            for point in result.forecast:
                assert point.confidence == 0.2


class TestGetAllForecasts:
    """Tests for get_all_forecasts function."""

    @pytest.mark.asyncio
    async def test_get_all_forecasts_returns_list(self):
        """Test that get_all_forecasts returns a list."""
        with patch("app.services.forecast_service.get_site_forecast") as mock_forecast:
            mock_forecast.return_value = None

            from app.services.forecast_service import get_all_forecasts
            result = await get_all_forecasts(7)

            assert isinstance(result, list)


class TestGetBestSitesForDate:
    """Tests for get_best_sites_for_date function."""

    @pytest.mark.asyncio
    async def test_get_best_sites_invalid_date(self):
        """Test that invalid dates return empty list."""
        from app.services.forecast_service import get_best_sites_for_date

        # Past date
        past = date.today() - timedelta(days=1)
        result = await get_best_sites_for_date(past)
        assert result == []

        # Too far in future
        far_future = date.today() + timedelta(days=10)
        result = await get_best_sites_for_date(far_future)
        assert result == []

    @pytest.mark.asyncio
    async def test_get_best_sites_valid_date(self):
        """Test that valid date returns recommendations."""
        with patch("app.services.forecast_service.get_all_forecasts") as mock_forecasts:
            from app.models.schemas import SiteForecastResponse, ForecastDataPoint

            target = date.today() + timedelta(days=3)

            mock_forecasts.return_value = [
                SiteForecastResponse(
                    site_id="site1",
                    site_name="Site 1",
                    forecast=[
                        ForecastDataPoint(
                            date=date.today() + timedelta(days=i),
                            predicted_sst=26.0,
                            predicted_dhw=2.0,
                            predicted_risk=RiskLevel.LOW,
                            confidence=0.9
                        )
                        for i in range(1, 4)
                    ],
                    generated_at=None
                )
            ]

            from app.services.forecast_service import get_best_sites_for_date
            result = await get_best_sites_for_date(target)

            assert isinstance(result, list)
