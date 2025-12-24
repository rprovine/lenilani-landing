# ReefWatch Oahu - BigQuery Configuration

# BigQuery dataset
resource "google_bigquery_dataset" "reefwatch" {
  dataset_id    = var.bigquery_dataset
  friendly_name = "ReefWatch Oahu"
  description   = "Ocean conditions and coral bleaching risk data for Oahu dive sites"
  location      = var.bigquery_location

  labels = {
    environment = var.environment
    application = "reefwatch"
  }

  # Default table expiration (optional)
  # default_table_expiration_ms = 31536000000  # 1 year

  depends_on = [google_project_service.required_apis]
}

# Ocean conditions daily table
resource "google_bigquery_table" "ocean_conditions_daily" {
  dataset_id          = google_bigquery_dataset.reefwatch.dataset_id
  table_id            = "ocean_conditions_daily"
  deletion_protection = var.environment == "production"

  time_partitioning {
    type  = "DAY"
    field = "date"
  }

  clustering = ["site_name"]

  schema = jsonencode([
    {
      name        = "date"
      type        = "DATE"
      mode        = "REQUIRED"
      description = "Date of the ocean conditions data"
    },
    {
      name        = "site_name"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Name of the dive/snorkel site"
    },
    {
      name        = "latitude"
      type        = "FLOAT64"
      mode        = "REQUIRED"
      description = "Site latitude"
    },
    {
      name        = "longitude"
      type        = "FLOAT64"
      mode        = "REQUIRED"
      description = "Site longitude"
    },
    {
      name        = "sst"
      type        = "FLOAT64"
      mode        = "NULLABLE"
      description = "Sea Surface Temperature in Celsius"
    },
    {
      name        = "sst_anomaly"
      type        = "FLOAT64"
      mode        = "NULLABLE"
      description = "SST deviation from historical average"
    },
    {
      name        = "hotspot"
      type        = "FLOAT64"
      mode        = "NULLABLE"
      description = "Coral Bleaching HotSpot value"
    },
    {
      name        = "dhw"
      type        = "FLOAT64"
      mode        = "NULLABLE"
      description = "Degree Heating Weeks"
    },
    {
      name        = "risk_level"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Bleaching risk level: Low, Moderate, High, Severe"
    },
    {
      name        = "risk_color"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Risk color code: green, yellow, orange, red"
    },
    {
      name        = "risk_score"
      type        = "INT64"
      mode        = "NULLABLE"
      description = "Numeric risk score 0-3"
    },
    {
      name        = "data_source"
      type        = "STRING"
      mode        = "NULLABLE"
      description = "Data source: NOAA, PacIOOS"
    },
    {
      name        = "created_at"
      type        = "TIMESTAMP"
      mode        = "REQUIRED"
      description = "Record creation timestamp"
    }
  ])

  labels = {
    environment = var.environment
  }
}

# Alerts table
resource "google_bigquery_table" "alerts" {
  dataset_id          = google_bigquery_dataset.reefwatch.dataset_id
  table_id            = "alerts"
  deletion_protection = var.environment == "production"

  schema = jsonencode([
    {
      name        = "alert_id"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Unique alert identifier"
    },
    {
      name        = "alert_type"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Alert type: bleaching, weather, water_quality"
    },
    {
      name        = "severity"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Severity: watch, warning, alert"
    },
    {
      name        = "title"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Alert title"
    },
    {
      name        = "description"
      type        = "STRING"
      mode        = "REQUIRED"
      description = "Alert description"
    },
    {
      name        = "affected_sites"
      type        = "STRING"
      mode        = "REPEATED"
      description = "List of affected site IDs"
    },
    {
      name        = "created_at"
      type        = "TIMESTAMP"
      mode        = "REQUIRED"
      description = "Alert creation time"
    },
    {
      name        = "expires_at"
      type        = "TIMESTAMP"
      mode        = "NULLABLE"
      description = "Alert expiration time"
    },
    {
      name        = "is_active"
      type        = "BOOL"
      mode        = "REQUIRED"
      description = "Whether alert is currently active"
    }
  ])

  labels = {
    environment = var.environment
  }
}

# Grant service accounts access to dataset
resource "google_bigquery_dataset_iam_member" "backend_access" {
  dataset_id = google_bigquery_dataset.reefwatch.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_bigquery_dataset_iam_member" "functions_access" {
  dataset_id = google_bigquery_dataset.reefwatch.dataset_id
  role       = "roles/bigquery.dataEditor"
  member     = "serviceAccount:${google_service_account.functions.email}"
}
