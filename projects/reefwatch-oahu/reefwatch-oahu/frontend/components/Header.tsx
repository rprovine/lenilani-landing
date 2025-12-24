'use client';

import { Sun, Moon, RefreshCw, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatRelativeTime } from '@/lib/utils';

export function Header() {
  const { darkMode, toggleDarkMode, lastUpdated, isLoading } = useAppStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🐠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ReefWatch Oahu
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Coral Reef Monitoring Dashboard
            </p>
          </div>
        </div>

        {/* Status and Controls */}
        <div className="flex items-center space-x-4">
          {/* Last Updated */}
          {lastUpdated && (
            <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
              <RefreshCw
                className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
              />
              Updated {formatRelativeTime(lastUpdated)}
            </div>
          )}

          {/* Data Source Info */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Data source information"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
