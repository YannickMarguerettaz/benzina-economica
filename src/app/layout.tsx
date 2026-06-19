import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrovaCarburante — Trova il distributore più economico vicino a te',
  description: 'Prezzi benzina e diesel aggiornati ogni giorno dal MISE. Trova il distributore più economico vicino a te in Italia.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TrovaCarburante',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a6b3a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
