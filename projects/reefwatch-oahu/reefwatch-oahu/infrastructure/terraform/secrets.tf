# ReefWatch Oahu - Secret Manager Configuration

# Anthropic API Key secret
resource "google_secret_manager_secret" "anthropic_api_key" {
  secret_id = "anthropic-api-key"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    application = "reefwatch"
  }

  depends_on = [google_project_service.required_apis]
}

# Mapbox Token secret
resource "google_secret_manager_secret" "mapbox_token" {
  secret_id = "mapbox-token"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    application = "reefwatch"
  }

  depends_on = [google_project_service.required_apis]
}

# Grant backend access to secrets
resource "google_secret_manager_secret_iam_member" "backend_anthropic" {
  secret_id = google_secret_manager_secret.anthropic_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_mapbox" {
  secret_id = google_secret_manager_secret.mapbox_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

# Note: Secret versions must be created manually or via gcloud CLI
# gcloud secrets versions add anthropic-api-key --data-file=-
# gcloud secrets versions add mapbox-token --data-file=-
