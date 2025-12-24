/**
 * Tests for Zustand store.
 */

import { act } from 'react';
import {
  useAppStore,
  selectHighRiskSites,
  selectSiteById,
  selectActiveAlerts,
  selectBleachingAlerts,
} from '@/lib/store';
import type { SiteWithConditions, Alert } from '@/types';

// Reset store before each test
beforeEach(() => {
  const { getState } = useAppStore;
  act(() => {
    getState().setSites([]);
    getState().setAlerts([]);
    getState().selectSite(null);
    getState().setLoading(false);
    getState().setError(null);
    getState().setChatOpen(false);
    getState().setSidebarOpen(false);
    getState().clearChat();
    getState().resetMapView();
  });
});

const mockSite: SiteWithConditions = {
  id: 'test-site',
  name: 'Test Site',
  coordinates: { latitude: 21.5, longitude: -157.9 },
  type: 'beach',
  description: 'A test site',
  facilities: [],
  best_conditions: 'Morning',
  difficulty: 'beginner',
  conditions: {
    sst: 26.5,
    sst_anomaly: 0.3,
    hotspot: 0.5,
    dhw: 2.1,
    temperature_trend: 'stable',
  },
  risk: {
    level: 'Low',
    color: 'green',
    score: 0,
    description: 'Normal conditions',
  },
  last_updated: '2024-01-15T10:00:00Z',
};

const mockHighRiskSite: SiteWithConditions = {
  ...mockSite,
  id: 'high-risk-site',
  name: 'High Risk Site',
  risk: {
    level: 'High',
    color: 'orange',
    score: 2,
    description: 'Elevated risk',
  },
};

const mockAlert: Alert = {
  id: 'alert-1',
  type: 'bleaching',
  severity: 'warning',
  title: 'Test Alert',
  description: 'Test alert description',
  affected_sites: ['test-site'],
  created_at: '2024-01-15T10:00:00Z',
  expires_at: null,
  is_active: true,
};

describe('AppStore - Data Actions', () => {
  describe('setSites', () => {
    it('sets sites array', () => {
      act(() => {
        useAppStore.getState().setSites([mockSite]);
      });

      expect(useAppStore.getState().sites).toHaveLength(1);
      expect(useAppStore.getState().sites[0].id).toBe('test-site');
    });
  });

  describe('setAlerts', () => {
    it('sets alerts array', () => {
      act(() => {
        useAppStore.getState().setAlerts([mockAlert]);
      });

      expect(useAppStore.getState().alerts).toHaveLength(1);
      expect(useAppStore.getState().alerts[0].id).toBe('alert-1');
    });
  });

  describe('selectSite', () => {
    it('selects a site and opens sidebar', () => {
      act(() => {
        useAppStore.getState().selectSite(mockSite);
      });

      expect(useAppStore.getState().selectedSite?.site.id).toBe('test-site');
      expect(useAppStore.getState().sidebarOpen).toBe(true);
    });

    it('clears selection when null', () => {
      act(() => {
        useAppStore.getState().selectSite(mockSite);
        useAppStore.getState().selectSite(null);
      });

      expect(useAppStore.getState().selectedSite).toBeNull();
    });
  });

  describe('setSiteHistory', () => {
    it('sets history for selected site', () => {
      const history = [{ date: '2024-01-15', sst: 26.5, sst_anomaly: 0.3, dhw: 2.1, risk_level: 'Low' as const }];

      act(() => {
        useAppStore.getState().selectSite(mockSite);
        useAppStore.getState().setSiteHistory(history);
      });

      expect(useAppStore.getState().selectedSite?.history).toEqual(history);
    });

    it('does nothing if no site selected', () => {
      const history = [{ date: '2024-01-15', sst: 26.5, sst_anomaly: 0.3, dhw: 2.1, risk_level: 'Low' as const }];

      act(() => {
        useAppStore.getState().setSiteHistory(history);
      });

      expect(useAppStore.getState().selectedSite).toBeNull();
    });
  });

  describe('setSiteForecast', () => {
    it('sets forecast for selected site', () => {
      const forecast = [{
        date: '2024-01-16',
        predicted_sst: 26.8,
        predicted_dhw: 2.3,
        predicted_risk: 'Low' as const,
        confidence: 0.9,
      }];

      act(() => {
        useAppStore.getState().selectSite(mockSite);
        useAppStore.getState().setSiteForecast(forecast);
      });

      expect(useAppStore.getState().selectedSite?.forecast).toEqual(forecast);
    });
  });

  describe('setDataDate and setLastUpdated', () => {
    it('sets data date', () => {
      act(() => {
        useAppStore.getState().setDataDate('2024-01-15');
      });

      expect(useAppStore.getState().dataDate).toBe('2024-01-15');
    });

    it('sets last updated timestamp', () => {
      const timestamp = '2024-01-15T10:00:00Z';
      act(() => {
        useAppStore.getState().setLastUpdated(timestamp);
      });

      expect(useAppStore.getState().lastUpdated).toBe(timestamp);
    });
  });
});

describe('AppStore - UI Actions', () => {
  describe('setLoading', () => {
    it('sets loading state', () => {
      act(() => {
        useAppStore.getState().setLoading(true);
      });
      expect(useAppStore.getState().isLoading).toBe(true);

      act(() => {
        useAppStore.getState().setLoading(false);
      });
      expect(useAppStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      act(() => {
        useAppStore.getState().setError('Something went wrong');
      });
      expect(useAppStore.getState().error).toBe('Something went wrong');

      act(() => {
        useAppStore.getState().setError(null);
      });
      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe('toggleDarkMode', () => {
    it('toggles dark mode', () => {
      const initial = useAppStore.getState().darkMode;

      act(() => {
        useAppStore.getState().toggleDarkMode();
      });
      expect(useAppStore.getState().darkMode).toBe(!initial);

      act(() => {
        useAppStore.getState().toggleDarkMode();
      });
      expect(useAppStore.getState().darkMode).toBe(initial);
    });
  });

  describe('setDarkMode', () => {
    it('sets dark mode directly', () => {
      act(() => {
        useAppStore.getState().setDarkMode(true);
      });
      expect(useAppStore.getState().darkMode).toBe(true);

      act(() => {
        useAppStore.getState().setDarkMode(false);
      });
      expect(useAppStore.getState().darkMode).toBe(false);
    });
  });

  describe('toggleChat and setChatOpen', () => {
    it('toggles chat', () => {
      act(() => {
        useAppStore.getState().toggleChat();
      });
      expect(useAppStore.getState().chatOpen).toBe(true);

      act(() => {
        useAppStore.getState().toggleChat();
      });
      expect(useAppStore.getState().chatOpen).toBe(false);
    });

    it('sets chat open directly', () => {
      act(() => {
        useAppStore.getState().setChatOpen(true);
      });
      expect(useAppStore.getState().chatOpen).toBe(true);
    });
  });

  describe('toggleSidebar and setSidebarOpen', () => {
    it('toggles sidebar', () => {
      act(() => {
        useAppStore.getState().toggleSidebar();
      });
      expect(useAppStore.getState().sidebarOpen).toBe(true);

      act(() => {
        useAppStore.getState().toggleSidebar();
      });
      expect(useAppStore.getState().sidebarOpen).toBe(false);
    });

    it('sets sidebar open directly', () => {
      act(() => {
        useAppStore.getState().setSidebarOpen(true);
      });
      expect(useAppStore.getState().sidebarOpen).toBe(true);
    });
  });
});

describe('AppStore - Chat Actions', () => {
  describe('addChatMessage', () => {
    it('adds a message to chat history', () => {
      const message = { role: 'user' as const, content: 'Hello' };

      act(() => {
        useAppStore.getState().addChatMessage(message);
      });

      expect(useAppStore.getState().chatMessages).toHaveLength(1);
      expect(useAppStore.getState().chatMessages[0].content).toBe('Hello');
    });

    it('appends multiple messages', () => {
      act(() => {
        useAppStore.getState().addChatMessage({ role: 'user', content: 'Hello' });
        useAppStore.getState().addChatMessage({ role: 'assistant', content: 'Hi there!' });
      });

      expect(useAppStore.getState().chatMessages).toHaveLength(2);
    });
  });

  describe('setChatSessionId', () => {
    it('sets session ID', () => {
      act(() => {
        useAppStore.getState().setChatSessionId('session-123');
      });

      expect(useAppStore.getState().chatSessionId).toBe('session-123');
    });
  });

  describe('clearChat', () => {
    it('clears chat history and session', () => {
      act(() => {
        useAppStore.getState().addChatMessage({ role: 'user', content: 'Hello' });
        useAppStore.getState().setChatSessionId('session-123');
        useAppStore.getState().clearChat();
      });

      expect(useAppStore.getState().chatMessages).toHaveLength(0);
      expect(useAppStore.getState().chatSessionId).toBeNull();
    });
  });

  describe('setChatLoading', () => {
    it('sets chat loading state', () => {
      act(() => {
        useAppStore.getState().setChatLoading(true);
      });
      expect(useAppStore.getState().isChatLoading).toBe(true);
    });
  });
});

describe('AppStore - Map Actions', () => {
  describe('setMapViewState', () => {
    it('updates map view state partially', () => {
      act(() => {
        useAppStore.getState().setMapViewState({ zoom: 12 });
      });

      expect(useAppStore.getState().mapViewState.zoom).toBe(12);
    });
  });

  describe('flyToSite', () => {
    it('centers map on site', () => {
      act(() => {
        useAppStore.getState().flyToSite(mockSite);
      });

      const state = useAppStore.getState().mapViewState;
      expect(state.latitude).toBe(mockSite.coordinates.latitude);
      expect(state.longitude).toBe(mockSite.coordinates.longitude);
      expect(state.zoom).toBe(13);
    });
  });

  describe('resetMapView', () => {
    it('resets to default Oahu view', () => {
      act(() => {
        useAppStore.getState().flyToSite(mockSite);
        useAppStore.getState().resetMapView();
      });

      const state = useAppStore.getState().mapViewState;
      expect(state.latitude).toBe(21.5);
      expect(state.longitude).toBe(-157.9);
      expect(state.zoom).toBe(9);
    });
  });
});

describe('AppStore - Selectors', () => {
  describe('selectHighRiskSites', () => {
    it('returns only high risk sites', () => {
      act(() => {
        useAppStore.getState().setSites([mockSite, mockHighRiskSite]);
      });

      const state = useAppStore.getState();
      const highRisk = selectHighRiskSites(state);

      expect(highRisk).toHaveLength(1);
      expect(highRisk[0].id).toBe('high-risk-site');
    });
  });

  describe('selectSiteById', () => {
    it('returns site by ID', () => {
      act(() => {
        useAppStore.getState().setSites([mockSite, mockHighRiskSite]);
      });

      const state = useAppStore.getState();
      const site = selectSiteById('test-site')(state);

      expect(site?.id).toBe('test-site');
    });

    it('returns undefined for nonexistent site', () => {
      act(() => {
        useAppStore.getState().setSites([mockSite]);
      });

      const state = useAppStore.getState();
      const site = selectSiteById('nonexistent')(state);

      expect(site).toBeUndefined();
    });
  });

  describe('selectActiveAlerts', () => {
    it('returns only active alerts', () => {
      const inactiveAlert = { ...mockAlert, id: 'inactive', is_active: false };

      act(() => {
        useAppStore.getState().setAlerts([mockAlert, inactiveAlert]);
      });

      const state = useAppStore.getState();
      const active = selectActiveAlerts(state);

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('alert-1');
    });
  });

  describe('selectBleachingAlerts', () => {
    it('returns only active bleaching alerts', () => {
      const weatherAlert: Alert = {
        ...mockAlert,
        id: 'weather',
        type: 'weather',
      };

      act(() => {
        useAppStore.getState().setAlerts([mockAlert, weatherAlert]);
      });

      const state = useAppStore.getState();
      const bleaching = selectBleachingAlerts(state);

      expect(bleaching).toHaveLength(1);
      expect(bleaching[0].type).toBe('bleaching');
    });
  });
});
