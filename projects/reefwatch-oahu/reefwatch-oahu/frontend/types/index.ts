/**
 * TypeScript type definitions for ReefWatch Oahu frontend.
 * These types mirror the backend API schemas for type safety.
 */

// Enums

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Unknown';
export type RiskColor = 'green' | 'yellow' | 'orange' | 'red' | 'gray';
export type SiteType = 'bay' | 'beach' | 'cove' | 'reef' | 'lagoon' | 'harbor';
export type SiteDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type AlertSeverity = 'watch' | 'warning' | 'alert';
export type AlertType = 'bleaching' | 'weather' | 'water_quality';

// Core Types

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BleachingRisk {
  level: RiskLevel;
  color: RiskColor;
  score: number;
  description: string;
}

export interface OceanConditions {
  sst: number | null;
  sst_anomaly: number | null;
  hotspot: number | null;
  dhw: number | null;
  temperature_trend: 'rising' | 'falling' | 'stable' | null;
}

export interface Site {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: SiteType;
  description: string;
  facilities: string[];
  best_conditions: string;
  difficulty: SiteDifficulty;
}

export interface SiteWithConditions extends Site {
  conditions: OceanConditions | null;
  risk: BleachingRisk;
  last_updated: string | null;
}

// API Response Types

export interface SiteListResponse {
  sites: Site[];
  count: number;
}

export interface CurrentConditionsResponse {
  sites: SiteWithConditions[];
  data_date: string;
  updated_at: string;
}

export interface HistoricalDataPoint {
  date: string;
  sst: number | null;
  sst_anomaly: number | null;
  dhw: number | null;
  risk_level: RiskLevel | null;
}

export interface SiteHistoryResponse {
  site_id: string;
  site_name: string;
  data: HistoricalDataPoint[];
  period_start: string;
  period_end: string;
  statistics: {
    avg_sst?: number;
    max_sst?: number;
    min_sst?: number;
    avg_dhw?: number;
    max_dhw?: number;
    days_at_risk?: number;
    data_coverage?: number;
  };
}

export interface ForecastDataPoint {
  date: string;
  predicted_sst: number;
  predicted_dhw: number;
  predicted_risk: RiskLevel;
  confidence: number;
}

export interface SiteForecastResponse {
  site_id: string;
  site_name: string;
  forecast: ForecastDataPoint[];
  generated_at: string;
  model_version: string;
}

export interface ForecastResponse {
  forecasts: SiteForecastResponse[];
  generated_at: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  affected_sites: string[];
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface AlertsResponse {
  alerts: Alert[];
  count: number;
}

// Chat Types

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  include_context?: boolean;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  context_used: boolean;
  model: string;
}

// Health Check

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: Record<string, string>;
}

// UI State Types

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface SelectedSite {
  site: SiteWithConditions;
  history?: HistoricalDataPoint[];
  forecast?: ForecastDataPoint[];
}

export interface AppState {
  // Data
  sites: SiteWithConditions[];
  alerts: Alert[];
  selectedSite: SelectedSite | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  darkMode: boolean;
  chatOpen: boolean;
  sidebarOpen: boolean;

  // Map
  mapViewState: MapViewState;
}

// Helper function to get risk color class
export function getRiskColorClass(risk: RiskLevel): string {
  const colorMap: Record<RiskLevel, string> = {
    Low: 'bg-reef-low text-white',
    Moderate: 'bg-reef-moderate text-black',
    High: 'bg-reef-high text-white',
    Severe: 'bg-reef-severe text-white',
    Unknown: 'bg-reef-unknown text-white',
  };
  return colorMap[risk] || colorMap.Unknown;
}

export function getRiskBorderClass(risk: RiskLevel): string {
  const colorMap: Record<RiskLevel, string> = {
    Low: 'border-reef-low',
    Moderate: 'border-reef-moderate',
    High: 'border-reef-high',
    Severe: 'border-reef-severe',
    Unknown: 'border-reef-unknown',
  };
  return colorMap[risk] || colorMap.Unknown;
}
