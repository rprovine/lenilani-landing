import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReefWatch Oahu | Coral Reef Monitoring Dashboard',
  description:
    'Real-time ocean conditions and coral bleaching risk monitoring for Oahu dive and snorkel sites. Powered by NOAA Coral Reef Watch data.',
  keywords: [
    'coral reef',
    'oahu',
    'hawaii',
    'snorkeling',
    'diving',
    'ocean conditions',
    'coral bleaching',
    'sea temperature',
  ],
  authors: [{ name: 'ReefWatch Oahu' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c4a6e' },
  ],
  openGraph: {
    title: 'ReefWatch Oahu',
    description: 'Real-time coral reef monitoring for Oahu',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100 dark:from-ocean-950 dark:to-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
