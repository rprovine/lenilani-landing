# Deployment Guide

This guide covers deploying ReefWatch Oahu to Google Cloud Platform.

## Prerequisites

- Google Cloud SDK installed and configured
- Docker installed
- Access to a GCP project with billing enabled
- Required APIs enabled (Cloud Run, BigQuery, Cloud Functions, Secret Manager)

## Initial Setup

### 1. Configure GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudfunctions.googleapis.com \
  bigquery.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create reefwatch-backend \
  --display-name="ReefWatch Backend"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Set Up Secrets

```bash
# Store Anthropic API key
echo -n "your-api-key" | gcloud secrets create anthropic-api-key --data-file=-

# Store Mapbox token
echo -n "your-token" | gcloud secrets create mapbox-token --data-file=-
```

### 4. Initialize BigQuery

```bash
cd infrastructure/scripts
python init_bigquery.py
```

This creates:
- `reefwatch` dataset
- `ocean_conditions_daily` table
- `alerts` table
- `chat_history` table (optional)

## Deploy Backend

### Build and Push Image

```bash
cd backend

# Build image
docker build -t gcr.io/$PROJECT_ID/reefwatch-backend:latest .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/reefwatch-backend:latest
```

### Deploy to Cloud Run

```bash
gcloud run deploy reefwatch-backend \
  --image gcr.io/$PROJECT_ID/reefwatch-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,ENVIRONMENT=production" \
  --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Deploy Frontend

### Build and Push Image

```bash
cd frontend

# Build image
docker build -t gcr.io/$PROJECT_ID/reefwatch-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://reefwatch-backend-xxxx.run.app \
  --build-arg NEXT_PUBLIC_MAPBOX_TOKEN=your-token .

# Push to Container Registry
docker push gcr.io/$PROJECT_ID/reefwatch-frontend:latest
```

### Deploy to Cloud Run

```bash
gcloud run deploy reefwatch-frontend \
  --image gcr.io/$PROJECT_ID/reefwatch-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5
```

## Deploy Data Ingestion

### Deploy Cloud Function

```bash
cd backend/functions

gcloud functions deploy fetch-ocean-data \
  --runtime python311 \
  --trigger-http \
  --entry-point fetch_data \
  --region us-central1 \
  --service-account reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID" \
  --memory 512MB \
  --timeout 300s
```

### Set Up Cloud Scheduler

```bash
# Daily data fetch at 6 AM Hawaii time
gcloud scheduler jobs create http fetch-ocean-data-daily \
  --schedule="0 6 * * *" \
  --time-zone="Pacific/Honolulu" \
  --uri="https://us-central1-$PROJECT_ID.cloudfunctions.net/fetch-ocean-data" \
  --http-method=POST \
  --oidc-service-account-email=reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com
```

## Using Makefile

The Makefile provides shortcuts for common operations:

```bash
# Build images
make build-backend
make build-frontend

# Deploy
make deploy-backend
make deploy-frontend
make deploy  # Deploy both

# View logs
make logs-backend
make logs-frontend

# Run locally
make dev
```

## Environment Configuration

### Production Environment Variables

**Backend (Cloud Run):**
```
GCP_PROJECT_ID=your-project
BIGQUERY_DATASET=reefwatch
ENVIRONMENT=production
DEBUG=false
```

**Frontend (Cloud Run):**
```
NEXT_PUBLIC_API_URL=https://reefwatch-backend-xxxx.run.app
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

## Monitoring

### Set Up Alerts

```bash
# CPU utilization alert
gcloud alpha monitoring policies create \
  --notification-channels="your-channel-id" \
  --display-name="High CPU on ReefWatch Backend" \
  --condition-display-name="CPU > 80%" \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/container/cpu/utilizations"' \
  --condition-threshold-value=0.8 \
  --condition-threshold-comparison=COMPARISON_GT
```

### View Logs

```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=reefwatch-backend" --limit=50

# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=reefwatch-frontend" --limit=50
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service reefwatch-backend

# Rollback to previous revision
gcloud run services update-traffic reefwatch-backend \
  --to-revisions=reefwatch-backend-00001=100
```

## Cost Optimization

1. **Cloud Run**: Use min-instances=0 for auto-scaling to zero
2. **BigQuery**: Use partitioning on date column (already configured)
3. **Cloud Functions**: Set appropriate memory limits
4. **Container Registry**: Set up lifecycle policies to delete old images

## Security Checklist

- [ ] API keys stored in Secret Manager
- [ ] Service accounts with minimal permissions
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on API endpoints
- [ ] HTTPS enforced on all endpoints
- [ ] No sensitive data in logs

## Troubleshooting

### Backend not starting
```bash
# Check logs
gcloud run services logs read reefwatch-backend --limit=100

# Check container locally
docker run -p 8000:8000 gcr.io/$PROJECT_ID/reefwatch-backend:latest
```

### BigQuery connection issues
```bash
# Verify service account permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:reefwatch-backend@$PROJECT_ID.iam.gserviceaccount.com"
```

### Cloud Function timeout
- Increase timeout in deployment command
- Check for slow external API calls
- Consider async processing for large data sets
