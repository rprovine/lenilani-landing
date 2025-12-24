# ReefWatch Oahu - Terraform Variables

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

# Backend configuration
variable "backend_cpu" {
  description = "CPU allocation for backend service"
  type        = string
  default     = "1"
}

variable "backend_memory" {
  description = "Memory allocation for backend service"
  type        = string
  default     = "512Mi"
}

variable "backend_min_instances" {
  description = "Minimum instances for backend (0 for scale-to-zero)"
  type        = number
  default     = 0
}

variable "backend_max_instances" {
  description = "Maximum instances for backend"
  type        = number
  default     = 10
}

# Frontend configuration
variable "frontend_cpu" {
  description = "CPU allocation for frontend service"
  type        = string
  default     = "1"
}

variable "frontend_memory" {
  description = "Memory allocation for frontend service"
  type        = string
  default     = "256Mi"
}

variable "frontend_min_instances" {
  description = "Minimum instances for frontend (0 for scale-to-zero)"
  type        = number
  default     = 0
}

variable "frontend_max_instances" {
  description = "Maximum instances for frontend"
  type        = number
  default     = 5
}

# BigQuery configuration
variable "bigquery_dataset" {
  description = "BigQuery dataset name"
  type        = string
  default     = "reefwatch"
}

variable "bigquery_location" {
  description = "BigQuery dataset location"
  type        = string
  default     = "US"
}

# Data retention
variable "data_retention_days" {
  description = "Number of days to retain historical data"
  type        = number
  default     = 365
}

# Alert configuration
variable "alert_email" {
  description = "Email address for monitoring alerts"
  type        = string
  default     = ""
}

# Domain configuration
variable "domain" {
  description = "Custom domain for the application (optional)"
  type        = string
  default     = ""
}

# Mapbox token (for frontend build)
variable "mapbox_token" {
  description = "Mapbox access token"
  type        = string
  sensitive   = true
  default     = ""
}
