# ReefWatch Oahu - Makefile
# Common commands for development and deployment

.PHONY: help setup install dev build test lint deploy clean

# Default target
help:
	@echo "ReefWatch Oahu - Available Commands"
	@echo "===================================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup          - Complete project setup"
	@echo "  make install        - Install all dependencies"
	@echo "  make install-backend  - Install backend dependencies"
	@echo "  make install-frontend - Install frontend dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development servers"
	@echo "  make dev-backend    - Start backend dev server"
	@echo "  make dev-frontend   - Start frontend dev server"
	@echo "  make docker-dev     - Start with Docker Compose"
	@echo ""
	@echo "Build & Test:"
	@echo "  make build          - Build all components"
	@echo "  make test           - Run all tests"
	@echo "  make lint           - Run linters"
	@echo "  make type-check     - Run type checking"
	@echo ""
	@echo "Database:"
	@echo "  make init-db        - Initialize BigQuery tables"
	@echo "  make init-db-sample - Initialize with sample data"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy         - Deploy to Cloud Run"
	@echo "  make deploy-backend - Deploy backend only"
	@echo "  make deploy-frontend- Deploy frontend only"
	@echo "  make deploy-functions- Deploy Cloud Functions"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Clean build artifacts"

# ===========================================
# Setup
# ===========================================

setup: install init-env
	@echo "Setup complete! Copy .env.example to .env and add your API keys."

install: install-backend install-frontend
	@echo "All dependencies installed."

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

init-env:
	@if [ ! -f .env ]; then cp .env.example .env; fi

# ===========================================
# Development
# ===========================================

dev:
	@echo "Starting development servers..."
	@make -j2 dev-backend dev-frontend

dev-backend:
	@echo "Starting backend server..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "Starting frontend server..."
	cd frontend && npm run dev

docker-dev:
	@echo "Starting Docker development environment..."
	docker-compose up --build

docker-dev-bg:
	@echo "Starting Docker development environment in background..."
	docker-compose up --build -d

# ===========================================
# Build
# ===========================================

build: build-backend build-frontend
	@echo "Build complete."

build-backend:
	@echo "Building backend..."
	docker build -t reefwatch-backend ./backend

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build
	docker build -t reefwatch-frontend ./frontend

# ===========================================
# Test
# ===========================================

test: test-backend test-frontend
	@echo "All tests complete."

test-backend:
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm run test

test-e2e:
	@echo "Running E2E tests..."
	cd frontend && npm run e2e

# ===========================================
# Lint & Type Check
# ===========================================

lint: lint-backend lint-frontend
	@echo "Linting complete."

lint-backend:
	@echo "Linting backend..."
	cd backend && ruff check app/ tests/ && ruff format --check app/ tests/

lint-frontend:
	@echo "Linting frontend..."
	cd frontend && npm run lint

format:
	@echo "Formatting code..."
	cd backend && ruff format app/ tests/
	cd frontend && npm run lint:fix

type-check: type-check-backend type-check-frontend
	@echo "Type checking complete."

type-check-backend:
	@echo "Type checking backend..."
	cd backend && mypy app/

type-check-frontend:
	@echo "Type checking frontend..."
	cd frontend && npm run type-check

# ===========================================
# Database
# ===========================================

init-db:
	@echo "Initializing BigQuery tables..."
	python infrastructure/scripts/init_bigquery.py \
		--project-id $${GCP_PROJECT_ID:-reefwatch-oahu} \
		--dataset $${BIGQUERY_DATASET:-reefwatch}

init-db-sample:
	@echo "Initializing BigQuery with sample data..."
	python infrastructure/scripts/init_bigquery.py \
		--project-id $${GCP_PROJECT_ID:-reefwatch-oahu} \
		--dataset $${BIGQUERY_DATASET:-reefwatch} \
		--sample-data

# ===========================================
# Deployment
# ===========================================

deploy: deploy-backend deploy-frontend deploy-functions
	@echo "Deployment complete."

deploy-backend:
	@echo "Deploying backend to Cloud Run..."
	gcloud run deploy reefwatch-backend \
		--source ./backend \
		--region $${GCP_LOCATION:-us-central1} \
		--platform managed \
		--allow-unauthenticated \
		--set-env-vars="GCP_PROJECT_ID=$${GCP_PROJECT_ID},BIGQUERY_DATASET=$${BIGQUERY_DATASET}" \
		--set-secrets="ANTHROPIC_API_KEY=anthropic-api-key:latest"

deploy-frontend:
	@echo "Deploying frontend to Cloud Run..."
	gcloud run deploy reefwatch-frontend \
		--source ./frontend \
		--region $${GCP_LOCATION:-us-central1} \
		--platform managed \
		--allow-unauthenticated \
		--set-env-vars="NEXT_PUBLIC_API_URL=$${BACKEND_URL}" \
		--set-secrets="NEXT_PUBLIC_MAPBOX_TOKEN=mapbox-token:latest"

deploy-functions:
	@echo "Deploying Cloud Functions..."
	gcloud functions deploy ingest-ocean-data \
		--source ./backend/functions \
		--runtime python311 \
		--trigger-http \
		--entry-point ingest_ocean_data \
		--region $${GCP_LOCATION:-us-central1} \
		--set-env-vars="GCP_PROJECT_ID=$${GCP_PROJECT_ID},BIGQUERY_DATASET=$${BIGQUERY_DATASET}"

# ===========================================
# Cleanup
# ===========================================

clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/__pycache__ backend/.pytest_cache backend/.mypy_cache
	rm -rf frontend/.next frontend/node_modules/.cache
	docker-compose down --rmi local --volumes --remove-orphans 2>/dev/null || true

clean-docker:
	@echo "Cleaning Docker resources..."
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f
