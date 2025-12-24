"""
Pydantic models for ReefWatch Oahu API request/response validation.

These models define the structure of data exchanged between the API
and clients, ensuring type safety and automatic documentation.
"""

from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Coral bleaching risk levels."""
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    SEVERE = "Severe"
    UNKNOWN = "Unknown"


class RiskColor(str, Enum):
    """Risk level color codes for visualization."""
    GREEN = "green"
    YELLOW = "yellow"
    ORANGE = "orange"
    RED = "red"
    GRAY = "gray"


class SiteDifficulty(str, Enum):
    """Diving/snorkeling difficulty levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ALL_LEVELS = "all_levels"


class SiteType(str, Enum):
    """Types of dive/snorkel sites."""
    BAY = "bay"
    BEACH = "beach"
    COVE = "cove"
    REEF = "reef"
    LAGOON = "lagoon"
    HARBOR = "harbor"


# Response Models

class Coordinates(BaseModel):
    """Geographic coordinates."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")


class BleachingRisk(BaseModel):
    """Bleaching risk assessment."""
    level: RiskLevel = Field(..., description="Risk level category")
    color: RiskColor = Field(..., description="Color code for visualization")
    score: int = Field(..., ge=-1, le=3, description="Numeric risk score (0-3, -1 for unknown)")
    description: str = Field(..., description="Human-readable risk description")


class OceanConditions(BaseModel):
    """Current ocean conditions for a site."""
    sst: Optional[float] = Field(None, description="Sea Surface Temperature in Celsius")
    sst_anomaly: Optional[float] = Field(None, description="SST deviation from historical average")
    hotspot: Optional[float] = Field(None, description="Coral Bleaching HotSpot value")
    dhw: Optional[float] = Field(None, ge=0, description="Degree Heating Weeks")
    temperature_trend: Optional[str] = Field(None, description="Temperature trend: rising, falling, stable")


class Site(BaseModel):
    """Dive/snorkel site information."""
    id: str = Field(..., description="Unique site identifier")
    name: str = Field(..., description="Site name")
    coordinates: Coordinates
    type: SiteType = Field(..., description="Site type")
    description: str = Field(..., description="Site description")
    facilities: List[str] = Field(default_factory=list, description="Available facilities")
    best_conditions: str = Field(..., description="Best conditions for visiting")
    difficulty: SiteDifficulty = Field(..., description="Difficulty level")


class SiteWithConditions(Site):
    """Site with current ocean conditions and risk assessment."""
    conditions: Optional[OceanConditions] = Field(None, description="Current ocean conditions")
    risk: BleachingRisk = Field(..., description="Current bleaching risk")
    last_updated: Optional[datetime] = Field(None, description="Last data update time")


class SiteListResponse(BaseModel):
    """Response containing list of sites."""
    sites: List[Site]
    count: int = Field(..., description="Total number of sites")


class CurrentConditionsResponse(BaseModel):
    """Response for current conditions endpoint."""
    sites: List[SiteWithConditions]
    data_date: date = Field(..., description="Date of the ocean data")
    updated_at: datetime = Field(..., description="When data was last fetched")


class HistoricalDataPoint(BaseModel):
    """Single historical data point."""
    date: date
    sst: Optional[float] = None
    sst_anomaly: Optional[float] = None
    dhw: Optional[float] = None
    risk_level: Optional[RiskLevel] = None


class SiteHistoryResponse(BaseModel):
    """Historical data for a specific site."""
    site_id: str
    site_name: str
    data: List[HistoricalDataPoint]
    period_start: date
    period_end: date
    statistics: dict = Field(default_factory=dict, description="Summary statistics")


class ForecastDataPoint(BaseModel):
    """Single forecast data point."""
    date: date
    predicted_sst: float
    predicted_dhw: float
    predicted_risk: RiskLevel
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")


class SiteForecastResponse(BaseModel):
    """7-day forecast for a site."""
    site_id: str
    site_name: str
    forecast: List[ForecastDataPoint]
    generated_at: datetime
    model_version: str = "v1.0"


class ForecastResponse(BaseModel):
    """Forecast for all sites."""
    forecasts: List[SiteForecastResponse]
    generated_at: datetime


class AlertSeverity(str, Enum):
    """Alert severity levels."""
    WATCH = "watch"
    WARNING = "warning"
    ALERT = "alert"


class AlertType(str, Enum):
    """Types of alerts."""
    BLEACHING = "bleaching"
    WEATHER = "weather"
    WATER_QUALITY = "water_quality"


class Alert(BaseModel):
    """Active alert."""
    id: str = Field(..., description="Unique alert identifier")
    type: AlertType = Field(..., description="Alert type")
    severity: AlertSeverity = Field(..., description="Alert severity")
    title: str = Field(..., description="Alert title")
    description: str = Field(..., description="Detailed description")
    affected_sites: List[str] = Field(default_factory=list, description="Affected site IDs")
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool = True


class AlertsResponse(BaseModel):
    """Response containing active alerts."""
    alerts: List[Alert]
    count: int


# Chat Models

class ChatMessage(BaseModel):
    """Single chat message."""
    role: str = Field(..., pattern="^(user|assistant)$", description="Message role")
    content: str = Field(..., min_length=1, max_length=4000, description="Message content")


class ChatRequest(BaseModel):
    """Request to send a chat message."""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    include_context: bool = Field(True, description="Include current ocean data in context")


class ChatResponse(BaseModel):
    """Chat response from the AI assistant."""
    response: str = Field(..., description="Assistant's response")
    session_id: str = Field(..., description="Session ID for follow-up messages")
    context_used: bool = Field(..., description="Whether ocean data context was included")
    model: str = Field(..., description="AI model used")


class ChatStreamChunk(BaseModel):
    """Streaming chat response chunk."""
    content: str
    is_final: bool = False
    session_id: Optional[str] = None


# Admin Models

class DataRefreshRequest(BaseModel):
    """Request to manually refresh data."""
    source: Optional[str] = Field(default=None, description="Specific source to refresh: noaa, pacioos, or all")
    refresh_date: Optional[date] = Field(default=None, description="Specific date to refresh")


class DataRefreshResponse(BaseModel):
    """Response from data refresh operation."""
    status: str
    message: str
    records_updated: int
    timestamp: datetime


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Service status: healthy, degraded, unhealthy")
    version: str
    timestamp: datetime
    checks: dict = Field(default_factory=dict, description="Individual component health checks")


# Statistics Models

class SiteStatistics(BaseModel):
    """Statistics for a site."""
    site_id: str
    site_name: str
    avg_sst: Optional[float] = None
    max_sst: Optional[float] = None
    min_sst: Optional[float] = None
    avg_dhw: Optional[float] = None
    max_dhw: Optional[float] = None
    days_at_risk: int = 0
    data_coverage: float = Field(..., ge=0, le=1, description="Data availability percentage")


class OverallStatistics(BaseModel):
    """Overall statistics across all sites."""
    total_sites: int
    sites_at_risk: int
    average_sst: Optional[float]
    average_dhw: Optional[float]
    highest_risk_site: Optional[str]
    data_freshness: datetime
