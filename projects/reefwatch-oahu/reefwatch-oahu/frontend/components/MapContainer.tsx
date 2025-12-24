'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
// This is required because mapbox-gl uses browser APIs (window, document, WebGL)
const MapContainerInner = dynamic(
  () => import('./MapContainerInner').then((mod) => mod.MapContainerInner),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[500px] lg:h-[calc(100vh-200px)] min-h-[400px]">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-3 z-10">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bleaching Risk
          </h4>
          <div className="space-y-1">
            {[
              { label: 'Low', color: '#22c55e' },
              { label: 'Moderate', color: '#eab308' },
              { label: 'High', color: '#f97316' },
              { label: 'Severe', color: '#ef4444' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

export function MapContainer() {
  return <MapContainerInner />;
}
