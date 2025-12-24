/**
 * Utility functions for ReefWatch Oahu frontend.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d');
  } catch {
    return dateString;
  }
}

// Temperature formatting

export function formatTemperature(temp: number | null, unit: 'C' | 'F' = 'C'): string {
  if (temp === null || temp === undefined) return 'N/A';

  if (unit === 'F') {
    const fahrenheit = (temp * 9/5) + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }

  return `${temp.toFixed(1)}°C`;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

// DHW formatting

export function formatDHW(dhw: number | null): string {
  if (dhw === null || dhw === undefined) return 'N/A';
  return `${dhw.toFixed(1)} °C-weeks`;
}

export function getDHWDescription(dhw: number | null): string {
  if (dhw === null || dhw === undefined) return 'Unknown';

  if (dhw < 4) {
    return 'Normal thermal conditions';
  } else if (dhw < 8) {
    return 'Elevated heat stress';
  } else if (dhw < 12) {
    return 'Significant thermal stress';
  } else {
    return 'Extreme heat stress';
  }
}

// Risk level utilities

export function getRiskGradient(riskScore: number): string {
  const gradients: Record<number, string> = {
    0: 'from-green-500 to-green-600',
    1: 'from-yellow-400 to-yellow-500',
    2: 'from-orange-500 to-orange-600',
    3: 'from-red-500 to-red-600',
    [-1]: 'from-gray-400 to-gray-500',
  };
  return gradients[riskScore] || gradients[-1];
}

export function getRiskIcon(riskScore: number): string {
  const icons: Record<number, string> = {
    0: '✅',
    1: '⚠️',
    2: '🔶',
    3: '🔴',
    [-1]: '❓',
  };
  return icons[riskScore] || icons[-1];
}

// Map utilities

export function calculateBounds(
  coordinates: Array<{ lat: number; lon: number }>
): [[number, number], [number, number]] {
  if (coordinates.length === 0) {
    // Default to Oahu bounds
    return [[-158.3, 21.2], [-157.6, 21.7]];
  }

  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const coord of coordinates) {
    minLon = Math.min(minLon, coord.lon);
    maxLon = Math.max(maxLon, coord.lon);
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
  }

  // Add padding
  const lonPad = (maxLon - minLon) * 0.1;
  const latPad = (maxLat - minLat) * 0.1;

  return [
    [minLon - lonPad, minLat - latPad],
    [maxLon + lonPad, maxLat + latPad],
  ];
}

// Marker color based on risk
export function getMarkerColor(riskScore: number): string {
  const colors: Record<number, string> = {
    0: '#22c55e', // green
    1: '#eab308', // yellow
    2: '#f97316', // orange
    3: '#ef4444', // red
    [-1]: '#6b7280', // gray
  };
  return colors[riskScore] || colors[-1];
}

// Site type icons
export function getSiteTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    bay: '🏖️',
    beach: '🏝️',
    cove: '🪨',
    reef: '🐠',
    lagoon: '🌊',
    harbor: '⚓',
  };
  return icons[type] || '📍';
}

// Difficulty level display
export function getDifficultyDisplay(difficulty: string): { label: string; color: string } {
  const displays: Record<string, { label: string; color: string }> = {
    beginner: { label: 'Beginner', color: 'text-green-600' },
    intermediate: { label: 'Intermediate', color: 'text-yellow-600' },
    advanced: { label: 'Advanced', color: 'text-red-600' },
    all_levels: { label: 'All Levels', color: 'text-blue-600' },
  };
  return displays[difficulty] || { label: difficulty, color: 'text-gray-600' };
}

// Trend arrow
export function getTrendArrow(trend: string | null): string {
  if (!trend) return '';
  const arrows: Record<string, string> = {
    rising: '↗️',
    falling: '↘️',
    stable: '➡️',
  };
  return arrows[trend] || '';
}

// Local storage helpers
export function getStoredTheme(): 'dark' | 'light' | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme') as 'dark' | 'light' | null;
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
}

// Debounce utility
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
