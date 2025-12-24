"""
Tests for API routes.
"""

import pytest
from datetime import date, timedelta
from unittest.mock import patch, AsyncMock


class TestHealthEndpoint:
    """Tests for the /api/health endpoint."""

    def test_health_check_healthy(self, client, mock_bigquery_service):
        """Test health check returns healthy status."""
        response = client.get("/api/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] in ["healthy", "degraded"]
        assert "version" in data
        assert "timestamp" in data
        assert "checks" in data

    def test_health_check_includes_component_checks(self, client, mock_bigquery_service):
        """Test health check includes individual component checks."""
        response = client.get("/api/health")
        data = response.json()

        assert "api" in data["checks"]
        assert "bigquery" in data["checks"]


class TestSitesEndpoints:
    """Tests for the /api/sites endpoints."""

    def test_get_all_sites(self, client):
        """Test getting all sites."""
        response = client.get("/api/sites")
        assert response.status_code == 200

        data = response.json()
        assert "sites" in data
        assert "count" in data
        assert data["count"] == len(data["sites"])
        assert data["count"] > 0

    def test_get_sites_filter_by_type(self, client):
        """Test filtering sites by type."""
        response = client.get("/api/sites?type=bay")
        assert response.status_code == 200

        data = response.json()
        for site in data["sites"]:
            assert site["type"] == "bay"

    def test_get_sites_filter_by_difficulty(self, client):
        """Test filtering sites by difficulty."""
        response = client.get("/api/sites?difficulty=beginner")
        assert response.status_code == 200

        data = response.json()
        for site in data["sites"]:
            assert site["difficulty"] == "beginner"

    def test_get_sites_combined_filters(self, client):
        """Test filtering sites by multiple criteria."""
        response = client.get("/api/sites?type=beach&difficulty=beginner")
        assert response.status_code == 200

        data = response.json()
        for site in data["sites"]:
            assert site["type"] == "beach"
            assert site["difficulty"] == "beginner"

    def test_get_single_site(self, client):
        """Test getting a single site by ID."""
        response = client.get("/api/sites/hanauma-bay")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == "hanauma-bay"
        assert data["name"] == "Hanauma Bay"
        assert "coordinates" in data
        assert "type" in data
        assert "description" in data

    def test_get_nonexistent_site_returns_404(self, client):
        """Test getting a nonexistent site returns 404."""
        response = client.get("/api/sites/nonexistent-site")
        assert response.status_code == 404

    def test_get_site_history(self, client, mock_bigquery_service):
        """Test getting site history."""
        response = client.get("/api/sites/hanauma-bay/history")
        assert response.status_code == 200

        data = response.json()
        assert data["site_id"] == "hanauma-bay"
        assert "data" in data
        assert "period_start" in data
        assert "period_end" in data
        assert "statistics" in data

    def test_get_site_history_with_days_param(self, client, mock_bigquery_service):
        """Test getting site history with custom days parameter."""
        response = client.get("/api/sites/hanauma-bay/history?days=60")
        assert response.status_code == 200

    def test_get_site_history_invalid_days(self, client):
        """Test getting site history with invalid days parameter."""
        response = client.get("/api/sites/hanauma-bay/history?days=0")
        assert response.status_code == 422  # Validation error

        response = client.get("/api/sites/hanauma-bay/history?days=400")
        assert response.status_code == 422

    def test_get_site_history_nonexistent_site(self, client, mock_bigquery_service):
        """Test getting history for nonexistent site returns 404."""
        response = client.get("/api/sites/nonexistent/history")
        assert response.status_code == 404


class TestCurrentConditionsEndpoint:
    """Tests for the /api/current-conditions endpoint."""

    def test_get_current_conditions(self, client, mock_bigquery_service):
        """Test getting current conditions for all sites."""
        response = client.get("/api/current-conditions")
        assert response.status_code == 200

        data = response.json()
        assert "sites" in data
        assert "data_date" in data
        assert "updated_at" in data

    def test_current_conditions_include_site_data(self, client, mock_bigquery_service):
        """Test that current conditions include site-specific data."""
        response = client.get("/api/current-conditions")
        data = response.json()

        for site in data["sites"]:
            assert "id" in site
            assert "name" in site
            assert "risk" in site
            assert "level" in site["risk"]


class TestAlertsEndpoint:
    """Tests for the /api/alerts endpoint."""

    def test_get_alerts(self, client, mock_bigquery_service):
        """Test getting active alerts."""
        response = client.get("/api/alerts")
        assert response.status_code == 200

        data = response.json()
        assert "alerts" in data
        assert "count" in data
        assert data["count"] == len(data["alerts"])

    def test_alerts_structure(self, client, mock_bigquery_service):
        """Test that alerts have correct structure."""
        response = client.get("/api/alerts")
        data = response.json()

        if data["alerts"]:
            alert = data["alerts"][0]
            assert "id" in alert
            assert "type" in alert
            assert "severity" in alert
            assert "title" in alert
            assert "description" in alert


class TestForecastEndpoints:
    """Tests for the /api/forecast endpoints."""

    def test_get_forecast(self, client, mock_forecast_service):
        """Test getting forecast for all sites."""
        response = client.get("/api/forecast")
        assert response.status_code == 200

        data = response.json()
        assert "forecasts" in data
        assert "generated_at" in data

    def test_get_forecast_with_days(self, client, mock_forecast_service):
        """Test getting forecast with custom days parameter."""
        response = client.get("/api/forecast?days=3")
        assert response.status_code == 200

    def test_get_forecast_invalid_days(self, client):
        """Test getting forecast with invalid days parameter."""
        response = client.get("/api/forecast?days=0")
        assert response.status_code == 422

        response = client.get("/api/forecast?days=10")
        assert response.status_code == 422

    def test_get_site_forecast(self, client, mock_forecast_service):
        """Test getting forecast for a specific site."""
        response = client.get("/api/forecast/hanauma-bay")
        assert response.status_code == 200

        data = response.json()
        assert data["site_id"] == "hanauma-bay"
        assert "forecast" in data

    def test_get_site_forecast_nonexistent(self, client, mock_forecast_service):
        """Test getting forecast for nonexistent site returns 404."""
        response = client.get("/api/forecast/nonexistent-site")
        assert response.status_code == 404

    def test_get_recommendations(self, client, mock_forecast_service):
        """Test getting recommendations for a future date."""
        future_date = (date.today() + timedelta(days=3)).isoformat()
        response = client.get(f"/api/recommendations?target_date={future_date}")
        assert response.status_code == 200

        data = response.json()
        assert "target_date" in data
        assert "recommendations" in data

    def test_get_recommendations_past_date(self, client):
        """Test getting recommendations for past date returns 400."""
        past_date = (date.today() - timedelta(days=1)).isoformat()
        response = client.get(f"/api/recommendations?target_date={past_date}")
        assert response.status_code == 400

    def test_get_recommendations_too_far_future(self, client):
        """Test getting recommendations beyond 7 days returns 400."""
        far_date = (date.today() + timedelta(days=10)).isoformat()
        response = client.get(f"/api/recommendations?target_date={far_date}")
        assert response.status_code == 400


class TestChatEndpoints:
    """Tests for the /api/chat endpoints."""

    def test_chat_endpoint(self, client, mock_chat_service):
        """Test sending a chat message."""
        response = client.post(
            "/api/chat",
            json={"message": "How are the conditions today?"}
        )
        assert response.status_code == 200

        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert "context_used" in data
        assert "model" in data

    def test_chat_with_session_id(self, client, mock_chat_service):
        """Test chat with existing session ID."""
        response = client.post(
            "/api/chat",
            json={
                "message": "Follow up question",
                "session_id": "existing-session-123"
            }
        )
        assert response.status_code == 200

    def test_chat_without_context(self, client, mock_chat_service):
        """Test chat without including context."""
        response = client.post(
            "/api/chat",
            json={
                "message": "General question",
                "include_context": False
            }
        )
        assert response.status_code == 200

    def test_chat_empty_message_fails(self, client):
        """Test that empty message fails validation."""
        response = client.post("/api/chat", json={"message": ""})
        assert response.status_code == 422

    def test_chat_message_too_long_fails(self, client):
        """Test that overly long message fails validation."""
        response = client.post(
            "/api/chat",
            json={"message": "x" * 3000}  # Exceeds 2000 char limit
        )
        assert response.status_code == 422

    def test_clear_chat_session(self, client, mock_chat_service):
        """Test clearing a chat session."""
        response = client.delete("/api/chat/test-session-123")
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Session cleared"
        assert data["session_id"] == "test-session-123"

    def test_clear_nonexistent_session(self, client):
        """Test clearing nonexistent session returns 404."""
        with patch("app.api.routes.chat_service") as mock:
            mock.clear_session.return_value = False
            response = client.delete("/api/chat/nonexistent-session")
            assert response.status_code == 404


class TestAdminEndpoints:
    """Tests for the /api/admin endpoints."""

    def test_admin_refresh(self, client, mock_bigquery_service):
        """Test admin data refresh endpoint."""
        response = client.post(
            "/api/admin/refresh",
            json={}
        )
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "success"
        assert "message" in data
        assert "timestamp" in data

    def test_admin_stats(self, client, mock_bigquery_service):
        """Test admin stats endpoint."""
        response = client.get("/api/admin/stats")
        assert response.status_code == 200

        data = response.json()
        assert "data_summary" in data
        assert "cache_info" in data


class TestRootEndpoint:
    """Tests for the root endpoint."""

    def test_root_endpoint(self, client):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "status" in data
        assert "endpoints" in data
