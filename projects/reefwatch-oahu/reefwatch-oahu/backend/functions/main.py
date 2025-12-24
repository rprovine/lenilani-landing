"""
ReefWatch Oahu - Data Ingestion Cloud Functions

This module contains Cloud Functions that fetch ocean data from NOAA Coral Reef Watch
and PacIOOS ERDDAP APIs, then store it in BigQuery for the ReefWatch dashboard.

Scheduled to run daily via Cloud Scheduler.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional

import functions_framework
import requests
import pandas as pd
import numpy as np
from google.cloud import bigquery
from google.cloud import logging as cloud_logging
from retry import retry

# Configure logging
logging_client = cloud_logging.Client()
logging_client.setup_logging()
logger = logging.getLogger(__name__)

# Environment variables
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "reefwatch-oahu")
BIGQUERY_DATASET = os.environ.get("BIGQUERY_DATASET", "reefwatch")

# Oahu geographic bounds
OAHU_BOUNDS = {
    "lat_min": 21.2,
    "lat_max": 21.7,
    "lon_min": -158.3,
    "lon_max": -157.6
}

# Popular dive/snorkel sites on Oahu with coordinates
OAHU_SITES = [
    {"name": "Hanauma Bay", "lat": 21.2693, "lon": -157.6943, "type": "bay", "description": "Marine life conservation area, famous snorkeling spot"},
    {"name": "Sharks Cove", "lat": 21.6447, "lon": -158.0631, "type": "cove", "description": "Rocky tide pools, excellent snorkeling in summer"},
    {"name": "Three Tables", "lat": 21.6439, "lon": -158.0678, "type": "reef", "description": "Three flat reef formations, great for beginners"},
    {"name": "Electric Beach", "lat": 21.3558, "lon": -158.1467, "type": "beach", "description": "Warm water from power plant attracts marine life"},
    {"name": "Waikiki Beach", "lat": 21.2793, "lon": -157.8294, "type": "beach", "description": "Urban beach with accessible reef snorkeling"},
    {"name": "Makaha Beach", "lat": 21.4694, "lon": -158.2192, "type": "beach", "description": "West side beach with sea turtles"},
    {"name": "Lanikai Beach", "lat": 21.3950, "lon": -157.7181, "type": "beach", "description": "Windward side, crystal clear waters"},
    {"name": "Haleiwa", "lat": 21.5933, "lon": -158.1053, "type": "harbor", "description": "North shore harbor, boat diving access"},
    {"name": "Pupukea", "lat": 21.6592, "lon": -158.0556, "type": "reef", "description": "Marine life conservation district"},
    {"name": "Ko Olina Lagoons", "lat": 21.3394, "lon": -158.1247, "type": "lagoon", "description": "Protected lagoons, calm waters"},
    {"name": "Kahe Point", "lat": 21.3542, "lon": -158.1308, "type": "reef", "description": "Adjacent to Electric Beach, diverse coral"},
    {"name": "Sans Souci Beach", "lat": 21.2647, "lon": -157.8211, "type": "beach", "description": "Kaimana Beach, calm protected waters"},
    {"name": "Ala Moana Beach", "lat": 21.2897, "lon": -157.8489, "type": "beach", "description": "Urban reef, easy access"},
    {"name": "Kuilima Cove", "lat": 21.7069, "lon": -157.9922, "type": "cove", "description": "Turtle Bay area, sheltered cove"},
    {"name": "Waimea Bay", "lat": 21.6419, "lon": -158.0656, "type": "bay", "description": "North shore icon, summer snorkeling"}
]

# ERDDAP API endpoints
NOAA_DHW_ENDPOINT = "https://pae-paha.pacioos.hawaii.edu/erddap/griddap/dhw_5km"
PACIOOS_ENDPOINT = "https://pae-paha.pacioos.hawaii.edu/erddap"


def get_bigquery_client() -> bigquery.Client:
    """Create and return a BigQuery client with connection pooling."""
    return bigquery.Client(project=GCP_PROJECT_ID)


@retry(tries=3, delay=2, backoff=2, logger=logger)
def fetch_noaa_coral_reef_data(date: Optional[datetime] = None) -> pd.DataFrame:
    """
    Fetch coral bleaching data from NOAA Coral Reef Watch via PacIOOS ERDDAP.

    Retrieves:
    - SST (Sea Surface Temperature)
    - SST Anomaly
    - Coral Bleaching HotSpot
    - DHW (Degree Heating Weeks)

    Args:
        date: Date to fetch data for. Defaults to yesterday (most recent available).

    Returns:
        DataFrame with ocean conditions for Oahu region.
    """
    if date is None:
        # NOAA data typically has 1-day lag
        date = datetime.utcnow() - timedelta(days=1)

    date_str = date.strftime("%Y-%m-%dT12:00:00Z")

    # Build ERDDAP query for DHW dataset
    # Variables: CRW_SST, CRW_SSTANOMALY, CRW_HOTSPOT, CRW_DHW
    query_url = (
        f"{NOAA_DHW_ENDPOINT}.json?"
        f"CRW_SST[({date_str}):1:({date_str})]"
        f"[({OAHU_BOUNDS['lat_min']}):1:({OAHU_BOUNDS['lat_max']})]"
        f"[({OAHU_BOUNDS['lon_min']}):1:({OAHU_BOUNDS['lon_max']})],"
        f"CRW_SSTANOMALY[({date_str}):1:({date_str})]"
        f"[({OAHU_BOUNDS['lat_min']}):1:({OAHU_BOUNDS['lat_max']})]"
        f"[({OAHU_BOUNDS['lon_min']}):1:({OAHU_BOUNDS['lon_max']})],"
        f"CRW_HOTSPOT[({date_str}):1:({date_str})]"
        f"[({OAHU_BOUNDS['lat_min']}):1:({OAHU_BOUNDS['lat_max']})]"
        f"[({OAHU_BOUNDS['lon_min']}):1:({OAHU_BOUNDS['lon_max']})],"
        f"CRW_DHW[({date_str}):1:({date_str})]"
        f"[({OAHU_BOUNDS['lat_min']}):1:({OAHU_BOUNDS['lat_max']})]"
        f"[({OAHU_BOUNDS['lon_min']}):1:({OAHU_BOUNDS['lon_max']})]"
    )

    logger.info(f"Fetching NOAA DHW data from: {query_url[:100]}...")

    response = requests.get(query_url, timeout=60)
    response.raise_for_status()

    data = response.json()

    # Parse ERDDAP JSON response
    # The response contains table with columns: time, latitude, longitude, and variables
    if "table" not in data:
        logger.warning("No table data in NOAA response")
        return pd.DataFrame()

    table = data["table"]
    column_names = table["columnNames"]
    rows = table["rows"]

    df = pd.DataFrame(rows, columns=column_names)

    # Convert types
    df["time"] = pd.to_datetime(df["time"])
    df["latitude"] = df["latitude"].astype(float)
    df["longitude"] = df["longitude"].astype(float)

    for col in ["CRW_SST", "CRW_SSTANOMALY", "CRW_HOTSPOT", "CRW_DHW"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    logger.info(f"Fetched {len(df)} NOAA data points")
    return df


def interpolate_site_data(grid_df: pd.DataFrame, sites: list) -> pd.DataFrame:
    """
    Interpolate gridded ocean data to specific dive/snorkel site locations.

    Uses nearest-neighbor interpolation for each site based on the grid data.

    Args:
        grid_df: DataFrame with gridded NOAA data
        sites: List of site dictionaries with lat/lon coordinates

    Returns:
        DataFrame with one row per site containing interpolated values.
    """
    if grid_df.empty:
        logger.warning("Empty grid data, cannot interpolate")
        return pd.DataFrame()

    site_data = []

    for site in sites:
        site_lat = site["lat"]
        site_lon = site["lon"]

        # Find nearest grid point using Euclidean distance
        grid_df["distance"] = np.sqrt(
            (grid_df["latitude"] - site_lat) ** 2 +
            (grid_df["longitude"] - site_lon) ** 2
        )

        nearest = grid_df.loc[grid_df["distance"].idxmin()]

        site_row = {
            "site_name": site["name"],
            "latitude": site_lat,
            "longitude": site_lon,
            "site_type": site["type"],
            "description": site["description"],
            "sst": nearest.get("CRW_SST"),
            "sst_anomaly": nearest.get("CRW_SSTANOMALY"),
            "hotspot": nearest.get("CRW_HOTSPOT"),
            "dhw": nearest.get("CRW_DHW"),
            "grid_distance_deg": nearest["distance"],
            "data_source": "NOAA_CRW"
        }

        site_data.append(site_row)

    return pd.DataFrame(site_data)


@retry(tries=3, delay=2, backoff=2, logger=logger)
def fetch_pacioos_sensor_data() -> pd.DataFrame:
    """
    Fetch water quality sensor data from PacIOOS ERDDAP.

    Retrieves data from nearshore sensors around Oahu including:
    - Temperature
    - Salinity
    - Turbidity
    - Chlorophyll

    Returns:
        DataFrame with sensor readings.
    """
    # PacIOOS has multiple sensor datasets - we'll query the nearshore sensors
    # Dataset: aco_adcp_temp for temperature data
    now = datetime.utcnow()
    start_time = (now - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    end_time = now.strftime("%Y-%m-%dT%H:%M:%SZ")

    # Try multiple PacIOOS sensor datasets
    datasets = [
        {
            "id": "aco_adcp_temp",
            "name": "ALOHA Cabled Observatory",
            "vars": ["temp"],
            "lat": 22.75,
            "lon": -158.0
        },
        {
            "id": "aws_himb_met",
            "name": "HIMB Weather Station",
            "vars": ["water_temperature"],
            "lat": 21.4331,
            "lon": -157.7867
        }
    ]

    all_readings = []

    for ds in datasets:
        try:
            # Query each dataset
            vars_str = ",".join(ds["vars"])
            query_url = (
                f"{PACIOOS_ENDPOINT}/tabledap/{ds['id']}.json?"
                f"time,{vars_str}"
                f"&time>={start_time}&time<={end_time}"
                f"&orderBy(\"time\")"
            )

            logger.info(f"Fetching PacIOOS data from {ds['name']}")
            response = requests.get(query_url, timeout=30)

            if response.status_code == 200:
                data = response.json()
                if "table" in data and data["table"]["rows"]:
                    for row in data["table"]["rows"]:
                        reading = {
                            "timestamp": row[0],
                            "sensor_id": ds["id"],
                            "site_name": ds["name"],
                            "temperature": row[1] if len(row) > 1 else None,
                            "salinity": None,  # Not all sensors have all variables
                            "turbidity": None,
                            "chlorophyll": None,
                            "latitude": ds["lat"],
                            "longitude": ds["lon"]
                        }
                        all_readings.append(reading)
            else:
                logger.warning(f"Failed to fetch {ds['name']}: {response.status_code}")

        except Exception as e:
            logger.error(f"Error fetching {ds['name']}: {e}")
            continue

    if all_readings:
        df = pd.DataFrame(all_readings)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        logger.info(f"Fetched {len(df)} sensor readings")
        return df

    return pd.DataFrame()


def calculate_bleaching_risk(dhw: float, sst_anomaly: float) -> dict:
    """
    Calculate coral bleaching risk level based on DHW and SST anomaly.

    Risk levels:
    - DHW < 4: Low Risk (green)
    - DHW 4-8: Moderate Risk (yellow)
    - DHW 8-12: High Risk (orange)
    - DHW > 12: Severe Risk (red)

    Additional factors:
    - SST anomaly > +1°C adds one risk level

    Args:
        dhw: Degree Heating Weeks value
        sst_anomaly: Sea surface temperature anomaly in °C

    Returns:
        Dictionary with risk_level, risk_color, and risk_description.
    """
    if pd.isna(dhw):
        return {
            "risk_level": "Unknown",
            "risk_color": "gray",
            "risk_score": -1,
            "risk_description": "Insufficient data to assess risk"
        }

    # Base risk from DHW
    if dhw < 4:
        base_risk = 0
    elif dhw < 8:
        base_risk = 1
    elif dhw < 12:
        base_risk = 2
    else:
        base_risk = 3

    # Adjust for SST anomaly
    if not pd.isna(sst_anomaly) and sst_anomaly > 1.0:
        base_risk = min(base_risk + 1, 3)

    risk_levels = [
        {"level": "Low", "color": "green", "description": "Conditions normal. Safe for coral viewing."},
        {"level": "Moderate", "color": "yellow", "description": "Elevated temperatures. Monitor conditions."},
        {"level": "High", "color": "orange", "description": "Significant thermal stress. Bleaching possible."},
        {"level": "Severe", "color": "red", "description": "Extreme stress. Active bleaching likely."}
    ]

    risk = risk_levels[base_risk]

    return {
        "risk_level": risk["level"],
        "risk_color": risk["color"],
        "risk_score": base_risk,
        "risk_description": risk["description"]
    }


def store_ocean_conditions(df: pd.DataFrame, client: bigquery.Client) -> int:
    """
    Store ocean conditions data in BigQuery.

    Args:
        df: DataFrame with site ocean conditions
        client: BigQuery client

    Returns:
        Number of rows inserted.
    """
    if df.empty:
        logger.warning("No data to store")
        return 0

    table_id = f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.ocean_conditions_daily"

    # Add date and risk calculations
    df["date"] = datetime.utcnow().date()

    # Calculate bleaching risk for each row
    risk_data = df.apply(
        lambda row: calculate_bleaching_risk(row["dhw"], row["sst_anomaly"]),
        axis=1
    )
    df["risk_level"] = risk_data.apply(lambda x: x["risk_level"])
    df["risk_color"] = risk_data.apply(lambda x: x["risk_color"])
    df["risk_score"] = risk_data.apply(lambda x: x["risk_score"])

    # Prepare for BigQuery
    records = df.to_dict("records")

    # Configure load job
    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        schema=[
            bigquery.SchemaField("date", "DATE"),
            bigquery.SchemaField("site_name", "STRING"),
            bigquery.SchemaField("latitude", "FLOAT64"),
            bigquery.SchemaField("longitude", "FLOAT64"),
            bigquery.SchemaField("sst", "FLOAT64"),
            bigquery.SchemaField("sst_anomaly", "FLOAT64"),
            bigquery.SchemaField("hotspot", "FLOAT64"),
            bigquery.SchemaField("dhw", "FLOAT64"),
            bigquery.SchemaField("risk_level", "STRING"),
            bigquery.SchemaField("risk_color", "STRING"),
            bigquery.SchemaField("risk_score", "INT64"),
            bigquery.SchemaField("data_source", "STRING"),
        ]
    )

    # Load data
    job = client.load_table_from_json(records, table_id, job_config=job_config)
    job.result()  # Wait for completion

    logger.info(f"Stored {len(records)} ocean condition records")
    return len(records)


def store_ocean_conditions_with_date(df: pd.DataFrame, client: bigquery.Client, date) -> int:
    """
    Store ocean conditions data in BigQuery with a specific date.
    Used for backfilling historical data.

    Args:
        df: DataFrame with site ocean conditions
        client: BigQuery client
        date: The date for these records

    Returns:
        Number of rows inserted.
    """
    if df.empty:
        logger.warning("No data to store")
        return 0

    table_id = f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.ocean_conditions_daily"

    # Set date as string for JSON serialization
    df["date"] = str(date)

    # Calculate bleaching risk for each row
    risk_data = df.apply(
        lambda row: calculate_bleaching_risk(row["dhw"], row["sst_anomaly"]),
        axis=1
    )
    df["risk_level"] = risk_data.apply(lambda x: x["risk_level"])
    df["risk_color"] = risk_data.apply(lambda x: x["risk_color"])
    df["risk_score"] = risk_data.apply(lambda x: x["risk_score"])

    # Select only the fields that are in the schema
    columns_to_keep = ["date", "site_name", "latitude", "longitude", "sst",
                       "sst_anomaly", "hotspot", "dhw", "risk_level",
                       "risk_color", "risk_score", "data_source"]
    df_filtered = df[columns_to_keep].copy()

    # Replace NaN values with None for JSON serialization
    df_filtered = df_filtered.where(pd.notnull(df_filtered), None)

    # Prepare for BigQuery
    records = df_filtered.to_dict("records")

    # Convert any remaining NaN to None (for numeric columns)
    for record in records:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None

    # Configure load job
    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        schema=[
            bigquery.SchemaField("date", "DATE"),
            bigquery.SchemaField("site_name", "STRING"),
            bigquery.SchemaField("latitude", "FLOAT64"),
            bigquery.SchemaField("longitude", "FLOAT64"),
            bigquery.SchemaField("sst", "FLOAT64"),
            bigquery.SchemaField("sst_anomaly", "FLOAT64"),
            bigquery.SchemaField("hotspot", "FLOAT64"),
            bigquery.SchemaField("dhw", "FLOAT64"),
            bigquery.SchemaField("risk_level", "STRING"),
            bigquery.SchemaField("risk_color", "STRING"),
            bigquery.SchemaField("risk_score", "INT64"),
            bigquery.SchemaField("data_source", "STRING"),
        ]
    )

    # Load data
    job = client.load_table_from_json(records, table_id, job_config=job_config)
    job.result()  # Wait for completion

    logger.info(f"Stored {len(records)} ocean condition records for {date}")
    return len(records)


def store_sensor_readings(df: pd.DataFrame, client: bigquery.Client) -> int:
    """
    Store sensor readings in BigQuery.

    Args:
        df: DataFrame with sensor readings
        client: BigQuery client

    Returns:
        Number of rows inserted.
    """
    if df.empty:
        logger.warning("No sensor data to store")
        return 0

    table_id = f"{GCP_PROJECT_ID}.{BIGQUERY_DATASET}.sensor_readings"

    records = df.to_dict("records")

    job_config = bigquery.LoadJobConfig(
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        schema=[
            bigquery.SchemaField("timestamp", "TIMESTAMP"),
            bigquery.SchemaField("sensor_id", "STRING"),
            bigquery.SchemaField("site_name", "STRING"),
            bigquery.SchemaField("temperature", "FLOAT64"),
            bigquery.SchemaField("salinity", "FLOAT64"),
            bigquery.SchemaField("turbidity", "FLOAT64"),
            bigquery.SchemaField("chlorophyll", "FLOAT64"),
            bigquery.SchemaField("latitude", "FLOAT64"),
            bigquery.SchemaField("longitude", "FLOAT64"),
        ]
    )

    job = client.load_table_from_json(records, table_id, job_config=job_config)
    job.result()

    logger.info(f"Stored {len(records)} sensor readings")
    return len(records)


@functions_framework.http
def ingest_ocean_data(request):
    """
    HTTP Cloud Function to ingest ocean data from all sources.

    This function is triggered daily by Cloud Scheduler and:
    1. Fetches coral bleaching data from NOAA CRW
    2. Interpolates data to dive/snorkel site locations
    3. Fetches sensor data from PacIOOS
    4. Stores all data in BigQuery

    Args:
        request: Flask request object

    Returns:
        JSON response with ingestion summary.
    """
    logger.info("Starting ocean data ingestion")

    try:
        client = get_bigquery_client()
        summary = {
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success",
            "ocean_conditions_rows": 0,
            "sensor_readings_rows": 0,
            "errors": []
        }

        # Step 1: Fetch NOAA coral reef data
        try:
            grid_data = fetch_noaa_coral_reef_data()

            if not grid_data.empty:
                # Interpolate to site locations
                site_data = interpolate_site_data(grid_data, OAHU_SITES)

                # Store in BigQuery
                rows_stored = store_ocean_conditions(site_data, client)
                summary["ocean_conditions_rows"] = rows_stored
            else:
                summary["errors"].append("No NOAA grid data returned")

        except Exception as e:
            logger.error(f"Error fetching NOAA data: {e}")
            summary["errors"].append(f"NOAA fetch error: {str(e)}")

        # Step 2: Fetch PacIOOS sensor data
        try:
            sensor_data = fetch_pacioos_sensor_data()

            if not sensor_data.empty:
                rows_stored = store_sensor_readings(sensor_data, client)
                summary["sensor_readings_rows"] = rows_stored
            else:
                summary["errors"].append("No PacIOOS sensor data returned")

        except Exception as e:
            logger.error(f"Error fetching PacIOOS data: {e}")
            summary["errors"].append(f"PacIOOS fetch error: {str(e)}")

        # Set overall status
        if summary["errors"]:
            summary["status"] = "partial_success" if summary["ocean_conditions_rows"] > 0 else "failed"

        logger.info(f"Ingestion complete: {summary}")

        return json.dumps(summary), 200, {"Content-Type": "application/json"}

    except Exception as e:
        logger.error(f"Fatal error in ingestion: {e}")
        return json.dumps({
            "timestamp": datetime.utcnow().isoformat(),
            "status": "error",
            "message": str(e)
        }), 500, {"Content-Type": "application/json"}


@functions_framework.http
def manual_backfill(request):
    """
    HTTP Cloud Function to backfill historical data.

    Query parameters:
    - start_date: Start date (YYYY-MM-DD)
    - end_date: End date (YYYY-MM-DD)

    Example: ?start_date=2024-01-01&end_date=2024-01-07
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    if not start_date or not end_date:
        return json.dumps({"error": "start_date and end_date required"}), 400

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return json.dumps({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    client = get_bigquery_client()
    results = []

    current = start
    while current <= end:
        logger.info(f"Backfilling data for {current.date()}")

        try:
            grid_data = fetch_noaa_coral_reef_data(current)
            if not grid_data.empty:
                site_data = interpolate_site_data(grid_data, OAHU_SITES)
                # Store with proper date string format
                rows = store_ocean_conditions_with_date(site_data, client, current.date())
                results.append({"date": str(current.date()), "rows": rows})
            else:
                results.append({"date": str(current.date()), "rows": 0, "error": "No data"})
        except Exception as e:
            results.append({"date": str(current.date()), "rows": 0, "error": str(e)})

        current += timedelta(days=1)

    return json.dumps({"backfill_results": results}), 200


# Export sites data for API
def get_sites_data() -> list:
    """Return the list of Oahu dive/snorkel sites."""
    return OAHU_SITES
