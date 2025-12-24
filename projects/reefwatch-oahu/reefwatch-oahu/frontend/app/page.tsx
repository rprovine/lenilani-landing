'use client';

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { AlertBanner } from '@/components/AlertBanner';
import { MapContainer } from '@/components/MapContainer';
import { SiteSidebar } from '@/components/SiteSidebar';
import { ChartsSection } from '@/components/ChartsSection';
import { ChatWidget } from '@/components/ChatWidget';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppInit } from '@/hooks/useOceanData';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { isLoading, error } = useAppInit();
  const { sidebarOpen, setDarkMode } = useAppStore();

  // Initialize theme on client
  useEffect(() => {
    const stored = localStorage.getItem('reefwatch-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.darkMode) {
          setDarkMode(true);
        }
      } catch {
        // Ignore
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Unable to Load Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Alert Banner */}
        <AlertBanner />

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row relative">
          {/* Map Section */}
          <div
            className={`flex-1 relative transition-all duration-300 ${
              sidebarOpen ? 'lg:mr-96' : ''
            }`}
          >
            <MapContainer />
          </div>

          {/* Site Sidebar */}
          <SiteSidebar />
        </main>

        {/* Charts Section */}
        <ChartsSection />

        {/* Chat Widget */}
        <ChatWidget />

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}
      </div>
    </ErrorBoundary>
  );
}
