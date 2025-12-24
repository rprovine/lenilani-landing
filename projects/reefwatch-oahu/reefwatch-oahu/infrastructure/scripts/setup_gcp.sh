#!/bin/bash
# ReefWatch Oahu - GCP Setup Script
# This script sets up all necessary GCP resources for the project

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-reefwatch-oahu}"
REGION="${GCP_LOCATION:-us-central1}"
DATASET="${BIGQUERY_DATASET:-reefwatch}"

echo "======================================"
echo "ReefWatch Oahu - GCP Setup"
echo "======================================"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "BigQuery Dataset: $DATASET"
echo "======================================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Please log in to gcloud:"
    gcloud auth login
fi

# Create or select project
echo "Setting up project..."
if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
    echo "Creating project $PROJECT_ID..."
    gcloud projects create "$PROJECT_ID" --name="ReefWatch Oahu"
fi
gcloud config set project "$PROJECT_ID"

# Enable billing (manual step)
echo ""
echo "IMPORTANT: Ensure billing is enabled for this project."
echo "Visit: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
echo ""
read -p "Press Enter when billing is enabled..."

# Enable required APIs
echo "Enabling required APIs..."
apis=(
    "bigquery.googleapis.com"
    "run.googleapis.com"
    "cloudfunctions.googleapis.com"
    "cloudbuild.googleapis.com"
    "cloudscheduler.googleapis.com"
    "secretmanager.googleapis.com"
    "logging.googleapis.com"
    "storage.googleapis.com"
    "artifactregistry.googleapis.com"
)

for api in "${apis[@]}"; do
    echo "  Enabling $api..."
    gcloud services enable "$api" --quiet
done

# Create BigQuery dataset
echo "Creating BigQuery dataset..."
if ! bq ls --project_id="$PROJECT_ID" "$DATASET" &> /dev/null; then
    bq mk --dataset \
        --location=US \
        --description="ReefWatch Oahu ocean monitoring data" \
        "$PROJECT_ID:$DATASET"
fi

# Create service accounts
echo "Creating service accounts..."

# Backend service account
if ! gcloud iam service-accounts describe "reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com" &> /dev/null; then
    gcloud iam service-accounts create reefwatch-backend \
        --display-name="ReefWatch Backend Service Account"
fi

# Functions service account
if ! gcloud iam service-accounts describe "reefwatch-functions@$PROJECT_ID.iam.gserviceaccount.com" &> /dev/null; then
    gcloud iam service-accounts create reefwatch-functions \
        --display-name="ReefWatch Cloud Functions Service Account"
fi

# Grant permissions
echo "Granting IAM permissions..."

# Backend permissions
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter" --quiet

# Functions permissions
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:reefwatch-functions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataEditor" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:reefwatch-functions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter" --quiet

# Create secrets
echo "Creating secrets in Secret Manager..."
echo "You will need to add the actual values manually."

# Create empty secrets (will need to be populated)
for secret in "anthropic-api-key" "mapbox-token"; do
    if ! gcloud secrets describe "$secret" &> /dev/null; then
        echo "Creating secret: $secret"
        echo -n "placeholder" | gcloud secrets create "$secret" --data-file=-
        echo "  Please update with actual value: gcloud secrets versions add $secret --data-file=-"
    fi
done

# Grant secret access
gcloud secrets add-iam-policy-binding anthropic-api-key \
    --member="serviceAccount:reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" --quiet

# Create Cloud Scheduler job for daily data ingestion
echo "Setting up Cloud Scheduler..."
if ! gcloud scheduler jobs describe ingest-ocean-data --location="$REGION" &> /dev/null 2>&1; then
    # Note: Cloud Function URL will be updated after deployment
    gcloud scheduler jobs create http ingest-ocean-data \
        --location="$REGION" \
        --schedule="0 6 * * *" \
        --uri="https://$REGION-$PROJECT_ID.cloudfunctions.net/ingest-ocean-data" \
        --http-method=GET \
        --oidc-service-account-email="reefwatch-functions@$PROJECT_ID.iam.gserviceaccount.com" \
        --description="Daily ocean data ingestion" \
        --time-zone="Pacific/Honolulu"
    echo "  Scheduler created (will be active after function deployment)"
fi

# Create Cloud Storage bucket for static assets
echo "Creating Cloud Storage bucket..."
BUCKET_NAME="$PROJECT_ID-static"
if ! gsutil ls -b "gs://$BUCKET_NAME" &> /dev/null 2>&1; then
    gsutil mb -l "$REGION" "gs://$BUCKET_NAME"
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME"
fi

echo ""
echo "======================================"
echo "GCP Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Add your API keys to Secret Manager:"
echo "   echo 'your-anthropic-key' | gcloud secrets versions add anthropic-api-key --data-file=-"
echo "   echo 'your-mapbox-token' | gcloud secrets versions add mapbox-token --data-file=-"
echo ""
echo "2. Initialize BigQuery tables:"
echo "   make init-db"
echo ""
echo "3. Deploy the application:"
echo "   make deploy"
echo ""
