# ReefWatch Oahu - Cloud Scheduler Configuration

# Storage bucket for Cloud Functions source
resource "google_storage_bucket" "functions_source" {
  name     = "${var.project_id}-functions-source"
  location = var.region

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  labels = {
    environment = var.environment
    application = "reefwatch"
  }

  depends_on = [google_project_service.required_apis]
}

# Cloud Function for data ingestion (Gen2)
resource "google_cloudfunctions2_function" "fetch_ocean_data" {
  name     = "fetch-ocean-data"
  location = var.region

  build_config {
    runtime     = "python311"
    entry_point = "fetch_data"

    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = "functions-source.zip"
      }
    }
  }

  service_config {
    max_instance_count    = 1
    min_instance_count    = 0
    available_memory      = "512Mi"
    timeout_seconds       = 300
    service_account_email = google_service_account.functions.email

    environment_variables = {
      GCP_PROJECT_ID   = var.project_id
      BIGQUERY_DATASET = var.bigquery_dataset
    }
  }

  labels = {
    environment = var.environment
    application = "reefwatch"
  }

  depends_on = [google_project_service.required_apis]
}

# Allow Cloud Scheduler to invoke the function
resource "google_cloud_run_v2_service_iam_member" "scheduler_invoker" {
  location = var.region
  name     = google_cloudfunctions2_function.fetch_ocean_data.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.scheduler.email}"
}

# Service account for Cloud Scheduler
resource "google_service_account" "scheduler" {
  account_id   = "reefwatch-scheduler"
  display_name = "ReefWatch Scheduler Service Account"
  description  = "Service account for Cloud Scheduler jobs"
}

# Cloud Scheduler job - Daily data fetch at 6 AM Hawaii time
resource "google_cloud_scheduler_job" "daily_data_fetch" {
  name        = "reefwatch-daily-data-fetch"
  description = "Fetches ocean conditions data from NOAA and PacIOOS daily"
  schedule    = "0 6 * * *"
  time_zone   = "Pacific/Honolulu"
  region      = var.region

  retry_config {
    retry_count          = 3
    min_backoff_duration = "60s"
    max_backoff_duration = "300s"
  }

  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.fetch_ocean_data.url

    oidc_token {
      service_account_email = google_service_account.scheduler.email
    }
  }

  depends_on = [
    google_project_service.required_apis,
    google_cloudfunctions2_function.fetch_ocean_data,
  ]
}

# Additional scheduler job - Hourly alerts check (optional)
resource "google_cloud_scheduler_job" "hourly_alerts_check" {
  count = var.environment == "production" ? 1 : 0

  name        = "reefwatch-hourly-alerts"
  description = "Checks conditions and generates alerts hourly"
  schedule    = "0 * * * *"
  time_zone   = "Pacific/Honolulu"
  region      = var.region

  retry_config {
    retry_count = 2
  }

  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.backend.uri}/api/admin/refresh"
  }

  depends_on = [google_cloud_run_v2_service.backend]
}
