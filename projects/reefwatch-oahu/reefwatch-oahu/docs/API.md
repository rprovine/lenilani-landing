# API Documentation

ReefWatch Oahu API provides access to ocean conditions, coral bleaching risk data, and AI-powered chat assistance for Oahu's dive and snorkel sites.

## Base URL

- Development: `http://localhost:8000/api`
- Production: `https://api.reefwatch-oahu.com/api`

## Authentication

Currently, the API is public and does not require authentication. Rate limiting is applied per IP address.

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/chat` | 30 requests/minute |
| `/chat/stream` | 30 requests/minute |
| `/admin/refresh` | 5 requests/minute |
| All other endpoints | 60 requests/minute |

## Endpoints

### Health Check

#### GET /health

Check API health and component status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "api": "healthy",
    "bigquery": "healthy",
    "anthropic": "unknown"
  }
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Some components have issues
- `unhealthy` - Critical failures

---

### Sites

#### GET /sites

Get list of all dive/snorkel sites.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by site type: bay, beach, cove, reef, lagoon, harbor |
| `difficulty` | string | Filter by difficulty: beginner, intermediate, advanced, all_levels |

**Response:**
```json
{
  "sites": [
    {
      "id": "hanauma-bay",
      "name": "Hanauma Bay",
      "coordinates": {
        "latitude": 21.2693,
        "longitude": -157.6943
      },
      "type": "bay",
      "description": "Marine life conservation area, famous snorkeling spot",
      "facilities": ["restrooms", "parking", "rentals", "lifeguards"],
      "best_conditions": "Morning, calm days",
      "difficulty": "beginner"
    }
  ],
  "count": 15
}
```

#### GET /sites/{site_id}

Get detailed information for a specific site.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | Site identifier (e.g., "hanauma-bay") |

**Response:** Same as site object above.

**Error Responses:**
- `404` - Site not found

#### GET /sites/{site_id}/history

Get historical ocean conditions for a site.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | Site identifier |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Number of days (1-365) |

**Response:**
```json
{
  "site_id": "hanauma-bay",
  "site_name": "Hanauma Bay",
  "data": [
    {
      "date": "2024-01-15",
      "sst": 26.5,
      "sst_anomaly": 0.3,
      "dhw": 2.1,
      "risk_level": "Low"
    }
  ],
  "period_start": "2023-12-16",
  "period_end": "2024-01-15",
  "statistics": {
    "avg_sst": 26.2,
    "max_sst": 27.1,
    "min_sst": 25.4,
    "avg_dhw": 1.8,
    "max_dhw": 3.2,
    "days_at_risk": 2,
    "data_coverage": 0.97
  }
}
```

---

### Current Conditions

#### GET /current-conditions

Get current ocean conditions for all sites.

**Response:**
```json
{
  "sites": [
    {
      "id": "hanauma-bay",
      "name": "Hanauma Bay",
      "coordinates": {
        "latitude": 21.2693,
        "longitude": -157.6943
      },
      "type": "bay",
      "description": "Marine life conservation area",
      "facilities": ["restrooms", "parking"],
      "best_conditions": "Morning, calm days",
      "difficulty": "beginner",
      "conditions": {
        "sst": 26.5,
        "sst_anomaly": 0.3,
        "hotspot": 0.5,
        "dhw": 2.1,
        "temperature_trend": "stable"
      },
      "risk": {
        "level": "Low",
        "color": "green",
        "score": 0,
        "description": "Conditions are normal. Safe for coral viewing."
      },
      "last_updated": "2024-01-15T06:00:00Z"
    }
  ],
  "data_date": "2024-01-15",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Alerts

#### GET /alerts

Get all active alerts and warnings.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-001",
      "type": "bleaching",
      "severity": "warning",
      "title": "Coral Bleaching Warning",
      "description": "Elevated bleaching risk at 3 site(s).",
      "affected_sites": ["sharks-cove", "pupukea", "three-tables"],
      "created_at": "2024-01-15T00:00:00Z",
      "expires_at": null,
      "is_active": true
    }
  ],
  "count": 1
}
```

**Alert Types:** `bleaching`, `weather`, `water_quality`
**Severity Levels:** `watch`, `warning`, `alert`

---

### Forecasts

#### GET /forecast

Get 7-day forecast for all sites.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 7 | Forecast days (1-7) |

**Response:**
```json
{
  "forecasts": [
    {
      "site_id": "hanauma-bay",
      "site_name": "Hanauma Bay",
      "forecast": [
        {
          "date": "2024-01-16",
          "predicted_sst": 26.6,
          "predicted_dhw": 2.2,
          "predicted_risk": "Low",
          "confidence": 0.9
        }
      ],
      "generated_at": "2024-01-15T10:00:00Z",
      "model_version": "v1.0"
    }
  ],
  "generated_at": "2024-01-15T10:00:00Z"
}
```

#### GET /forecast/{site_id}

Get forecast for a specific site.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `site_id` | string | Site identifier |

**Response:** Single `SiteForecastResponse` object.

#### GET /recommendations

Get recommended sites for a specific date.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `target_date` | date | Date to get recommendations for (ISO format) |

**Response:**
```json
{
  "target_date": "2024-01-18",
  "recommendations": [
    {
      "site_id": "hanauma-bay",
      "site_name": "Hanauma Bay",
      "predicted_sst": 26.5,
      "predicted_dhw": 2.1,
      "predicted_risk": "Low",
      "confidence": 0.85
    }
  ]
}
```

**Error Responses:**
- `400` - Date must be in the future and within 7 days

---

### Chat

#### POST /chat

Send a message to the AI assistant.

**Request Body:**
```json
{
  "message": "How are the conditions at Hanauma Bay today?",
  "session_id": "optional-session-id",
  "include_context": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User message (1-2000 chars) |
| `session_id` | string | No | Session ID for conversation continuity |
| `include_context` | boolean | No | Include current conditions in context (default: true) |

**Response:**
```json
{
  "response": "Aloha! The conditions at Hanauma Bay are looking great today...",
  "session_id": "abc123-def456",
  "context_used": true,
  "model": "claude-sonnet-4-20250514"
}
```

#### POST /chat/stream

Stream a chat response (Server-Sent Events).

**Request Body:** Same as `/chat`

**Response:** SSE stream with chunks:
```
data: {"content": "Aloha! "}

data: {"content": "The conditions "}

data: {"content": "are great today!"}

data: {"done": true, "session_id": "abc123"}
```

#### DELETE /chat/{session_id}

Clear a chat session.

**Response:**
```json
{
  "message": "Session cleared",
  "session_id": "abc123-def456"
}
```

---

### Admin

#### POST /admin/refresh

Manually trigger a data refresh.

**Request Body:**
```json
{
  "source": "all",
  "date": "2024-01-15"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Data source: noaa, pacioos, or all |
| `date` | date | Specific date to refresh (optional) |

**Response:**
```json
{
  "status": "success",
  "message": "Cache cleared. Data will refresh on next request.",
  "records_updated": 0,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET /admin/stats

Get administrative statistics.

**Response:**
```json
{
  "data_summary": {
    "date": "2024-01-15",
    "total_sites": 15,
    "sites_with_data": 15,
    "average_sst": 26.5,
    "risk_distribution": {
      "low": 10,
      "moderate": 3,
      "high": 2,
      "severe": 0
    }
  },
  "cache_info": {
    "max_size": 1000,
    "ttl_seconds": 300
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

**Common Status Codes:**
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid input |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Data Types

### Risk Levels

| Level | DHW Range | Score | Color |
|-------|-----------|-------|-------|
| Low | < 4 | 0 | green |
| Moderate | 4-8 | 1 | yellow |
| High | 8-12 | 2 | orange |
| Severe | > 12 | 3 | red |
| Unknown | N/A | -1 | gray |

### Site Types

- `bay` - Protected bay areas
- `beach` - Open beach locations
- `cove` - Small, sheltered coves
- `reef` - Reef formations
- `lagoon` - Lagoon areas
- `harbor` - Harbor locations

### Difficulty Levels

- `beginner` - Calm, shallow, easy access
- `intermediate` - Some currents or depth
- `advanced` - Challenging conditions
- `all_levels` - Suitable for everyone

---

## SDKs and Examples

### JavaScript/TypeScript

```typescript
const API_URL = 'http://localhost:8000/api';

// Get current conditions
const conditions = await fetch(`${API_URL}/current-conditions`)
  .then(res => res.json());

// Send chat message
const chatResponse = await fetch(`${API_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Best snorkeling spot today?' })
}).then(res => res.json());
```

### Python

```python
import requests

API_URL = 'http://localhost:8000/api'

# Get current conditions
conditions = requests.get(f'{API_URL}/current-conditions').json()

# Send chat message
response = requests.post(
    f'{API_URL}/chat',
    json={'message': 'Best snorkeling spot today?'}
).json()
```

### cURL

```bash
# Get sites
curl http://localhost:8000/api/sites

# Get conditions
curl http://localhost:8000/api/current-conditions

# Chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How are conditions today?"}'
```
