import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrovaCarburante — Trova il distributore più economico vicino a te',
  description: 'Prezzi benzina e diesel aggiornati ogni giorno dal MISE. Trova il distributore più economico vicino a te in Italia.',
  verification: {
    google: 'X_uIYJIrw1j4R27GcUt-_X_HBwDs1l2wsP7FARVdEeI',
  },
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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PLZ3G5B8');`
        }} />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <noscript dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PLZ3G5B8" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
        }} />
        {children}
      </body>
    </html>
  );
}
