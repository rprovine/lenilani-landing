'use client';

import { X, MapPin, Thermometer, Waves, TrendingUp, Clock, Star } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  formatTemperature,
  formatDHW,
  getDHWDescription,
  getSiteTypeIcon,
  getDifficultyDisplay,
  getTrendArrow,
  formatDate,
} from '@/lib/utils';
import { getRiskColorClass } from '@/types';
import { SiteHistoryChart } from '@/components/charts/SiteHistoryChart';
import { SiteForecastChart } from '@/components/charts/SiteForecastChart';

export function SiteSidebar() {
  const { selectedSite, sidebarOpen, setSidebarOpen, selectSite } = useAppStore();

  if (!sidebarOpen || !selectedSite) {
    return null;
  }

  const { site, history, forecast } = selectedSite;
  const difficulty = getDifficultyDisplay(site.difficulty);

  return (
    <div className="fixed lg:absolute right-0 top-0 bottom-0 w-full lg:w-96 bg-white dark:bg-gray-900 shadow-xl z-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getSiteTypeIcon(site.type)}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {site.name}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>
                  {site.coordinates.latitude.toFixed(4)},{' '}
                  {site.coordinates.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSidebarOpen(false);
              selectSite(null);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Risk Status */}
        <div
          className={`p-4 rounded-lg ${getRiskColorClass(site.risk.level)} bg-opacity-10`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Bleaching Risk
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskColorClass(
                site.risk.level
              )}`}
            >
              {site.risk.level}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {site.risk.description}
          </p>
        </div>

        {/* Current Conditions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Thermometer className="w-4 h-4 mr-2" />
            Current Conditions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ConditionCard
              label="Sea Surface Temp"
              value={formatTemperature(site.conditions?.sst || null)}
              trend={site.conditions?.temperature_trend}
              icon={<Thermometer className="w-4 h-4" />}
            />
            <ConditionCard
              label="SST Anomaly"
              value={
                site.conditions?.sst_anomaly
                  ? `${site.conditions.sst_anomaly > 0 ? '+' : ''}${site.conditions.sst_anomaly.toFixed(1)}°C`
                  : 'N/A'
              }
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <ConditionCard
              label="DHW"
              value={formatDHW(site.conditions?.dhw || null)}
              description={getDHWDescription(site.conditions?.dhw || null)}
              icon={<Waves className="w-4 h-4" />}
            />
            <ConditionCard
              label="HotSpot"
              value={
                site.conditions?.hotspot?.toFixed(1) || 'N/A'
              }
              icon={<Star className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Historical Chart */}
        {history && history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              30-Day Temperature Trend
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <SiteHistoryChart data={history} />
            </div>
          </div>
        )}

        {/* Forecast Chart */}
        {forecast && forecast.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              7-Day Forecast
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <SiteForecastChart data={forecast} />
            </div>
          </div>
        )}

        {/* Site Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Site Information
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Description:</span>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {site.description}
              </p>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
              <span className={difficulty.color}>{difficulty.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Best Conditions:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {site.best_conditions}
              </span>
            </div>
            {site.facilities.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Facilities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {site.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400"
                    >
                      {facility.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Best Time to Visit */}
        <div className="bg-ocean-50 dark:bg-ocean-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-ocean-800 dark:text-ocean-200 mb-2">
            Best Time to Visit
          </h3>
          <p className="text-sm text-ocean-700 dark:text-ocean-300">
            {site.risk.score <= 1
              ? `Current conditions are ${site.risk.level.toLowerCase()}. ${site.best_conditions} for optimal visibility and safety.`
              : `Consider waiting for conditions to improve. Monitor the forecast and check back later.`}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ConditionCardProps {
  label: string;
  value: string;
  trend?: string | null;
  description?: string;
  icon: React.ReactNode;
}

function ConditionCard({ label, value, trend, description, icon }: ConditionCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-1">
        {icon}
        <span className="ml-1">{label}</span>
      </div>
      <div className="flex items-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <span className="ml-1 text-sm">{getTrendArrow(trend)}</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
