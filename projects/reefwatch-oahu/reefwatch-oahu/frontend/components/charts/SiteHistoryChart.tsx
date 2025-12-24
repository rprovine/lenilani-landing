'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatShortDate } from '@/lib/utils';
import type { HistoricalDataPoint } from '@/types';

interface SiteHistoryChartProps {
  data: HistoricalDataPoint[];
}

export function SiteHistoryChart({ data }: SiteHistoryChartProps) {
  // Transform data for chart
  const chartData = data.map((d) => ({
    date: formatShortDate(d.date),
    sst: d.sst,
    anomaly: d.sst_anomaly,
    dhw: d.dhw,
  }));

  // Calculate reference line (average)
  const avgSST =
    data.filter((d) => d.sst !== null).reduce((sum, d) => sum + (d.sst || 0), 0) /
    data.filter((d) => d.sst !== null).length;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            domain={['auto', 'auto']}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}°`}
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
              if (name === 'sst') return [`${value?.toFixed(1)}°C`, 'SST'];
              if (name === 'anomaly')
                return [
                  `${value > 0 ? '+' : ''}${value?.toFixed(1)}°C`,
                  'Anomaly',
                ];
              return [value?.toFixed(1), name];
            }}
          />
          <ReferenceLine
            y={avgSST}
            stroke="#6B7280"
            strokeDasharray="5 5"
            label={{
              value: 'Avg',
              position: 'right',
              fontSize: 10,
              fill: '#6B7280',
            }}
          />
          <Line
            type="monotone"
            dataKey="sst"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="anomaly"
            stroke="#f97316"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center space-x-4 text-xs text-gray-500 mt-2">
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-ocean-500 mr-1" />
          <span>SST</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-orange-500 mr-1 border-dashed" />
          <span>Anomaly</span>
        </div>
      </div>
    </div>
  );
}
