# ReefWatch Oahu - Terraform Outputs

# Backend outputs
output "backend_url" {
  description = "URL of the backend Cloud Run service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "backend_service_account" {
  description = "Backend service account email"
  value       = google_service_account.backend.email
}

# Frontend outputs
output "frontend_url" {
  description = "URL of the frontend Cloud Run service"
  value       = google_cloud_run_v2_service.frontend.uri
}

# BigQuery outputs
output "bigquery_dataset_id" {
  description = "BigQuery dataset ID"
  value       = google_bigquery_dataset.reefwatch.dataset_id
}

output "bigquery_table_ocean_conditions" {
  description = "Ocean conditions table full ID"
  value       = "${google_bigquery_dataset.reefwatch.project}.${google_bigquery_dataset.reefwatch.dataset_id}.${google_bigquery_table.ocean_conditions_daily.table_id}"
}

# Cloud Functions outputs
output "function_url" {
  description = "URL of the data fetch Cloud Function"
  value       = google_cloudfunctions2_function.fetch_ocean_data.url
}

# Scheduler outputs
output "scheduler_job_name" {
  description = "Cloud Scheduler job name"
  value       = google_cloud_scheduler_job.daily_data_fetch.name
}

# Artifact Registry
output "artifact_registry" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.reefwatch.repository_id}"
}

# Summary output
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    project_id  = var.project_id
    region      = var.region
    environment = var.environment
    backend     = google_cloud_run_v2_service.backend.uri
    frontend    = google_cloud_run_v2_service.frontend.uri
    api_docs    = "${google_cloud_run_v2_service.backend.uri}/docs"
  }
}
