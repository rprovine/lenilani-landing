'use client';

import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-ocean-200 dark:border-ocean-800 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-ocean-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Loading ocean data...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Fetching the latest conditions
        </p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} text-ocean-600 animate-spin`} />
  );
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
    </div>
  );
}
