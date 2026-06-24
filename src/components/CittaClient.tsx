'use client';

import React, { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import DistributoreCard from '@/components/DistributoreCard';
import { Distributore, Carburante } from '@/lib/types';

const GraficoStorico = lazy(() => import('@/components/GraficoStorico'));

interface CittaDati {
  nome: string;
  slug: string;
  provincia: string;
  sigla: string;
  totale_distributori: number;
  media_benzina: number | null;
  media_diesel: number | null;
  media_gpl: number | null;
  media_metano: number | null;
  min_benzina: number | null;
  min_diesel: number | null;
  min_gpl: number | null;
  min_metano: number | null;
  max_benzina: number | null;
  max_diesel: number | null;
  max_gpl: number | null;
  max_metano: number | null;
}

interface Props {
  citta: CittaDati;
  distributori: Distributore[];
}

const TABS: { value: Carburante; label: string }[] = [
  { value: 'benzina', label: 'Benzina' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gpl', label: 'GPL' },
  { value: 'metano', label: 'Metano' },
];

function FaqItem({ domanda, risposta }: { domanda: string; risposta: React.ReactNode }) {
  const [aperta, setAperta] = useState(false);
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        onClick={() => setAperta(!aperta)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '16px 0', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', lineHeight: 1.4 }}>{domanda}</span>
        <span style={{ fontSize: 18, color: 'var(--muted)', flexShrink: 0, transform: aperta ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
      </button>
      {aperta && (
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, paddingBottom: 16, margin: 0 }}>
          {risposta}
        </p>
      )}
    </div>
  );
}

export default function CittaClient({ citta, distributori }: Props) {
  const [tab, setTab] = useState<Carburante>('benzina');
  const [tuttiVisibili, setTuttiVisibili] = useState(false);
  const [ordine, setOrdine] = useState<'asc' | 'desc'>('asc');

  const minTab = citta[`min_${tab}` as keyof CittaDati] as number | null;
  const maxTab = citta[`max_${tab}` as keyof CittaDati] as number | null;
  const mediaTab = citta[`media_${tab}` as keyof CittaDati] as number | null;

  const diffCentesimi = minTab && maxTab ? ((maxTab - minTab) * 100).toFixed(1) : null;
  const risparmio = minTab && maxTab ? ((maxTab - minTab) * 50).toFixed(1) : null;
  const risparmioAnnuale = risparmio ? Math.round(parseFloat(risparmio) * 15) : null;

  const tuttiOrdinati = [...distributori]
    .filter(d => d.prezzi[tab])
    .sort((a, b) => ordine === 'asc'
      ? (a.prezzi[tab] ?? 99) - (b.prezzi[tab] ?? 99)
      : (b.prezzi[tab] ?? 0) - (a.prezzi[tab] ?? 0)
    );

  const ordinati = tuttiVisibili ? tuttiOrdinati : tuttiOrdinati.slice(0, 5);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'var(--text)', color: '#fff', padding: '48px 32px 56px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={`/${citta.sigla.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{citta.provincia}</Link>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{citta.nome}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Prezzi {TABS.find(t => t.value === tab)?.label.toLowerCase()} a {citta.nome}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 24, lineHeight: 1.6 }}>
            {citta.totale_distributori} distributori monitorati · dati aggiornati ogni notte dal MISE
          </p>

          {/* Tab carburante */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 32 }}>
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTab(t.value); setTuttiVisibili(false); setOrdine('asc'); }}
                style={{
                  padding: '7px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  background: tab === t.value ? 'white' : 'transparent',
                  color: tab === t.value ? 'var(--text)' : 'rgba(255,255,255,0.6)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Stat bar */}
          <div className="provincia-stat-bar" style={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28 }}>
            {[
              { label: 'più economico', value: minTab ? `${minTab.toFixed(3)}€` : '—', color: '#4ade80' },
              { label: 'più caro', value: maxTab ? `${maxTab.toFixed(3)}€` : '—', color: '#f87171' },
              { label: 'media città', value: mediaTab ? `${mediaTab.toFixed(3)}€` : '—', color: '#fff' },
              { label: 'risparmio annuale', value: risparmioAnnuale ? `~${risparmioAnnuale}€` : '—', color: '#4ade80' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: 40, marginRight: 40, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none', marginBottom: 8 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: 6 }}>
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
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '20px 24px', marginBottom: 40, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Vuoi trovare il distributore più vicino a te?</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Usa la ricerca GPS per vedere i prezzi in tempo reale</div>
          </div>
          <Link href="/" style={{ padding: '10px 20px', background: 'var(--green)', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
            Cerca vicino a me →
          </Link>
        </div>

        {/* Ordinamento */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 10, padding: 4 }}>
            {([['asc', '↑ Meno caro'], ['desc', '↓ Più caro']] as const).map(([val, label]) => (
              <button key={val} onClick={() => { setOrdine(val); setTuttiVisibili(false); }} style={{
                padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                background: ordine === val ? 'var(--surface)' : 'transparent',
                color: ordine === val ? 'var(--text)' : 'var(--muted)',
                boxShadow: ordine === val ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista distributori */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            I più economici · {TABS.find(t => t.value === tab)?.label} · {citta.nome}
          </div>

          {ordinati.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
              Nessun distributore con prezzi {TABS.find(t => t.value === tab)?.label.toLowerCase()} disponibili.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ordinati.map((d, i) => (
                  <DistributoreCard
                    key={d.id}
                    distributore={{ ...d, distanzaKm: 0 }}
                    carburante={tab}
                    rank={ordine === 'desc' ? 99 : i}
                    isWorst={ordine === 'desc' ? i === 0 : i === ordinati.length - 1 && ordinati.length > 1}
                  />
                ))}
              </div>
              {!tuttiVisibili && tuttiOrdinati.length > 5 && (
                <button onClick={() => setTuttiVisibili(true)} style={{
                  marginTop: 16, width: '100%', padding: '14px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, fontSize: 14, fontWeight: 600,
                  color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Vedi tutti i {tuttiOrdinati.length} distributori
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grafico storico (usa sigla provincia) */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px' }}>
        <Suspense fallback={null}>
          <GraficoStorico sigla={citta.sigla} />
        </Suspense>
      </div>

      {/* Blocco SEO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 0' }}>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="seo-grid">
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
                Quanto si risparmia
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
                A {citta.nome} il {TABS.find(t => t.value === tab)?.label.toLowerCase()} non costa uguale per tutti
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
                {minTab && maxTab ? (
                  <>
                    Oggi a {citta.nome} il distributore più economico pratica <strong>{minTab.toFixed(3)}€/L</strong>,
                    quello più caro <strong>{maxTab.toFixed(3)}€/L</strong> —
                    sono <strong>{diffCentesimi} centesimi di differenza</strong> tra due pompe nella stessa città.
                    Su un pieno da 50 litri sono <strong>~{risparmio ? Math.round(parseFloat(risparmio)) : '—'}€</strong>.
                    In un anno rappresentano un risparmio di{' '}
                    <strong style={{ fontSize: 16, color: 'var(--green)' }}>~{risparmioAnnuale}€</strong>.
                  </>
                ) : (
                  `Confronta i prezzi dei distributori di ${citta.nome} e scegli quello più conveniente.`
                )}
              </p>
            </div>
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
                I dati
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 12 }}>
                Prezzi aggiornati ogni notte
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
                I prezzi di tutti i {citta.totale_distributori} distributori di {citta.nome}{' '}
                vengono scaricati ogni notte dal Ministero delle Imprese e del Made in Italy (MISE).
                I gestori sono obbligati per legge a comunicare i prezzi praticati.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.4px' }}>
          Domande frequenti su benzina e carburante a {citta.nome}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {citta.media_benzina && (
            <FaqItem
              domanda={`Qual è il prezzo medio della benzina a ${citta.nome}?`}
              risposta={<>Oggi a {citta.nome} il prezzo medio della benzina è <strong>{citta.media_benzina.toFixed(3)}€/L</strong>, con un minimo di {citta.min_benzina?.toFixed(3)}€/L tra i {citta.totale_distributori} distributori monitorati.</>}
            />
          )}
          {citta.min_benzina && (
            <FaqItem
              domanda={`Dove trovo la benzina più economica a ${citta.nome}?`}
              risposta={<>Il distributore più economico a {citta.nome} pratica <strong>{citta.min_benzina.toFixed(3)}€/L</strong>. Puoi vedere tutti i distributori ordinati per prezzo nella tabella sopra.</>}
            />
          )}
          {risparmioAnnuale && (
            <FaqItem
              domanda={`Quanto risparmio scegliendo il distributore più economico a ${citta.nome}?`}
              risposta={<>La differenza tra il distributore più economico e quello più caro a {citta.nome} è di <strong>{diffCentesimi} centesimi al litro</strong>. Su un pieno da 50 litri sono circa <strong>{risparmio}€</strong>. In un anno il risparmio può arrivare a <strong>~{risparmioAnnuale}€</strong>.</>}
            />
          )}
          <FaqItem
            domanda={`Con quale frequenza vengono aggiornati i prezzi a ${citta.nome}?`}
            risposta="I prezzi vengono aggiornati ogni notte con i dati ufficiali del Ministero delle Imprese e del Made in Italy (MISE). I gestori degli impianti sono obbligati per legge a comunicare le variazioni di prezzo."
          />
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', textAlign: 'center', marginTop: 48 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>TrovaCarburante · Dati MISE · Aggiornati ogni notte</p>
      </footer>
    </div>
  );
}
