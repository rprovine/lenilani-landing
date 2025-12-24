# ReefWatch Oahu

Real-time coral reef monitoring and ocean conditions for Oahu's dive and snorkel sites.

ReefWatch Oahu helps visitors and locals make informed decisions about water activities by providing up-to-date ocean conditions, coral bleaching risk assessments, and AI-powered assistance.

## Features

- **Real-time Ocean Conditions**: Current sea surface temperature (SST), temperature anomalies, and degree heating weeks (DHW) for 15 Oahu sites
- **Coral Bleaching Risk Assessment**: Color-coded risk levels based on NOAA Coral Reef Watch thresholds
- **7-Day Forecasts**: Predicted conditions with confidence scores
- **Interactive Map**: Mapbox-powered visualization with site markers and risk indicators
- **AI Chat Assistant**: Ask questions about conditions, get recommendations, and learn about reef conservation
- **Active Alerts**: Real-time warnings for bleaching events and hazardous conditions
- **Historical Data**: View trends over the past year for any site

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Google BigQuery** - Data warehouse for ocean conditions
- **Anthropic Claude** - AI-powered chat assistance
- **Google Cloud Functions** - Data ingestion pipeline

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Mapbox GL** - Interactive mapping
- **Recharts** - Data visualization
- **Zustand** - State management

### Infrastructure
- **Docker** - Containerization
- **Google Cloud Run** - Serverless deployment
- **Google Cloud Scheduler** - Automated data updates
- **Terraform** - Infrastructure as Code

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Google Cloud SDK (for deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/reefwatch-oahu.git
   cd reefwatch-oahu
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start with Docker Compose**
   ```bash
   make dev
   ```

   This starts:
   - Backend API at http://localhost:8000
   - Frontend at http://localhost:3000
   - API docs at http://localhost:8000/docs

### Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
reefwatch-oahu/
├── backend/
│   ├── app/
│   │   ├── api/routes.py          # REST API endpoints
│   │   ├── core/config.py         # Settings and site configuration
│   │   ├── models/schemas.py      # Pydantic models
│   │   └── services/
│   │       ├── bigquery_service.py
│   │       ├── chat_service.py
│   │       └── forecast_service.py
│   ├── functions/main.py          # Cloud Functions for data ingestion
│   ├── tests/                     # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── app/                       # Next.js App Router pages
│   ├── components/                # React components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities and store
│   ├── types/                     # TypeScript definitions
│   └── __tests__/                 # Frontend tests
├── infrastructure/
│   ├── scripts/                   # Setup and deployment scripts
│   └── terraform/                 # Infrastructure as Code
├── docs/                          # Documentation
├── docker-compose.yml
├── Makefile
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and component status |
| `/api/sites` | GET | List all dive/snorkel sites |
| `/api/sites/{id}` | GET | Get site details |
| `/api/sites/{id}/history` | GET | Historical data for a site |
| `/api/current-conditions` | GET | Current conditions for all sites |
| `/api/alerts` | GET | Active alerts and warnings |
| `/api/forecast` | GET | 7-day forecast for all sites |
| `/api/forecast/{id}` | GET | Forecast for specific site |
| `/api/recommendations` | GET | Best sites for a given date |
| `/api/chat` | POST | Send message to AI assistant |
| `/api/chat/stream` | POST | Stream chat response (SSE) |

Full API documentation available at `/docs` when running the backend.

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `GCP_PROJECT_ID` | Google Cloud project ID | Yes |
| `BIGQUERY_DATASET` | BigQuery dataset name | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for chat | Yes |
| `ENVIRONMENT` | development/staging/production | No |
| `DEBUG` | Enable debug mode | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token | Yes |

## Testing

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest --cov              # With coverage
pytest tests/test_routes.py  # Specific test file
```

### Frontend Tests
```bash
cd frontend
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run e2e               # Playwright E2E tests
```

## Deployment

### Using Makefile

```bash
make build-backend        # Build backend image
make build-frontend       # Build frontend image
make deploy-backend       # Deploy to Cloud Run
make deploy-frontend      # Deploy to Cloud Run
make deploy              # Deploy both
```

### Manual Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Data Sources

- **NOAA Coral Reef Watch**: SST, SST anomaly, HotSpot, and DHW data
- **PacIOOS**: Hawaii regional ocean data

Data is updated daily via Cloud Functions triggered by Cloud Scheduler.

## Oahu Sites

ReefWatch monitors 15 popular dive and snorkel locations:

| Site | Type | Difficulty |
|------|------|------------|
| Hanauma Bay | Bay | Beginner |
| Sharks Cove | Cove | Intermediate |
| Three Tables | Reef | Beginner |
| Electric Beach | Beach | Intermediate |
| Waikiki Beach | Beach | Beginner |
| Makaha Beach | Beach | Intermediate |
| Lanikai Beach | Beach | Beginner |
| Haleiwa | Harbor | All Levels |
| Pupukea | Reef | Intermediate |
| Ko Olina Lagoons | Lagoon | Beginner |
| Kahe Point | Reef | Advanced |
| Sans Souci Beach | Beach | Beginner |
| Ala Moana Beach | Beach | Beginner |
| Kuilima Cove | Cove | Beginner |
| Waimea Bay | Bay | Intermediate |

## Understanding the Data

### Risk Levels

| Level | DHW Range | Description |
|-------|-----------|-------------|
| Low | < 4 | Normal conditions |
| Moderate | 4-8 | Coral stress possible |
| High | 8-12 | Bleaching likely |
| Severe | > 12 | Mortality possible |

### Key Metrics

- **SST (Sea Surface Temperature)**: Water temperature at the surface
- **SST Anomaly**: Deviation from historical average
- **DHW (Degree Heating Weeks)**: Accumulated heat stress over 12 weeks
- **HotSpot**: How much SST exceeds maximum monthly mean

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NOAA Coral Reef Watch for ocean monitoring data
- PacIOOS for Hawaii regional data
- Anthropic for Claude AI capabilities
