"""
BigQuery service for ReefWatch Oahu.

Handles all database operations including querying ocean conditions,
historical data, and alerts. Uses connection pooling and caching
for optimal performance.
"""

import logging
from datetime import date, datetime, timedelta
from typing import List, Optional

from cachetools import TTLCache
from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPIError

from app.core.config import get_settings, OAHU_SITES
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

logger = logging.getLogger(__name__)
settings = get_settings()

# Cache for frequently accessed data
_cache = TTLCache(maxsize=settings.cache_max_size, ttl=settings.cache_ttl_seconds)

# BigQuery client singleton
_bq_client: Optional[bigquery.Client] = None


def get_bq_client() -> bigquery.Client:
    """Get or create BigQuery client with connection pooling."""
    global _bq_client
    if _bq_client is None:
        _bq_client = bigquery.Client(project=settings.gcp_project_id)
    return _bq_client


def _build_risk(row: dict) -> BleachingRisk:
    """Build BleachingRisk from database row."""
    risk_level = row.get("risk_level", "Unknown")
    risk_color = row.get("risk_color", "gray")
    risk_score = row.get("risk_score", -1)

    # Map to enum values
    try:
        level = RiskLevel(risk_level)
    except ValueError:
        level = RiskLevel.UNKNOWN

    try:
        color = RiskColor(risk_color)
    except ValueError:
        color = RiskColor.GRAY

    # Generate description based on risk level
    descriptions = {
        RiskLevel.LOW: "Conditions are normal. Safe for coral viewing and snorkeling.",
        RiskLevel.MODERATE: "Slightly elevated temperatures. Monitor conditions and avoid disturbing coral.",
        RiskLevel.HIGH: "Significant thermal stress detected. Coral bleaching may be occurring.",
        RiskLevel.SEVERE: "Extreme stress conditions. Active coral bleaching likely in progress.",
        RiskLevel.UNKNOWN: "Insufficient data to assess current risk level.",
    }

    return BleachingRisk(
        level=level,
        color=color,
        score=risk_score if risk_score is not None else -1,
        description=descriptions.get(level, descriptions[RiskLevel.UNKNOWN])
    )


async def get_current_conditions() -> List[SiteWithConditions]:
    """
    Get current ocean conditions for all sites.

    Returns the most recent data available for each site,
    enriched with site metadata and risk calculations.
    """
    cache_key = "current_conditions"
    if cache_key in _cache:
        return _cache[cache_key]

    client = get_bq_client()

    # Query for latest data per site
    query = f"""
    SELECT
        site_name,
        latitude,
        longitude,
        date,
        sst,
        sst_anomaly,
        hotspot,
        dhw,
        risk_level,
        risk_color,
        risk_score,
        data_source
    FROM (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY site_name ORDER BY date DESC) as rn
        FROM `{settings.gcp_project_id}.{settings.bigquery_dataset}.ocean_conditions_daily`
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    )
    WHERE rn = 1
    ORDER BY site_name
    """

    try:
        query_job = client.query(query)
        results = query_job.result()

        # Build lookup from DB results
        db_data = {row["site_name"]: dict(row) for row in results}

        sites_with_conditions = []

        # Merge with site metadata
        for site in OAHU_SITES:
            site_name = site["name"]
            db_row = db_data.get(site_name, {})

            conditions = None
            if db_row:
                # Determine temperature trend
                trend = await _get_temperature_trend(site_name)

                conditions = OceanConditions(
                    sst=db_row.get("sst"),
                    sst_anomaly=db_row.get("sst_anomaly"),
                    hotspot=db_row.get("hotspot"),
                    dhw=db_row.get("dhw"),
                    temperature_trend=trend
                )

            # Build risk assessment
            if db_row:
                risk = _build_risk(db_row)
            else:
                risk = BleachingRisk(
                    level=RiskLevel.UNKNOWN,
                    color=RiskColor.GRAY,
                    score=-1,
                    description="No recent data available for this site."
                )

            site_with_conditions = SiteWithConditions(
                id=site["id"],
                name=site["name"],
                coordinates=Coordinates(latitude=site["lat"], longitude=site["lon"]),
                type=site["type"],
                description=site["description"],
                facilities=site.get("facilities", []),
                best_conditions=site.get("best_conditions", ""),
                difficulty=site.get("difficulty", "all_levels"),
                conditions=conditions,
                risk=risk,
                last_updated=datetime.combine(
                    db_row.get("date", date.today()),
                    datetime.min.time()
                ) if db_row else None
            )

            sites_with_conditions.append(site_with_conditions)

        _cache[cache_key] = sites_with_conditions
        return sites_with_conditions

    except GoogleAPIError as e:
        logger.error(f"BigQuery error fetching current conditions: {e}")
        # Return sites without conditions data on error
        return [
            SiteWithConditions(
                id=site["id"],
                name=site["name"],
                coordinates=Coordinates(latitude=site["lat"], longitude=site["lon"]),
                type=site["type"],
                description=site["description"],
                facilities=site.get("facilities", []),
                best_conditions=site.get("best_conditions", ""),
                difficulty=site.get("difficulty", "all_levels"),
                conditions=None,
                risk=BleachingRisk(
                    level=RiskLevel.UNKNOWN,
                    color=RiskColor.GRAY,
                    score=-1,
                    description="Data temporarily unavailable."
                ),
                last_updated=None
            )
            for site in OAHU_SITES
        ]


async def _get_temperature_trend(site_name: str) -> str:
    """
    Calculate temperature trend for a site over the last 7 days.

    Returns: "rising", "falling", or "stable"
    """
    client = get_bq_client()

    query = f"""
    SELECT
        AVG(CASE WHEN date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) THEN sst END) as recent_avg,
        AVG(CASE WHEN date < DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) THEN sst END) as earlier_avg
    FROM `{settings.gcp_project_id}.{settings.bigquery_dataset}.ocean_conditions_daily`
    WHERE site_name = @site_name
    AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("site_name", "STRING", site_name)
        ]
    )

    try:
        query_job = client.query(query, job_config=job_config)
        results = list(query_job.result())

        if results:
            row = results[0]
            recent = row.get("recent_avg")
            earlier = row.get("earlier_avg")

            if recent is not None and earlier is not None:
                diff = recent - earlier
                if diff > 0.3:
                    return "rising"
                elif diff < -0.3:
                    return "falling"

        return "stable"

    except GoogleAPIError:
        return "stable"


async def get_site_history(
    site_id: str,
    days: int = 30
) -> List[HistoricalDataPoint]:
    """
    Get historical data for a specific site.

    Args:
        site_id: Site identifier
        days: Number of days of history to retrieve

    Returns:
        List of historical data points ordered by date.
    """
    cache_key = f"history_{site_id}_{days}"
    if cache_key in _cache:
        return _cache[cache_key]

    # Look up site name from ID
    site = next((s for s in OAHU_SITES if s["id"] == site_id), None)
    if not site:
        return []

    site_name = site["name"]
    client = get_bq_client()

    query = f"""
    SELECT
        date,
        sst,
        sst_anomaly,
        dhw,
        risk_level
    FROM `{settings.gcp_project_id}.{settings.bigquery_dataset}.ocean_conditions_daily`
    WHERE site_name = @site_name
    AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
    ORDER BY date ASC
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("site_name", "STRING", site_name),
            bigquery.ScalarQueryParameter("days", "INT64", days)
        ]
    )

    try:
        query_job = client.query(query, job_config=job_config)
        results = query_job.result()

        history = []
        for row in results:
            try:
                risk = RiskLevel(row.get("risk_level", "Unknown"))
            except ValueError:
                risk = RiskLevel.UNKNOWN

            history.append(HistoricalDataPoint(
                date=row["date"],
                sst=row.get("sst"),
                sst_anomaly=row.get("sst_anomaly"),
                dhw=row.get("dhw"),
                risk_level=risk
            ))

        _cache[cache_key] = history
        return history

    except GoogleAPIError as e:
        logger.error(f"BigQuery error fetching history: {e}")
        return []


async def get_site_statistics(site_id: str, days: int = 30) -> dict:
    """Get statistics for a site over a time period."""
    site = next((s for s in OAHU_SITES if s["id"] == site_id), None)
    if not site:
        return {}

    site_name = site["name"]
    client = get_bq_client()

    query = f"""
    SELECT
        AVG(sst) as avg_sst,
        MAX(sst) as max_sst,
        MIN(sst) as min_sst,
        AVG(dhw) as avg_dhw,
        MAX(dhw) as max_dhw,
        COUNTIF(risk_score >= 2) as days_at_risk,
        COUNT(*) as total_days
    FROM `{settings.gcp_project_id}.{settings.bigquery_dataset}.ocean_conditions_daily`
    WHERE site_name = @site_name
    AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("site_name", "STRING", site_name),
            bigquery.ScalarQueryParameter("days", "INT64", days)
        ]
    )

    try:
        query_job = client.query(query, job_config=job_config)
        results = list(query_job.result())

        if results:
            row = results[0]
            total_days = row.get("total_days", 0) or 0
            return {
                "avg_sst": round(row.get("avg_sst") or 0, 2),
                "max_sst": round(row.get("max_sst") or 0, 2),
                "min_sst": round(row.get("min_sst") or 0, 2),
                "avg_dhw": round(row.get("avg_dhw") or 0, 2),
                "max_dhw": round(row.get("max_dhw") or 0, 2),
                "days_at_risk": row.get("days_at_risk") or 0,
                "data_coverage": min(total_days / days, 1.0) if days > 0 else 0
            }

        return {}

    except GoogleAPIError as e:
        logger.error(f"BigQuery error fetching statistics: {e}")
        return {}


async def get_active_alerts() -> List[Alert]:
    """
    Get all active alerts.

    Returns both stored alerts from the database and dynamically
    generated alerts based on current conditions.
    """
    cache_key = "active_alerts"
    if cache_key in _cache:
        return _cache[cache_key]

    alerts = []
    client = get_bq_client()

    # Check for stored alerts
    try:
        query = f"""
        SELECT *
        FROM `{settings.gcp_project_id}.{settings.bigquery_dataset}.alerts`
        WHERE is_active = TRUE
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP())
        ORDER BY created_at DESC
        """

        query_job = client.query(query)
        for row in query_job.result():
            alerts.append(Alert(
                id=row["alert_id"],
                type=AlertType(row["alert_type"]),
                severity=AlertSeverity(row["severity"]),
                title=row["title"],
                description=row["description"],
                affected_sites=list(row.get("affected_sites", [])),
                created_at=row["created_at"],
                expires_at=row.get("expires_at"),
                is_active=row["is_active"]
            ))

    except GoogleAPIError as e:
        logger.warning(f"Could not fetch stored alerts: {e}")

    # Generate dynamic alerts based on current conditions
    conditions = await get_current_conditions()

    high_risk_sites = [s for s in conditions if s.risk.score >= 2]
    severe_risk_sites = [s for s in conditions if s.risk.score >= 3]

    if severe_risk_sites:
        alerts.append(Alert(
            id="dynamic-severe-bleaching",
            type=AlertType.BLEACHING,
            severity=AlertSeverity.ALERT,
            title="Severe Coral Bleaching Alert",
            description=f"Severe bleaching conditions detected at {len(severe_risk_sites)} site(s). "
                       "DHW values exceed 12°C-weeks. Avoid contact with coral.",
            affected_sites=[s.id for s in severe_risk_sites],
            created_at=datetime.utcnow(),
            is_active=True
        ))
    elif high_risk_sites:
        alerts.append(Alert(
            id="dynamic-high-bleaching",
            type=AlertType.BLEACHING,
            severity=AlertSeverity.WARNING,
            title="Coral Bleaching Warning",
            description=f"Elevated bleaching risk at {len(high_risk_sites)} site(s). "
                       "Water temperatures are above normal. Please be gentle with reef ecosystems.",
            affected_sites=[s.id for s in high_risk_sites],
            created_at=datetime.utcnow(),
            is_active=True
        ))

    _cache[cache_key] = alerts
    return alerts


async def get_data_summary() -> dict:
    """Get summary of available data for context injection."""
    conditions = await get_current_conditions()

    # Calculate summary statistics
    sst_values = [s.conditions.sst for s in conditions if s.conditions and s.conditions.sst]
    dhw_values = [s.conditions.dhw for s in conditions if s.conditions and s.conditions.dhw]

    summary = {
        "date": date.today().isoformat(),
        "total_sites": len(conditions),
        "sites_with_data": len([s for s in conditions if s.conditions]),
        "average_sst": round(sum(sst_values) / len(sst_values), 1) if sst_values else None,
        "max_sst": round(max(sst_values), 1) if sst_values else None,
        "average_dhw": round(sum(dhw_values) / len(dhw_values), 1) if dhw_values else None,
        "max_dhw": round(max(dhw_values), 1) if dhw_values else None,
        "risk_distribution": {
            "low": len([s for s in conditions if s.risk.level == RiskLevel.LOW]),
            "moderate": len([s for s in conditions if s.risk.level == RiskLevel.MODERATE]),
            "high": len([s for s in conditions if s.risk.level == RiskLevel.HIGH]),
            "severe": len([s for s in conditions if s.risk.level == RiskLevel.SEVERE]),
        },
        "sites": [
            {
                "name": s.name,
                "sst": s.conditions.sst if s.conditions else None,
                "dhw": s.conditions.dhw if s.conditions else None,
                "risk": s.risk.level.value
            }
            for s in conditions
        ]
    }

    return summary


def clear_cache() -> None:
    """Clear all cached data."""
    _cache.clear()
    logger.info("BigQuery cache cleared")
