"""
Tests for configuration and site utilities.
"""

import pytest

from app.core.config import (
    get_settings,
    OAHU_SITES,
    get_site_by_id,
    get_site_by_name,
    Settings,
)


class TestSettings:
    """Tests for application settings."""

    def test_get_settings_returns_settings(self):
        """Test that get_settings returns a Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_settings_has_default_values(self):
        """Test that settings have sensible defaults."""
        settings = get_settings()

        assert settings.app_name == "ReefWatch Oahu API"
        assert settings.app_version == "1.0.0"
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000

    def test_settings_cors_origins_configured(self):
        """Test that CORS origins are configured."""
        settings = get_settings()

        assert isinstance(settings.cors_origins, list)
        assert len(settings.cors_origins) > 0
        assert "http://localhost:3000" in settings.cors_origins

    def test_settings_cache_configured(self):
        """Test that cache settings are configured."""
        settings = get_settings()

        assert settings.cache_ttl_seconds > 0
        assert settings.cache_max_size > 0

    def test_settings_chat_model_configured(self):
        """Test that chat model is configured."""
        settings = get_settings()

        assert settings.chat_model is not None
        assert settings.chat_max_tokens > 0
        assert 0 <= settings.chat_temperature <= 1


class TestOahuSites:
    """Tests for Oahu sites configuration."""

    def test_sites_list_not_empty(self):
        """Test that sites list is not empty."""
        assert len(OAHU_SITES) > 0

    def test_sites_have_required_fields(self):
        """Test that all sites have required fields."""
        required_fields = ["id", "name", "lat", "lon", "type", "description"]

        for site in OAHU_SITES:
            for field in required_fields:
                assert field in site, f"Site {site.get('id', 'unknown')} missing field: {field}"

    def test_sites_have_valid_coordinates(self):
        """Test that all sites have valid coordinates for Hawaii."""
        for site in OAHU_SITES:
            # Oahu is roughly between these coordinates
            assert 21.0 <= site["lat"] <= 22.0, f"Invalid latitude for {site['name']}"
            assert -159.0 <= site["lon"] <= -157.0, f"Invalid longitude for {site['name']}"

    def test_sites_have_unique_ids(self):
        """Test that all sites have unique IDs."""
        ids = [site["id"] for site in OAHU_SITES]
        assert len(ids) == len(set(ids)), "Duplicate site IDs found"

    def test_sites_have_valid_types(self):
        """Test that all sites have valid types."""
        valid_types = {"bay", "beach", "cove", "reef", "lagoon", "harbor"}

        for site in OAHU_SITES:
            assert site["type"] in valid_types, f"Invalid type for {site['name']}: {site['type']}"

    def test_expected_sites_exist(self):
        """Test that key sites exist in the configuration."""
        expected_sites = ["hanauma-bay", "sharks-cove", "waikiki-beach", "electric-beach"]
        site_ids = [site["id"] for site in OAHU_SITES]

        for expected in expected_sites:
            assert expected in site_ids, f"Expected site {expected} not found"


class TestGetSiteById:
    """Tests for get_site_by_id function."""

    def test_get_existing_site(self):
        """Test getting an existing site by ID."""
        site = get_site_by_id("hanauma-bay")

        assert site is not None
        assert site["id"] == "hanauma-bay"
        assert site["name"] == "Hanauma Bay"

    def test_get_nonexistent_site(self):
        """Test getting a nonexistent site returns None."""
        site = get_site_by_id("nonexistent-site")
        assert site is None

    def test_get_site_returns_dict(self):
        """Test that get_site_by_id returns a dict."""
        site = get_site_by_id("sharks-cove")

        assert isinstance(site, dict)
        assert "id" in site
        assert "name" in site

    def test_get_site_case_sensitive(self):
        """Test that site ID lookup is case-sensitive."""
        site = get_site_by_id("HANAUMA-BAY")
        assert site is None

        site = get_site_by_id("hanauma-bay")
        assert site is not None


class TestGetSiteByName:
    """Tests for get_site_by_name function."""

    def test_get_existing_site_by_name(self):
        """Test getting an existing site by name."""
        site = get_site_by_name("Hanauma Bay")

        assert site is not None
        assert site["name"] == "Hanauma Bay"

    def test_get_site_case_insensitive(self):
        """Test that site name lookup is case-insensitive."""
        site1 = get_site_by_name("Hanauma Bay")
        site2 = get_site_by_name("hanauma bay")
        site3 = get_site_by_name("HANAUMA BAY")

        assert site1 is not None
        assert site2 is not None
        assert site3 is not None
        assert site1["id"] == site2["id"] == site3["id"]

    def test_get_nonexistent_site_by_name(self):
        """Test getting a nonexistent site by name returns None."""
        site = get_site_by_name("Nonexistent Beach")
        assert site is None
