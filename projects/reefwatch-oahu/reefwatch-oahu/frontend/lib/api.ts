/**
 * API client for ReefWatch Oahu backend.
 *
 * Provides typed functions for all API endpoints with error handling
 * and response parsing.
 */

import type {
  CurrentConditionsResponse,
  SiteListResponse,
  SiteHistoryResponse,
  ForecastResponse,
  SiteForecastResponse,
  AlertsResponse,
  ChatRequest,
  ChatResponse,
  HealthResponse,
  Site,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ApiError(
        response.status,
        `API Error: ${response.status} - ${errorBody}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${(error as Error).message}`);
  }
}

// Sites

export async function getSites(): Promise<SiteListResponse> {
  return fetchApi<SiteListResponse>('/sites');
}

export async function getSite(siteId: string): Promise<Site> {
  return fetchApi<Site>(`/sites/${siteId}`);
}

export async function getSiteHistory(
  siteId: string,
  days: number = 30
): Promise<SiteHistoryResponse> {
  return fetchApi<SiteHistoryResponse>(`/sites/${siteId}/history?days=${days}`);
}

// Conditions

export async function getCurrentConditions(): Promise<CurrentConditionsResponse> {
  return fetchApi<CurrentConditionsResponse>('/current-conditions');
}

// Alerts

export async function getAlerts(): Promise<AlertsResponse> {
  return fetchApi<AlertsResponse>('/alerts');
}

// Forecasts

export async function getForecasts(days: number = 7): Promise<ForecastResponse> {
  return fetchApi<ForecastResponse>(`/forecast?days=${days}`);
}

export async function getSiteForecast(
  siteId: string,
  days: number = 7
): Promise<SiteForecastResponse> {
  return fetchApi<SiteForecastResponse>(`/forecast/${siteId}?days=${days}`);
}

// Chat

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return fetchApi<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete: (sessionId: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const url = `${API_BASE_URL}/api/chat/stream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Stream request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.done) {
              onComplete(parsed.session_id);
            } else if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    onError(error as Error);
  }
}

export async function clearChatSession(sessionId: string): Promise<void> {
  await fetchApi(`/chat/${sessionId}`, {
    method: 'DELETE',
  });
}

// Health

export async function getHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>('/health');
}

// Admin

export async function refreshData(): Promise<{ status: string; message: string }> {
  return fetchApi('/admin/refresh', {
    method: 'POST',
  });
}

// Utility to check if API is available
export async function checkApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}
