/**
 * Zustand store for ReefWatch Oahu application state.
 *
 * Manages global state for sites, alerts, selected site,
 * UI state, and map view.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  SiteWithConditions,
  Alert,
  HistoricalDataPoint,
  ForecastDataPoint,
  ChatMessage,
  MapViewState,
} from '@/types';

interface SelectedSite {
  site: SiteWithConditions;
  history?: HistoricalDataPoint[];
  forecast?: ForecastDataPoint[];
}

interface AppStore {
  // Data
  sites: SiteWithConditions[];
  alerts: Alert[];
  selectedSite: SelectedSite | null;
  dataDate: string | null;
  lastUpdated: string | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  darkMode: boolean;
  chatOpen: boolean;
  sidebarOpen: boolean;

  // Chat
  chatMessages: ChatMessage[];
  chatSessionId: string | null;
  isChatLoading: boolean;

  // Map
  mapViewState: MapViewState;

  // Actions - Data
  setSites: (sites: SiteWithConditions[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  selectSite: (site: SiteWithConditions | null) => void;
  setSiteHistory: (history: HistoricalDataPoint[]) => void;
  setSiteForecast: (forecast: ForecastDataPoint[]) => void;
  setDataDate: (date: string) => void;
  setLastUpdated: (timestamp: string) => void;

  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Actions - Chat
  addChatMessage: (message: ChatMessage) => void;
  setChatSessionId: (id: string) => void;
  clearChat: () => void;
  setChatLoading: (loading: boolean) => void;

  // Actions - Map
  setMapViewState: (state: Partial<MapViewState>) => void;
  flyToSite: (site: SiteWithConditions) => void;
  resetMapView: () => void;
}

// Default map view centered on Oahu
const DEFAULT_MAP_VIEW: MapViewState = {
  longitude: -157.9,
  latitude: 21.5,
  zoom: 9,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial Data State
      sites: [],
      alerts: [],
      selectedSite: null,
      dataDate: null,
      lastUpdated: null,

      // Initial UI State
      isLoading: false,
      error: null,
      darkMode: false,
      chatOpen: false,
      sidebarOpen: false,

      // Initial Chat State
      chatMessages: [],
      chatSessionId: null,
      isChatLoading: false,

      // Initial Map State
      mapViewState: DEFAULT_MAP_VIEW,

      // Data Actions
      setSites: (sites) => set({ sites }),

      setAlerts: (alerts) => set({ alerts }),

      selectSite: (site) => {
        if (site) {
          set({
            selectedSite: { site },
            sidebarOpen: true,
          });
        } else {
          set({ selectedSite: null });
        }
      },

      setSiteHistory: (history) => {
        const current = get().selectedSite;
        if (current) {
          set({
            selectedSite: { ...current, history },
          });
        }
      },

      setSiteForecast: (forecast) => {
        const current = get().selectedSite;
        if (current) {
          set({
            selectedSite: { ...current, forecast },
          });
        }
      },

      setDataDate: (date) => set({ dataDate: date }),

      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      toggleDarkMode: () => {
        const newMode = !get().darkMode;
        set({ darkMode: newMode });
        // Update document class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newMode);
        }
      },

      setDarkMode: (dark) => {
        set({ darkMode: dark });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', dark);
        }
      },

      toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

      setChatOpen: (open) => set({ chatOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Chat Actions
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      setChatSessionId: (id) => set({ chatSessionId: id }),

      clearChat: () =>
        set({
          chatMessages: [],
          chatSessionId: null,
        }),

      setChatLoading: (loading) => set({ isChatLoading: loading }),

      // Map Actions
      setMapViewState: (newState) =>
        set((state) => ({
          mapViewState: { ...state.mapViewState, ...newState },
        })),

      flyToSite: (site) =>
        set({
          mapViewState: {
            longitude: site.coordinates.longitude,
            latitude: site.coordinates.latitude,
            zoom: 13,
          },
        }),

      resetMapView: () => set({ mapViewState: DEFAULT_MAP_VIEW }),
    }),
    {
      name: 'reefwatch-storage',
      partialize: (state) => ({
        // Only persist these values
        darkMode: state.darkMode,
        chatSessionId: state.chatSessionId,
      }),
    }
  )
);

// Selectors for common derived state
export const selectHighRiskSites = (state: AppStore) =>
  state.sites.filter((s) => s.risk.score >= 2);

export const selectSiteById = (siteId: string) => (state: AppStore) =>
  state.sites.find((s) => s.id === siteId);

export const selectActiveAlerts = (state: AppStore) =>
  state.alerts.filter((a) => a.is_active);

export const selectBleachingAlerts = (state: AppStore) =>
  state.alerts.filter((a) => a.type === 'bleaching' && a.is_active);
