import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prezzi carburante per provincia — TrovaCarburante',
  description: 'Confronta i prezzi di benzina, diesel, GPL e metano in tutte le 107 province italiane. Dati aggiornati ogni notte dal MISE.',
};

const CARBURANTI = [
  {
    slug: 'benzina',
    label: 'Benzina',
    desc: 'Prezzi medi della benzina in tutte le 107 province italiane',
    icon: '⛽',
  },
  {
    slug: 'diesel',
    label: 'Diesel',
    desc: 'Prezzi medi del diesel in tutte le 107 province italiane',
    icon: '🛢',
  },
  {
    slug: 'gpl',
    label: 'GPL',
    desc: 'Prezzi medi del GPL in tutte le province italiane',
    icon: '💨',
  },
  {
    slug: 'metano',
    label: 'Metano',
    desc: 'Prezzi medi del metano in tutte le province italiane',
    icon: '🔵',
  },
];

export default function PaginaProvinceHub() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'var(--text)', color: '#fff', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.2, marginBottom: 12 }}>
            Prezzi carburante per provincia
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 520, lineHeight: 1.6 }}>
            Scegli il tipo di carburante per confrontare i prezzi medi in tutte le 107 province italiane.
          </p>
        </div>
      </div>

      {/* Card carburanti */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {CARBURANTI.map((c) => (
            <Link key={c.slug} href={`/province/${c.slug}`} style={{ textDecoration: 'none' }}>
              <div className="station-card" style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '24px 20px', cursor: 'pointer', height: '100%',
              }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{c.desc}</div>
                <div style={{ marginTop: 20, fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                  Vedi prezzi →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
