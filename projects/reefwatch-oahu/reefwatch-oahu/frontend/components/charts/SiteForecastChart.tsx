'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatShortDate, getMarkerColor } from '@/lib/utils';
import type { ForecastDataPoint, RiskLevel } from '@/types';

interface SiteForecastChartProps {
  data: ForecastDataPoint[];
}

const riskToScore: Record<RiskLevel, number> = {
  Low: 0,
  Moderate: 1,
  High: 2,
  Severe: 3,
  Unknown: -1,
};

export function SiteForecastChart({ data }: SiteForecastChartProps) {
  const chartData = data.map((d) => ({
    date: formatShortDate(d.date),
    sst: d.predicted_sst,
    dhw: d.predicted_dhw,
    risk: d.predicted_risk,
    riskScore: riskToScore[d.predicted_risk],
    confidence: Math.round(d.confidence * 100),
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 'auto']}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#9CA3AF' }}
            formatter={(value: number, name: string) => {
              if (name === 'dhw') return [`${value?.toFixed(1)} °C-weeks`, 'DHW'];
              if (name === 'sst') return [`${value?.toFixed(1)}°C`, 'SST'];
              return [value, name];
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm">
                    <p className="font-medium mb-1">{label}</p>
                    <p>SST: {data.sst?.toFixed(1)}°C</p>
                    <p>DHW: {data.dhw?.toFixed(1)}</p>
                    <p>
                      Risk:{' '}
                      <span style={{ color: getMarkerColor(data.riskScore) }}>
                        {data.risk}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {data.confidence}% confidence
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="dhw" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getMarkerColor(entry.riskScore)}
                opacity={entry.confidence / 100}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-gray-500 mt-2">
        Predicted DHW (bar opacity = confidence level)
      </div>
    </div>
  );
}
