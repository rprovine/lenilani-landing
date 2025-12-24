# ReefWatch Oahu - IAM Configuration

# Service account for backend
resource "google_service_account" "backend" {
  account_id   = "reefwatch-backend"
  display_name = "ReefWatch Backend Service Account"
  description  = "Service account for ReefWatch backend Cloud Run service"
}

# Service account for Cloud Functions
resource "google_service_account" "functions" {
  account_id   = "reefwatch-functions"
  display_name = "ReefWatch Functions Service Account"
  description  = "Service account for ReefWatch Cloud Functions"
}

# BigQuery Data Editor role for backend
resource "google_project_iam_member" "backend_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# BigQuery Job User role for backend
resource "google_project_iam_member" "backend_bigquery_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# Secret Manager access for backend
resource "google_project_iam_member" "backend_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# Cloud Logging for backend
resource "google_project_iam_member" "backend_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# BigQuery Data Editor role for functions
resource "google_project_iam_member" "functions_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# BigQuery Job User role for functions
resource "google_project_iam_member" "functions_bigquery_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# Cloud Logging for functions
resource "google_project_iam_member" "functions_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.functions.email}"
}
