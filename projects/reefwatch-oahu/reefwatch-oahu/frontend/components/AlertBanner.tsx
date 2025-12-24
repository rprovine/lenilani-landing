'use client';

import { useState } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Alert } from '@/types';
import { cn } from '@/lib/utils';

function AlertItem({ alert }: { alert: Alert }) {
  const severityStyles = {
    watch: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    warning: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
    alert: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  };

  const iconStyles = {
    watch: 'text-yellow-500',
    warning: 'text-orange-500',
    alert: 'text-red-500',
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-3 rounded-lg border',
        severityStyles[alert.severity]
      )}
    >
      <AlertTriangle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[alert.severity])} />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{alert.title}</p>
        <p className="text-sm opacity-80 mt-1">{alert.description}</p>
        {alert.affected_sites.length > 0 && (
          <p className="text-xs opacity-60 mt-1">
            Affected sites: {alert.affected_sites.length}
          </p>
        )}
      </div>
    </div>
  );
}

export function AlertBanner() {
  const { alerts } = useAppStore();
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const activeAlerts = alerts.filter((a) => a.is_active);

  if (activeAlerts.length === 0 || dismissed) {
    return null;
  }

  // Show only the most severe alert when collapsed
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    const order = { alert: 0, warning: 1, watch: 2 };
    return order[a.severity] - order[b.severity];
  });

  const primaryAlert = sortedAlerts[0];
  const hasMultiple = sortedAlerts.length > 1;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {expanded ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Alerts ({activeAlerts.length})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Collapse alerts"
                >
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Dismiss alerts"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            {sortedAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle
                className={cn('w-5 h-5', {
                  'text-red-500': primaryAlert.severity === 'alert',
                  'text-orange-500': primaryAlert.severity === 'warning',
                  'text-yellow-500': primaryAlert.severity === 'watch',
                })}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {primaryAlert.title}
                {hasMultiple && ` (+${sortedAlerts.length - 1} more)`}
              </span>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center text-sm text-ocean-600 hover:text-ocean-700"
            >
              View all
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
