"""
Core configuration for ReefWatch Oahu API.

Loads settings from environment variables with sensible defaults.
Uses Pydantic Settings for validation and type coercion.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    app_name: str = "ReefWatch Oahu API"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://reefwatch-oahu.web.app",
        "https://*.run.app"
    ]

    # Google Cloud
    gcp_project_id: str = "reefwatch-oahu"
    bigquery_dataset: str = "reefwatch"
    gcp_location: str = "us-central1"

    # API Keys (loaded from Secret Manager in production)
    anthropic_api_key: str = ""
    mapbox_api_key: str = ""

    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 10

    # Cache
    cache_ttl_seconds: int = 300  # 5 minutes
    cache_max_size: int = 1000

    # Chat
    chat_model: str = "claude-sonnet-4-20250514"
    chat_max_tokens: int = 1024
    chat_temperature: float = 0.7

    # Data
    default_history_days: int = 30
    forecast_days: int = 7


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Oahu dive/snorkel sites configuration
OAHU_SITES = [
    {
        "id": "hanauma-bay",
        "name": "Hanauma Bay",
        "lat": 21.2693,
        "lon": -157.6943,
        "type": "bay",
        "description": "Marine life conservation area, famous snorkeling spot",
        "facilities": ["restrooms", "parking", "rentals", "lifeguards"],
        "best_conditions": "Morning, calm days",
        "difficulty": "beginner"
    },
    {
        "id": "sharks-cove",
        "name": "Sharks Cove",
        "lat": 21.6447,
        "lon": -158.0631,
        "type": "cove",
        "description": "Rocky tide pools, excellent snorkeling in summer",
        "facilities": ["parking", "food_trucks"],
        "best_conditions": "Summer months, flat surf",
        "difficulty": "intermediate"
    },
    {
        "id": "three-tables",
        "name": "Three Tables",
        "lat": 21.6439,
        "lon": -158.0678,
        "type": "reef",
        "description": "Three flat reef formations, great for beginners",
        "facilities": ["parking"],
        "best_conditions": "Summer, low swell",
        "difficulty": "beginner"
    },
    {
        "id": "electric-beach",
        "name": "Electric Beach",
        "lat": 21.3558,
        "lon": -158.1467,
        "type": "beach",
        "description": "Warm water from power plant attracts marine life",
        "facilities": ["parking"],
        "best_conditions": "Year-round, calmer in summer",
        "difficulty": "intermediate"
    },
    {
        "id": "waikiki-beach",
        "name": "Waikiki Beach",
        "lat": 21.2793,
        "lon": -157.8294,
        "type": "beach",
        "description": "Urban beach with accessible reef snorkeling",
        "facilities": ["restrooms", "parking", "rentals", "lifeguards", "showers"],
        "best_conditions": "Year-round, morning best",
        "difficulty": "beginner"
    },
    {
        "id": "makaha-beach",
        "name": "Makaha Beach",
        "lat": 21.4694,
        "lon": -158.2192,
        "type": "beach",
        "description": "West side beach with sea turtles",
        "facilities": ["parking", "restrooms", "lifeguards"],
        "best_conditions": "Summer, calm surf",
        "difficulty": "intermediate"
    },
    {
        "id": "lanikai-beach",
        "name": "Lanikai Beach",
        "lat": 21.3950,
        "lon": -157.7181,
        "type": "beach",
        "description": "Windward side, crystal clear waters",
        "facilities": ["street_parking"],
        "best_conditions": "Morning, trade winds calm",
        "difficulty": "beginner"
    },
    {
        "id": "haleiwa",
        "name": "Haleiwa",
        "lat": 21.5933,
        "lon": -158.1053,
        "type": "harbor",
        "description": "North shore harbor, boat diving access",
        "facilities": ["harbor", "dive_shops", "parking"],
        "best_conditions": "Summer months",
        "difficulty": "all_levels"
    },
    {
        "id": "pupukea",
        "name": "Pupukea",
        "lat": 21.6592,
        "lon": -158.0556,
        "type": "reef",
        "description": "Marine life conservation district",
        "facilities": ["parking"],
        "best_conditions": "Summer, flat conditions",
        "difficulty": "intermediate"
    },
    {
        "id": "ko-olina-lagoons",
        "name": "Ko Olina Lagoons",
        "lat": 21.3394,
        "lon": -158.1247,
        "type": "lagoon",
        "description": "Protected lagoons, calm waters",
        "facilities": ["restrooms", "parking", "rentals", "showers"],
        "best_conditions": "Year-round",
        "difficulty": "beginner"
    },
    {
        "id": "kahe-point",
        "name": "Kahe Point",
        "lat": 21.3542,
        "lon": -158.1308,
        "type": "reef",
        "description": "Adjacent to Electric Beach, diverse coral",
        "facilities": ["parking"],
        "best_conditions": "Calm days, morning",
        "difficulty": "advanced"
    },
    {
        "id": "sans-souci",
        "name": "Sans Souci Beach",
        "lat": 21.2647,
        "lon": -157.8211,
        "type": "beach",
        "description": "Kaimana Beach, calm protected waters",
        "facilities": ["restrooms", "parking", "showers"],
        "best_conditions": "Year-round",
        "difficulty": "beginner"
    },
    {
        "id": "ala-moana",
        "name": "Ala Moana Beach",
        "lat": 21.2897,
        "lon": -157.8489,
        "type": "beach",
        "description": "Urban reef, easy access",
        "facilities": ["restrooms", "parking", "lifeguards", "showers"],
        "best_conditions": "Morning, calm days",
        "difficulty": "beginner"
    },
    {
        "id": "kuilima-cove",
        "name": "Kuilima Cove",
        "lat": 21.7069,
        "lon": -157.9922,
        "type": "cove",
        "description": "Turtle Bay area, sheltered cove",
        "facilities": ["resort_access", "parking"],
        "best_conditions": "Year-round, morning",
        "difficulty": "beginner"
    },
    {
        "id": "waimea-bay",
        "name": "Waimea Bay",
        "lat": 21.6419,
        "lon": -158.0656,
        "type": "bay",
        "description": "North shore icon, summer snorkeling",
        "facilities": ["restrooms", "parking", "lifeguards", "showers"],
        "best_conditions": "Summer only, flat conditions",
        "difficulty": "intermediate"
    }
]


def get_site_by_id(site_id: str) -> dict | None:
    """Look up a site by its ID."""
    for site in OAHU_SITES:
        if site["id"] == site_id:
            return site
    return None


def get_site_by_name(name: str) -> dict | None:
    """Look up a site by its name."""
    for site in OAHU_SITES:
        if site["name"].lower() == name.lower():
            return site
    return None
