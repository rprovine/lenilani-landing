"""
BigQuery Schema Initialization Script for ReefWatch Oahu

This script creates the necessary BigQuery dataset and tables for the
ReefWatch application. Run once during initial setup.

Usage:
    python init_bigquery.py --project-id YOUR_PROJECT_ID --dataset reefwatch
"""

import argparse
import os
from google.cloud import bigquery
from google.api_core.exceptions import Conflict


def create_dataset(client: bigquery.Client, dataset_id: str, location: str = "US") -> None:
    """Create BigQuery dataset if it doesn't exist."""
    dataset_ref = bigquery.Dataset(f"{client.project}.{dataset_id}")
    dataset_ref.location = location
    dataset_ref.description = "ReefWatch Oahu coral reef monitoring data"

    try:
        dataset = client.create_dataset(dataset_ref)
        print(f"Created dataset {dataset.full_dataset_id}")
    except Conflict:
        print(f"Dataset {dataset_id} already exists")


def create_ocean_conditions_table(client: bigquery.Client, dataset_id: str) -> None:
    """
    Create the ocean_conditions_daily table.

    This table stores daily ocean conditions data for each dive/snorkel site,
    including SST, anomaly, hotspot values, DHW, and calculated risk levels.
    Partitioned by date for efficient querying.
    """
    table_id = f"{client.project}.{dataset_id}.ocean_conditions_daily"

    schema = [
        bigquery.SchemaField("date", "DATE", mode="REQUIRED",
                            description="Date of observation"),
        bigquery.SchemaField("site_name", "STRING", mode="REQUIRED",
                            description="Name of dive/snorkel site"),
        bigquery.SchemaField("latitude", "FLOAT64", mode="REQUIRED",
                            description="Site latitude"),
        bigquery.SchemaField("longitude", "FLOAT64", mode="REQUIRED",
                            description="Site longitude"),
        bigquery.SchemaField("sst", "FLOAT64",
                            description="Sea Surface Temperature in Celsius"),
        bigquery.SchemaField("sst_anomaly", "FLOAT64",
                            description="SST anomaly from historical average"),
        bigquery.SchemaField("hotspot", "FLOAT64",
                            description="Coral Bleaching HotSpot value"),
        bigquery.SchemaField("dhw", "FLOAT64",
                            description="Degree Heating Weeks"),
        bigquery.SchemaField("risk_level", "STRING",
                            description="Calculated bleaching risk level"),
        bigquery.SchemaField("risk_color", "STRING",
                            description="Risk color code (green/yellow/orange/red)"),
        bigquery.SchemaField("risk_score", "INT64",
                            description="Numeric risk score (0-3)"),
        bigquery.SchemaField("data_source", "STRING",
                            description="Data source identifier"),
        bigquery.SchemaField("ingestion_timestamp", "TIMESTAMP",
                            description="When data was ingested",
                            default_value_expression="CURRENT_TIMESTAMP()"),
    ]

    table = bigquery.Table(table_id, schema=schema)

    # Partition by date for efficient time-based queries
    table.time_partitioning = bigquery.TimePartitioning(
        type_=bigquery.TimePartitioningType.DAY,
        field="date"
    )

    # Cluster by site for efficient site-based queries
    table.clustering_fields = ["site_name"]

    table.description = "Daily ocean conditions and bleaching risk for Oahu dive sites"

    try:
        table = client.create_table(table)
        print(f"Created table {table.full_table_id}")
    except Conflict:
        print(f"Table ocean_conditions_daily already exists")


def create_sensor_readings_table(client: bigquery.Client, dataset_id: str) -> None:
    """
    Create the sensor_readings table.

    This table stores real-time sensor data from PacIOOS and other sources.
    Partitioned by timestamp hour for efficient streaming and querying.
    """
    table_id = f"{client.project}.{dataset_id}.sensor_readings"

    schema = [
        bigquery.SchemaField("timestamp", "TIMESTAMP", mode="REQUIRED",
                            description="Observation timestamp"),
        bigquery.SchemaField("sensor_id", "STRING", mode="REQUIRED",
                            description="Unique sensor identifier"),
        bigquery.SchemaField("site_name", "STRING",
                            description="Associated site name"),
        bigquery.SchemaField("latitude", "FLOAT64",
                            description="Sensor latitude"),
        bigquery.SchemaField("longitude", "FLOAT64",
                            description="Sensor longitude"),
        bigquery.SchemaField("temperature", "FLOAT64",
                            description="Water temperature in Celsius"),
        bigquery.SchemaField("salinity", "FLOAT64",
                            description="Salinity in PSU"),
        bigquery.SchemaField("turbidity", "FLOAT64",
                            description="Turbidity in NTU"),
        bigquery.SchemaField("chlorophyll", "FLOAT64",
                            description="Chlorophyll concentration"),
        bigquery.SchemaField("depth", "FLOAT64",
                            description="Sensor depth in meters"),
        bigquery.SchemaField("ingestion_timestamp", "TIMESTAMP",
                            description="When data was ingested",
                            default_value_expression="CURRENT_TIMESTAMP()"),
    ]

    table = bigquery.Table(table_id, schema=schema)

    # Partition by timestamp (hourly)
    table.time_partitioning = bigquery.TimePartitioning(
        type_=bigquery.TimePartitioningType.HOUR,
        field="timestamp"
    )

    # Cluster by sensor and site
    table.clustering_fields = ["sensor_id", "site_name"]

    table.description = "Real-time sensor readings from ocean monitoring stations"

    try:
        table = client.create_table(table)
        print(f"Created table {table.full_table_id}")
    except Conflict:
        print(f"Table sensor_readings already exists")


def create_alerts_table(client: bigquery.Client, dataset_id: str) -> None:
    """
    Create the alerts table for tracking active coral bleaching alerts.
    """
    table_id = f"{client.project}.{dataset_id}.alerts"

    schema = [
        bigquery.SchemaField("alert_id", "STRING", mode="REQUIRED",
                            description="Unique alert identifier"),
        bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED",
                            description="When alert was created"),
        bigquery.SchemaField("updated_at", "TIMESTAMP",
                            description="Last update timestamp"),
        bigquery.SchemaField("alert_type", "STRING", mode="REQUIRED",
                            description="Type: bleaching_watch, bleaching_warning, bleaching_alert"),
        bigquery.SchemaField("severity", "STRING",
                            description="Severity level"),
        bigquery.SchemaField("site_name", "STRING",
                            description="Affected site (null for island-wide)"),
        bigquery.SchemaField("title", "STRING",
                            description="Alert title"),
        bigquery.SchemaField("description", "STRING",
                            description="Detailed alert description"),
        bigquery.SchemaField("is_active", "BOOL", mode="REQUIRED",
                            description="Whether alert is currently active"),
        bigquery.SchemaField("expires_at", "TIMESTAMP",
                            description="When alert expires"),
        bigquery.SchemaField("dhw_threshold", "FLOAT64",
                            description="DHW value that triggered alert"),
        bigquery.SchemaField("affected_sites", "STRING", mode="REPEATED",
                            description="List of affected site names"),
    ]

    table = bigquery.Table(table_id, schema=schema)
    table.description = "Active and historical coral bleaching alerts"

    try:
        table = client.create_table(table)
        print(f"Created table {table.full_table_id}")
    except Conflict:
        print(f"Table alerts already exists")


def create_chat_sessions_table(client: bigquery.Client, dataset_id: str) -> None:
    """
    Create table for storing chat session history (optional, for analytics).
    """
    table_id = f"{client.project}.{dataset_id}.chat_sessions"

    schema = [
        bigquery.SchemaField("session_id", "STRING", mode="REQUIRED",
                            description="Unique session identifier"),
        bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED",
                            description="Session start time"),
        bigquery.SchemaField("last_activity", "TIMESTAMP",
                            description="Last message timestamp"),
        bigquery.SchemaField("message_count", "INT64",
                            description="Number of messages in session"),
        bigquery.SchemaField("topics_discussed", "STRING", mode="REPEATED",
                            description="Topics detected in conversation"),
    ]

    table = bigquery.Table(table_id, schema=schema)

    table.time_partitioning = bigquery.TimePartitioning(
        type_=bigquery.TimePartitioningType.DAY,
        field="created_at"
    )

    table.description = "Chat session metadata for analytics"

    try:
        table = client.create_table(table)
        print(f"Created table {table.full_table_id}")
    except Conflict:
        print(f"Table chat_sessions already exists")


def create_views(client: bigquery.Client, dataset_id: str) -> None:
    """Create useful views for the API."""

    # View: Latest conditions per site
    latest_conditions_view = f"""
    CREATE OR REPLACE VIEW `{client.project}.{dataset_id}.latest_conditions` AS
    SELECT *
    FROM (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY site_name ORDER BY date DESC) as rn
        FROM `{client.project}.{dataset_id}.ocean_conditions_daily`
    )
    WHERE rn = 1
    """

    # View: 7-day rolling average
    rolling_avg_view = f"""
    CREATE OR REPLACE VIEW `{client.project}.{dataset_id}.rolling_averages` AS
    SELECT
        site_name,
        date,
        sst,
        AVG(sst) OVER (
            PARTITION BY site_name
            ORDER BY date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as sst_7day_avg,
        AVG(dhw) OVER (
            PARTITION BY site_name
            ORDER BY date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as dhw_7day_avg
    FROM `{client.project}.{dataset_id}.ocean_conditions_daily`
    """

    # View: Sites with high risk
    high_risk_view = f"""
    CREATE OR REPLACE VIEW `{client.project}.{dataset_id}.high_risk_sites` AS
    SELECT
        site_name,
        latitude,
        longitude,
        date,
        sst,
        dhw,
        risk_level,
        risk_color
    FROM `{client.project}.{dataset_id}.ocean_conditions_daily`
    WHERE risk_score >= 2
    AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
    ORDER BY date DESC, risk_score DESC
    """

    views = [
        ("latest_conditions", latest_conditions_view),
        ("rolling_averages", rolling_avg_view),
        ("high_risk_sites", high_risk_view),
    ]

    for view_name, view_sql in views:
        try:
            job = client.query(view_sql)
            job.result()
            print(f"Created view {view_name}")
        except Exception as e:
            print(f"Error creating view {view_name}: {e}")


def insert_sample_data(client: bigquery.Client, dataset_id: str) -> None:
    """Insert sample data for development/testing."""

    # Sample ocean conditions for the last 30 days
    sample_data_sql = f"""
    INSERT INTO `{client.project}.{dataset_id}.ocean_conditions_daily`
    (date, site_name, latitude, longitude, sst, sst_anomaly, hotspot, dhw, risk_level, risk_color, risk_score, data_source)
    VALUES
    -- Hanauma Bay - 7 days of sample data
    (DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), 'Hanauma Bay', 21.2693, -157.6943, 26.5, 0.3, 0.0, 2.1, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 'Hanauma Bay', 21.2693, -157.6943, 26.7, 0.5, 0.0, 2.3, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 'Hanauma Bay', 21.2693, -157.6943, 26.8, 0.6, 0.1, 2.5, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'Hanauma Bay', 21.2693, -157.6943, 27.0, 0.8, 0.2, 2.8, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'Hanauma Bay', 21.2693, -157.6943, 27.2, 1.0, 0.3, 3.2, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'Hanauma Bay', 21.2693, -157.6943, 27.1, 0.9, 0.2, 3.5, 'Low', 'green', 0, 'SAMPLE'),
    (CURRENT_DATE(), 'Hanauma Bay', 21.2693, -157.6943, 27.0, 0.8, 0.1, 3.8, 'Low', 'green', 0, 'SAMPLE'),

    -- Sharks Cove
    (DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), 'Sharks Cove', 21.6447, -158.0631, 25.8, 0.2, 0.0, 1.5, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 'Sharks Cove', 21.6447, -158.0631, 25.9, 0.3, 0.0, 1.6, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 'Sharks Cove', 21.6447, -158.0631, 26.0, 0.4, 0.0, 1.8, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'Sharks Cove', 21.6447, -158.0631, 26.1, 0.5, 0.0, 2.0, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'Sharks Cove', 21.6447, -158.0631, 26.3, 0.7, 0.1, 2.2, 'Low', 'green', 0, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'Sharks Cove', 21.6447, -158.0631, 26.2, 0.6, 0.0, 2.4, 'Low', 'green', 0, 'SAMPLE'),
    (CURRENT_DATE(), 'Sharks Cove', 21.6447, -158.0631, 26.0, 0.4, 0.0, 2.5, 'Low', 'green', 0, 'SAMPLE'),

    -- Electric Beach (slightly elevated)
    (DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), 'Electric Beach', 21.3558, -158.1467, 27.5, 1.2, 0.5, 4.2, 'Moderate', 'yellow', 1, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 'Electric Beach', 21.3558, -158.1467, 27.8, 1.5, 0.8, 4.5, 'Moderate', 'yellow', 1, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 'Electric Beach', 21.3558, -158.1467, 28.0, 1.7, 1.0, 4.8, 'Moderate', 'yellow', 1, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'Electric Beach', 21.3558, -158.1467, 28.2, 1.9, 1.2, 5.2, 'Moderate', 'yellow', 1, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'Electric Beach', 21.3558, -158.1467, 28.0, 1.7, 1.0, 5.5, 'Moderate', 'yellow', 1, 'SAMPLE'),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'Electric Beach', 21.3558, -158.1467, 27.8, 1.5, 0.8, 5.8, 'Moderate', 'yellow', 1, 'SAMPLE'),
    (CURRENT_DATE(), 'Electric Beach', 21.3558, -158.1467, 27.6, 1.3, 0.6, 6.0, 'Moderate', 'yellow', 1, 'SAMPLE')
    """

    try:
        job = client.query(sample_data_sql)
        job.result()
        print("Inserted sample data")
    except Exception as e:
        print(f"Error inserting sample data: {e}")


def main():
    parser = argparse.ArgumentParser(description="Initialize BigQuery for ReefWatch Oahu")
    parser.add_argument("--project-id", required=True, help="GCP Project ID")
    parser.add_argument("--dataset", default="reefwatch", help="BigQuery dataset name")
    parser.add_argument("--location", default="US", help="Dataset location")
    parser.add_argument("--sample-data", action="store_true", help="Insert sample data")

    args = parser.parse_args()

    # Set project for client
    os.environ["GOOGLE_CLOUD_PROJECT"] = args.project_id

    client = bigquery.Client(project=args.project_id)

    print(f"Initializing BigQuery for project: {args.project_id}")
    print(f"Dataset: {args.dataset}")
    print("-" * 50)

    # Create dataset
    create_dataset(client, args.dataset, args.location)

    # Create tables
    create_ocean_conditions_table(client, args.dataset)
    create_sensor_readings_table(client, args.dataset)
    create_alerts_table(client, args.dataset)
    create_chat_sessions_table(client, args.dataset)

    # Create views
    create_views(client, args.dataset)

    # Optionally insert sample data
    if args.sample_data:
        insert_sample_data(client, args.dataset)

    print("-" * 50)
    print("BigQuery initialization complete!")


if __name__ == "__main__":
    main()
