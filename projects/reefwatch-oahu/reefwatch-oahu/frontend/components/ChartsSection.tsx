'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getMarkerColor, formatShortDate } from '@/lib/utils';

export function ChartsSection() {
  const [expanded, setExpanded] = useState(false);
  const { sites } = useAppStore();

  // Calculate risk distribution
  const riskDistribution = [
    { name: 'Low', value: sites.filter((s) => s.risk.score === 0).length, color: '#22c55e' },
    { name: 'Moderate', value: sites.filter((s) => s.risk.score === 1).length, color: '#eab308' },
    { name: 'High', value: sites.filter((s) => s.risk.score === 2).length, color: '#f97316' },
    { name: 'Severe', value: sites.filter((s) => s.risk.score === 3).length, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Get current conditions by site for bar chart
  const siteConditions = sites
    .filter((s) => s.conditions?.dhw !== null)
    .map((s) => ({
      name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
      fullName: s.name,
      dhw: s.conditions?.dhw || 0,
      sst: s.conditions?.sst || 0,
      anomaly: s.conditions?.sst_anomaly || 0,
      riskScore: s.risk.score,
    }))
    .sort((a, b) => b.dhw - a.dhw);

  // SST by site
  const sstData = sites
    .filter((s) => s.conditions?.sst !== null)
    .map((s) => ({
      name: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
      fullName: s.name,
      sst: s.conditions?.sst || 0,
      anomaly: s.conditions?.sst_anomaly || 0,
    }));

  return (
    <section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Toggle Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-ocean-600" />
          <span className="font-medium text-gray-900 dark:text-white">
            Ocean Conditions Overview
          </span>
          <span className="text-sm text-gray-500">
            ({sites.length} sites monitored)
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Charts Content */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Risk Distribution Pie Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Risk Distribution
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} sites`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center flex-wrap gap-2 mt-2">
              {riskDistribution.map((d) => (
                <div key={d.name} className="flex items-center text-xs">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DHW by Site Bar Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              DHW by Site
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={siteConditions.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 'auto']}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white p-2 rounded text-xs">
                            <p className="font-medium">{data.fullName}</p>
                            <p>DHW: {data.dhw?.toFixed(1)} °C-weeks</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="dhw" radius={[0, 4, 4, 0]}>
                    {siteConditions.slice(0, 8).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getMarkerColor(entry.riskScore)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Degree Heating Weeks (°C-weeks)
            </p>
          </div>

          {/* SST Comparison Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              SST & Anomaly by Site
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sstData}
                  margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 8 }}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white p-2 rounded text-xs">
                            <p className="font-medium">{data.fullName}</p>
                            <p>SST: {data.sst?.toFixed(1)}°C</p>
                            <p>
                              Anomaly: {data.anomaly > 0 ? '+' : ''}
                              {data.anomaly?.toFixed(1)}°C
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px' }}
                    iconSize={8}
                  />
                  <Bar
                    dataKey="sst"
                    name="SST (°C)"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
