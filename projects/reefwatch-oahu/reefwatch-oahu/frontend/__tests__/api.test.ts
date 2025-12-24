/**
 * Tests for API client.
 */

import {
  getSites,
  getSite,
  getSiteHistory,
  getCurrentConditions,
  getAlerts,
  getForecasts,
  getSiteForecast,
  sendChatMessage,
  clearChatSession,
  getHealth,
  refreshData,
  checkApiConnection,
} from '@/lib/api';

// Mock fetch
const mockFetch = global.fetch as jest.Mock;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('API Client - Sites', () => {
  describe('getSites', () => {
    it('fetches sites successfully', async () => {
      const mockResponse = {
        sites: [{ id: 'test-site', name: 'Test Site' }],
        count: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getSites();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sites'),
        expect.any(Object)
      );
      expect(result.count).toBe(1);
    });

    it('throws on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(getSites()).rejects.toThrow('API Error');
    });
  });

  describe('getSite', () => {
    it('fetches a single site', async () => {
      const mockSite = { id: 'test-site', name: 'Test Site' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSite,
      });

      const result = await getSite('test-site');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sites/test-site'),
        expect.any(Object)
      );
      expect(result.id).toBe('test-site');
    });
  });

  describe('getSiteHistory', () => {
    it('fetches site history with default days', async () => {
      const mockHistory = {
        site_id: 'test-site',
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

      const result = await getSiteHistory('test-site');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sites/test-site/history?days=30'),
        expect.any(Object)
      );
      expect(result.site_id).toBe('test-site');
    });

    it('fetches site history with custom days', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ site_id: 'test-site', data: [] }),
      });

      await getSiteHistory('test-site', 60);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sites/test-site/history?days=60'),
        expect.any(Object)
      );
    });
  });
});

describe('API Client - Conditions', () => {
  describe('getCurrentConditions', () => {
    it('fetches current conditions', async () => {
      const mockConditions = {
        sites: [],
        data_date: '2024-01-15',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConditions,
      });

      const result = await getCurrentConditions();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/current-conditions'),
        expect.any(Object)
      );
      expect(result.data_date).toBe('2024-01-15');
    });
  });
});

describe('API Client - Alerts', () => {
  describe('getAlerts', () => {
    it('fetches alerts', async () => {
      const mockAlerts = {
        alerts: [{ id: 'alert-1', title: 'Test Alert' }],
        count: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      });

      const result = await getAlerts();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/alerts'),
        expect.any(Object)
      );
      expect(result.count).toBe(1);
    });
  });
});

describe('API Client - Forecasts', () => {
  describe('getForecasts', () => {
    it('fetches forecasts with default days', async () => {
      const mockForecasts = {
        forecasts: [],
        generated_at: '2024-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecasts,
      });

      const result = await getForecasts();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/forecast?days=7'),
        expect.any(Object)
      );
      expect(result.forecasts).toEqual([]);
    });

    it('fetches forecasts with custom days', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ forecasts: [], generated_at: '' }),
      });

      await getForecasts(3);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/forecast?days=3'),
        expect.any(Object)
      );
    });
  });

  describe('getSiteForecast', () => {
    it('fetches site-specific forecast', async () => {
      const mockForecast = {
        site_id: 'test-site',
        forecast: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecast,
      });

      const result = await getSiteForecast('test-site');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/forecast/test-site?days=7'),
        expect.any(Object)
      );
      expect(result.site_id).toBe('test-site');
    });
  });
});

describe('API Client - Chat', () => {
  describe('sendChatMessage', () => {
    it('sends chat message', async () => {
      const mockResponse = {
        response: 'Hello!',
        session_id: 'session-123',
        context_used: true,
        model: 'claude',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendChatMessage({ message: 'Hello' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Hello'),
        })
      );
      expect(result.session_id).toBe('session-123');
    });

    it('sends message with session ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: '', session_id: 'session-123' }),
      });

      await sendChatMessage({
        message: 'Follow up',
        session_id: 'session-123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('session-123'),
        })
      );
    });
  });

  describe('clearChatSession', () => {
    it('clears session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Session cleared' }),
      });

      await clearChatSession('session-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/session-123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

describe('API Client - Health', () => {
  describe('getHealth', () => {
    it('fetches health status', async () => {
      const mockHealth = {
        status: 'healthy',
        version: '1.0.0',
        timestamp: '2024-01-15T10:00:00Z',
        checks: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await getHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/health'),
        expect.any(Object)
      );
      expect(result.status).toBe('healthy');
    });
  });
});

describe('API Client - Admin', () => {
  describe('refreshData', () => {
    it('triggers data refresh', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Data refreshed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await refreshData();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/refresh'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.status).toBe('success');
    });
  });
});

describe('API Client - Connection Check', () => {
  describe('checkApiConnection', () => {
    it('returns true when API is available', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await checkApiConnection();

      expect(result).toBe(true);
    });

    it('returns false when API is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkApiConnection();

      expect(result).toBe(false);
    });

    it('returns false on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const result = await checkApiConnection();

      expect(result).toBe(false);
    });
  });
});

describe('API Client - Error Handling', () => {
  it('throws ApiError with status code on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    });

    try {
      await getSite('nonexistent');
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.name).toBe('ApiError');
      expect(error.status).toBe(404);
    }
  });

  it('throws ApiError on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    try {
      await getSites();
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.name).toBe('ApiError');
      expect(error.status).toBe(0);
    }
  });
});
