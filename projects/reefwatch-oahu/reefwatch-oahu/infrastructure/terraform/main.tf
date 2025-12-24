# ReefWatch Oahu - Terraform Configuration
# Main configuration file

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state storage
  # Uncomment and configure for production
  # backend "gcs" {
  #   bucket = "reefwatch-terraform-state"
  #   prefix = "terraform/state"
  # }
}

# Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "bigquery.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudscheduler.googleapis.com",
    "artifactregistry.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "reefwatch" {
  location      = var.region
  repository_id = "reefwatch"
  description   = "Docker repository for ReefWatch Oahu"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Local variables
locals {
  backend_image  = "${var.region}-docker.pkg.dev/${var.project_id}/reefwatch/backend:${var.image_tag}"
  frontend_image = "${var.region}-docker.pkg.dev/${var.project_id}/reefwatch/frontend:${var.image_tag}"
}
