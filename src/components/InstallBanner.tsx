'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);

  useEffect(() => {
    const isIosBrowser = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (isIosBrowser) {
      const dismissed = sessionStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setIsIos(true);
        setTimeout(() => setIosVisible(true), 3000);
      }
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa-dismissed');
      if (!dismissed) setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    (window as Window & { dataLayer?: object[] }).dataLayer = (window as Window & { dataLayer?: object[] }).dataLayer || [];
    (window as Window & { dataLayer?: object[] }).dataLayer!.push({ event: 'pwa_install_click' });
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      (window as Window & { dataLayer?: object[] }).dataLayer!.push({ event: 'pwa_installed' });
      setVisible(false);
    } else {
      sessionStorage.setItem('pwa-dismissed', '1');
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1');
    setVisible(false);
  };

  const handleIosDismiss = () => {
    sessionStorage.setItem('pwa-ios-dismissed', '1');
    setIosVisible(false);
  };

  if (isIos && iosVisible) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: 'white', borderTop: '1px solid #e5e7eb',
        padding: '16px 20px 28px', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <img src="/icon-192.png" alt="" width={40} height={40} style={{ borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Aggiungi alla schermata Home</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
              Tocca <strong>Condividi</strong> <span style={{ fontSize: 15 }}>⬆️</span> poi <strong>"Aggiungi a schermata Home"</strong> per accedere velocemente ai prezzi.
            </div>
          </div>
          <button onClick={handleIosDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 1000,
      background: 'white', borderRadius: 16, padding: '16px 16px 16px 16px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 0.3s ease',
    }}>
      <img src="/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>TrovaCarburante</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Installa per avere sempre il monitoraggio dei prezzi</div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 10,
          padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}
      >
        Installa
      </button>
      <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✕</button>
    </div>
  );
}
