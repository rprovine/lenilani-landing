/**
 * Custom hooks for fetching and managing ocean data.
 */

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import * as api from '@/lib/api';

/**
 * Hook to fetch and manage current ocean conditions.
 */
export function useCurrentConditions() {
  const {
    sites,
    dataDate,
    lastUpdated,
    isLoading,
    error,
    setSites,
    setDataDate,
    setLastUpdated,
    setLoading,
    setError,
  } = useAppStore();

  const fetchConditions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getCurrentConditions();
      setSites(response.sites);
      setDataDate(response.data_date);
      setLastUpdated(response.updated_at);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setSites, setDataDate, setLastUpdated, setLoading, setError]);

  // Initial fetch
  useEffect(() => {
    if (sites.length === 0) {
      fetchConditions();
    }
  }, [sites.length, fetchConditions]);

  // Refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchConditions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchConditions]);

  return {
    sites,
    dataDate,
    lastUpdated,
    isLoading,
    error,
    refresh: fetchConditions,
  };
}

/**
 * Hook to fetch and manage alerts.
 */
export function useAlerts() {
  const { alerts, setAlerts, setError } = useAppStore();

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await api.getAlerts();
      setAlerts(response.alerts);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [setAlerts, setError]);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 10 minutes
    const interval = setInterval(fetchAlerts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    refresh: fetchAlerts,
  };
}

/**
 * Hook to fetch site history.
 */
export function useSiteHistory(siteId: string | null, days: number = 30) {
  const { selectedSite, setSiteHistory, setError } = useAppStore();

  const fetchHistory = useCallback(async () => {
    if (!siteId) return;

    try {
      const response = await api.getSiteHistory(siteId, days);
      setSiteHistory(response.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [siteId, days, setSiteHistory, setError]);

  useEffect(() => {
    if (siteId) {
      fetchHistory();
    }
  }, [siteId, fetchHistory]);

  return {
    history: selectedSite?.history || [],
    refresh: fetchHistory,
  };
}

/**
 * Hook to fetch site forecast.
 */
export function useSiteForecast(siteId: string | null, days: number = 7) {
  const { selectedSite, setSiteForecast, setError } = useAppStore();

  const fetchForecast = useCallback(async () => {
    if (!siteId) return;

    try {
      const response = await api.getSiteForecast(siteId, days);
      setSiteForecast(response.forecast);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [siteId, days, setSiteForecast, setError]);

  useEffect(() => {
    if (siteId) {
      fetchForecast();
    }
  }, [siteId, fetchForecast]);

  return {
    forecast: selectedSite?.forecast || [],
    refresh: fetchForecast,
  };
}

/**
 * Hook to manage selected site with full data.
 */
export function useSelectedSite() {
  const { selectedSite, selectSite, setSidebarOpen } = useAppStore();

  // Fetch history and forecast when site is selected
  useSiteHistory(selectedSite?.site.id || null);
  useSiteForecast(selectedSite?.site.id || null);

  const handleSelectSite = useCallback(
    (site: Parameters<typeof selectSite>[0]) => {
      selectSite(site);
      if (site) {
        setSidebarOpen(true);
      }
    },
    [selectSite, setSidebarOpen]
  );

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  return {
    selectedSite,
    selectSite: handleSelectSite,
    closeSidebar: handleCloseSidebar,
  };
}

/**
 * Hook for initializing the app with all data.
 */
export function useAppInit() {
  const { isLoading, error, setDarkMode } = useAppStore();

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('reefwatch-storage');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.state?.darkMode) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [setDarkMode]);

  // Load initial data
  useCurrentConditions();
  useAlerts();

  return { isLoading, error };
}
