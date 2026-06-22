'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <img src="/icon-192.png" alt="TrovaCarburante" width={34} height={34} style={{ display: 'block' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px', color: 'var(--text)' }}>TrovaCarburante</span>
        </Link>
        {isHome ? (
          <Link href="/province" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            Prezzi per provincia →
          </Link>
        ) : (
          <Link href="/" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            Cerca carburante →
          </Link>
        )}
      </div>
    </header>
  );
}
