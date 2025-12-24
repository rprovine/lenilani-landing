'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAppStore } from '@/lib/store';
import { getMarkerColor, formatTemperature, getSiteTypeIcon } from '@/lib/utils';
import type { SiteWithConditions } from '@/types';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export function MapContainerInner() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const { sites, mapViewState, selectedSite, selectSite, darkMode } =
    useAppStore();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (!token) {
      setMapError('Mapbox token not configured');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: darkMode
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/outdoors-v12',
        center: [mapViewState.longitude, mapViewState.latitude],
        zoom: mapViewState.zoom,
        pitch: 30,
        bearing: 0,
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        setMapLoaded(true);

        if (map.current) {
          map.current.addSource('temperature-heatmap', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });
        }
      });
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setMapError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      markers.current.forEach((m) => m.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style on dark mode change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setStyle(
      darkMode
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/outdoors-v12'
    );
  }, [darkMode, mapLoaded]);

  // Create marker element
  const createMarkerElement = useCallback(
    (site: SiteWithConditions, isSelected: boolean) => {
      const el = document.createElement('div');
      el.className = 'marker-container';

      const color = getMarkerColor(site.risk.score);
      const size = isSelected ? 40 : 32;
      const borderWidth = isSelected ? 4 : 2;

      el.innerHTML = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: ${borderWidth}px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          ${isSelected ? 'transform: scale(1.1);' : ''}
        ">
          <span style="font-size: ${isSelected ? 18 : 14}px;">
            ${getSiteTypeIcon(site.type)}
          </span>
        </div>
        ${
          isSelected
            ? `<div style="
              position: absolute;
              top: -8px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              color: ${color};
              padding: 2px 8px;
              border-radius: 10px;
              font-size: 10px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            ">${site.risk.level}</div>`
            : ''
        }
      `;

      el.onmouseenter = () => {
        el.firstElementChild?.setAttribute(
          'style',
          el.firstElementChild.getAttribute('style') + 'transform: scale(1.15);'
        );
      };
      el.onmouseleave = () => {
        el.firstElementChild?.setAttribute(
          'style',
          el.firstElementChild
            ?.getAttribute('style')
            ?.replace('transform: scale(1.15);', isSelected ? 'transform: scale(1.1);' : '') || ''
        );
      };

      return el;
    },
    []
  );

  // Create popup content
  const createPopupContent = useCallback((site: SiteWithConditions) => {
    const sst = site.conditions?.sst;
    const dhw = site.conditions?.dhw;

    return `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-lg">${getSiteTypeIcon(site.type)}</span>
          <h3 class="font-bold text-gray-900 dark:text-white">${site.name}</h3>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${site.description}</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">SST:</span>
            <span class="font-medium ml-1">${sst ? formatTemperature(sst) : 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">DHW:</span>
            <span class="font-medium ml-1">${dhw?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Risk Level:</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium" style="
              background: ${getMarkerColor(site.risk.score)}20;
              color: ${getMarkerColor(site.risk.score)};
            ">${site.risk.level}</span>
          </div>
        </div>
        <button
          class="w-full mt-3 px-3 py-1.5 bg-ocean-600 text-white text-sm rounded hover:bg-ocean-700 transition-colors"
          onclick="window.dispatchEvent(new CustomEvent('selectSite', { detail: '${site.id}' }))"
        >
          View Details
        </button>
      </div>
    `;
  }, []);

  // Add/update markers
  useEffect(() => {
    if (!map.current || !mapLoaded || sites.length === 0) return;

    markers.current.forEach((m) => m.remove());
    markers.current = [];

    sites.forEach((site) => {
      const isSelected = selectedSite?.site.id === site.id;
      const el = createMarkerElement(site, isSelected);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
      }).setHTML(createPopupContent(site));

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([site.coordinates.longitude, site.coordinates.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        selectSite(site);
      });

      markers.current.push(marker);
    });
  }, [sites, mapLoaded, selectedSite, selectSite, createMarkerElement, createPopupContent]);

  // Fly to selected site
  useEffect(() => {
    if (!map.current || !selectedSite) return;

    map.current.flyTo({
      center: [
        selectedSite.site.coordinates.longitude,
        selectedSite.site.coordinates.latitude,
      ],
      zoom: 13,
      duration: 1500,
    });
  }, [selectedSite]);

  // Listen for custom select site events
  useEffect(() => {
    const handleSelectSite = (e: CustomEvent) => {
      const siteId = e.detail;
      const site = sites.find((s) => s.id === siteId);
      if (site) {
        selectSite(site);
      }
    };

    window.addEventListener('selectSite', handleSelectSite as EventListener);
    return () => {
      window.removeEventListener('selectSite', handleSelectSite as EventListener);
    };
  }, [sites, selectSite]);

  return (
    <div className="relative h-[500px] lg:h-[calc(100vh-200px)] min-h-[400px]">
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

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

      {/* Error state */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-20">
          <div className="text-center p-4">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Map Error</p>
            <p className="text-sm text-red-500">{mapError}</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}

    </div>
  );
}
