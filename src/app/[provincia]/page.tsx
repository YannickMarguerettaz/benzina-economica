import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import DistributoreCard from '@/components/DistributoreCard';
import { Distributore } from '@/lib/types';

interface Provincia {
  sigla: string;
  nome: string;
  slug: string;
  totale_distributori: number;
  media_benzina: number | null;
  media_diesel: number | null;
  min_benzina: number | null;
  min_diesel: number | null;
}

function getProvince(): Provincia[] {
  const path = join(process.cwd(), 'public', 'data', 'province.json');
  return JSON.parse(readFileSync(path, 'utf-8')).province;
}

function getDistributoriProvincia(sigla: string): Distributore[] {
  const path = join(process.cwd(), 'public', 'data', 'distributori.json');
  const tutti: Distributore[] = JSON.parse(readFileSync(path, 'utf-8')).distributori;
  return tutti.filter(
    (d) => d.provincia.toUpperCase() === sigla.toUpperCase() && d.prezzi.benzina
  );
}

export async function generateStaticParams() {
  const province = getProvince();
  return province.map((p) => ({ provincia: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ provincia: string }>;
}): Promise<Metadata> {
  const { provincia: slug } = await params;
  const province = getProvince();
  const prov = province.find((p) => p.slug === slug);
  if (!prov) return {};
  return {
    title: `Prezzi benzina ${prov.nome} — Distributori più economici aggiornati`,
    description: `Prezzi benzina e diesel a ${prov.nome} aggiornati ogni notte. Prezzo minimo benzina: ${prov.min_benzina?.toFixed(3) ?? 'N/D'}€/L. Confronta ${prov.totale_distributori} distributori e trova il più economico vicino a te.`,
  };
}

export default async function PaginaProvincia({
  params,
}: {
  params: Promise<{ provincia: string }>;
}) {
  const { provincia: slug } = await params;
  const province = getProvince();
  const prov = province.find((p) => p.slug === slug);
  if (!prov) notFound();

  const distributori = getDistributoriProvincia(prov.sigla);
  const ordinati = [...distributori]
    .sort((a, b) => (a.prezzi.benzina ?? 99) - (b.prezzi.benzina ?? 99))
    .slice(0, 20);

  const risparmio = prov.min_benzina && prov.media_benzina
    ? ((prov.media_benzina - prov.min_benzina) * 50).toFixed(1)
    : null;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/icon-192.png" alt="TrovaCarburante" width={34} height={34} style={{ display: 'block' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px', color: 'var(--text)' }}>TrovaCarburante</span>
          </Link>
          <Link href="/province" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            Tutte le province →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'var(--text)', color: '#fff', padding: '48px 32px 56px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/province" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Province</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{prov.nome}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Prezzi benzina a {prov.nome}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 36, lineHeight: 1.6 }}>
            {prov.totale_distributori} distributori monitorati · dati aggiornati ogni notte dal MISE
          </p>

          {/* Stat bar */}
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28 }}>
            {[
              { label: 'min benzina', value: prov.min_benzina ? `${prov.min_benzina.toFixed(3)}€` : '—', highlight: true },
              { label: 'media benzina', value: prov.media_benzina ? `${prov.media_benzina.toFixed(3)}€` : '—' },
              { label: 'min diesel', value: prov.min_diesel ? `${prov.min_diesel.toFixed(3)}€` : '—' },
              { label: 'risparmio per pieno', value: risparmio ? `~${risparmio}€` : '—' },
            ].map((s, i) => (
              <div key={i} style={{
                paddingRight: 40,
                marginRight: 40,
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                marginBottom: 8,
              }}>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 28,
                  fontWeight: 600,
                  color: s.highlight ? '#4ade80' : '#fff',
                  lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* CTA cerca vicino */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              Vuoi trovare il distributore più vicino a te?
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Usa la ricerca GPS per vedere i prezzi in tempo reale intorno a te
            </div>
          </div>
          <Link href="/" style={{
            padding: '10px 20px',
            background: 'var(--green)',
            color: 'white',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            Cerca vicino a me →
          </Link>
        </div>

        {/* Lista distributori */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 16,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border)',
          }}>
            I più economici per benzina
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ordinati.map((d, i) => (
              <DistributoreCard
                key={d.id}
                distributore={{ ...d, distanzaKm: 0 }}
                carburante="benzina"
                rank={i}
              />
            ))}
          </div>
        </div>

        {/* Blocco SEO editoriale */}
        <div style={{ borderTop: '2px solid var(--text)', paddingTop: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="seo-grid">
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
                Quanto si risparmia
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
                La differenza tra il più caro e il più economico a {prov.nome}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
                {prov.min_benzina && prov.media_benzina ? (
                  <>
                    Il distributore più economico della provincia pratica{' '}
                    <strong>{prov.min_benzina.toFixed(3)}€/L</strong> per la benzina,
                    contro una media provinciale di <strong>{prov.media_benzina.toFixed(3)}€/L</strong>.
                    {' '}Su un pieno da 50 litri significa risparmiare{' '}
                    <strong>~{risparmio}€</strong> rispetto alla media.
                  </>
                ) : (
                  `Confronta i prezzi dei distributori nella provincia di ${prov.nome} e scegli quello più conveniente.`
                )}
              </p>
            </div>
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
                I dati
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
                Prezzi aggiornati ogni notte
              </h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
                I prezzi di tutti i {prov.totale_distributori} distributori della provincia di {prov.nome}{' '}
                vengono scaricati ogni notte dal Ministero delle Imprese e del Made in Italy (MISE).
                I gestori degli impianti sono obbligati per legge a comunicare i prezzi praticati.
              </p>
            </div>
          </div>
        </div>

      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>TrovaCarburante · Dati MISE · Aggiornati ogni notte</p>
      </footer>

    </div>
  );
}
