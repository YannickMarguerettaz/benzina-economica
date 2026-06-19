'use client';

import { useState, lazy, Suspense } from 'react';
import FilterBar from '@/components/FilterBar';
import DistributoreCard from '@/components/DistributoreCard';
import { fetchDistributori } from '@/lib/data';
import { aggiungiDistanza, sortPerPrezzo } from '@/lib/geo';
import { DistributoreConDistanza, Carburante } from '@/lib/types';

const MappaDistributori = lazy(() => import('@/components/MappaDistributori'));

async function geocodifica(indirizzo: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(indirizzo + ', Italia')}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'it' } });
  const dati = await res.json();
  if (!dati.length) return null;
  return { lat: parseFloat(dati[0].lat), lng: parseFloat(dati[0].lon) };
}

export default function Home() {
  const [risultati, setRisultati] = useState<DistributoreConDistanza[]>([]);
  const [carburante, setCarburante] = useState<Carburante>('benzina');
  const [raggio, setRaggio] = useState(5);
  const [marca, setMarca] = useState('Tutte');
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [cercato, setCercato] = useState(false);
  const [aggiornato, setAggiornato] = useState<string | null>(null);
  const [indirizzo, setIndirizzo] = useState('');
  const [modalitaRicerca, setModalitaRicerca] = useState<'gps' | 'indirizzo'>('gps');
  const [vista, setVista] = useState<'lista' | 'mappa'>('lista');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const cerca = async (lat: number, lng: number) => {
    setLoading(true);
    setErrore(null);
    setUserCoords({ lat, lng });
    try {
      const tutti = await fetchDistributori();
      const vicini = aggiungiDistanza(tutti, lat, lng, raggio);
      const filtrati = marca === 'Tutte'
        ? vicini
        : marca === 'Altro'
          ? vicini.filter(d => !['Agip Eni', 'IP', 'Q8', 'Shell', 'TotalEnergies', 'Tamoil', 'Esso'].some(m => d.bandiera.toLowerCase().includes(m.toLowerCase())))
          : vicini.filter(d => d.bandiera.toLowerCase().includes(marca.toLowerCase()));
      const ordinati = sortPerPrezzo(filtrati, carburante);
      setRisultati(ordinati.slice(0, 20));
      setCercato(true);
      const res = await fetch('/data/distributori.json');
      const json = await res.json();
      setAggiornato(json.aggiornato);
    } catch {
      setErrore('Errore nel caricamento dei dati. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setErrore('Il tuo browser non supporta la geolocalizzazione');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => cerca(pos.coords.latitude, pos.coords.longitude),
      () => setErrore('Impossibile rilevare la posizione. Controlla i permessi del browser.'),
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleIndirizzo = async () => {
    if (!indirizzo.trim()) {
      setErrore('Inserisci un indirizzo o una città');
      return;
    }
    setLoading(true);
    setErrore(null);
    const coords = await geocodifica(indirizzo);
    if (!coords) {
      setErrore('Indirizzo non trovato. Prova con una città o un indirizzo più preciso.');
      setLoading(false);
      return;
    }
    await cerca(coords.lat, coords.lng);
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: active ? 'var(--text)' : 'transparent',
    color: active ? 'white' : 'var(--muted)',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'var(--text)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 22V8l9-6 9 6v14M9 22V12h6v10" />
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.3px', color: 'var(--text)' }}>TrovaCarburante</span>
          </div>
          <a href="/province" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>Province →</a>
        </div>
      </header>

      {/* Hero */}
      {!cercato && (
        <section style={{ background: 'var(--text)', color: 'white', padding: '48px 20px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.45, marginBottom: 16 }}>
              21.673 distributori · aggiornati ogni notte
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 6vw, 40px)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-1px', margin: 0 }}>
              Trova il carburante<br />
              <span style={{ fontWeight: 600 }}>più economico vicino a te</span>
            </h2>
            <p style={{ fontSize: 14, opacity: 0.55, marginTop: 16, lineHeight: 1.6 }}>
              Prezzi reali dal Ministero delle Imprese. Niente registrazione, niente app.
            </p>
          </div>
        </section>
      )}

      {/* Card cerca */}
      <div style={{ maxWidth: 600, margin: cercato ? '24px auto 0' : '-24px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

          <FilterBar
            carburante={carburante}
            raggio={raggio}
            marca={marca}
            onCarburanteChange={setCarburante}
            onRaggioChange={setRaggio}
            onMarcaChange={setMarca}
          />

          {/* Toggle GPS / Indirizzo */}
          <div style={{ marginTop: 16, display: 'flex', gap: 2, background: '#f0efed', borderRadius: 8, padding: 3 }}>
            <button onClick={() => setModalitaRicerca('gps')} style={btnStyle(modalitaRicerca === 'gps')}>
              Usa la mia posizione
            </button>
            <button onClick={() => setModalitaRicerca('indirizzo')} style={btnStyle(modalitaRicerca === 'indirizzo')}>
              Cerca per indirizzo
            </button>
          </div>

          {/* Input indirizzo */}
          {modalitaRicerca === 'indirizzo' && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Es. Via Roma 1, Milano"
                value={indirizzo}
                onChange={(e) => setIndirizzo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleIndirizzo()}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  background: 'white',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleIndirizzo}
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  background: 'var(--text)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                Cerca
              </button>
            </div>
          )}

          {/* Bottone GPS */}
          {modalitaRicerca === 'gps' && (
            <button
              onClick={handleGps}
              disabled={loading}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '12px 20px',
                background: loading ? '#555' : 'var(--text)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 0.8s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                  </svg>
                  Ricerca in corso...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>
                  Rileva posizione
                </>
              )}
            </button>
          )}

          {errore && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {errore}
            </div>
          )}
        </div>
      </div>

      {/* Risultati */}
      {cercato && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 20px 40px' }} className="animate-fadeup">
          {risultati.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14 }}>
              Nessun distributore trovato.<br />
              <span style={{ fontSize: 13 }}>Prova ad aumentare il raggio o cambiare marca.</span>
            </div>
          ) : (
            <>
              {/* Header risultati + toggle vista */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {risultati.length} risultati
                </span>
                <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 7, padding: 2 }}>
                  {(['lista', 'mappa'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVista(v)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        background: vista === v ? 'white' : 'transparent',
                        color: vista === v ? 'var(--text)' : 'var(--muted)',
                        boxShadow: vista === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                        textTransform: 'capitalize',
                      }}
                    >
                      {v === 'lista' ? '≡ Lista' : '◎ Mappa'}
                    </button>
                  ))}
                </div>
              </div>

              {aggiornato && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Dati del {new Date(aggiornato).toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}

              {/* Vista lista */}
              {vista === 'lista' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {risultati.map((d, i) => (
                    <DistributoreCard key={d.id} distributore={d} carburante={carburante} rank={i} />
                  ))}
                </div>
              )}

              {/* Vista mappa */}
              {vista === 'mappa' && userCoords && (
                <Suspense fallback={
                  <div style={{ height: 420, background: '#f0efed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--muted)' }}>
                    Caricamento mappa...
                  </div>
                }>
                  <MappaDistributori
                    distributori={risultati}
                    carburante={carburante}
                    userLat={userCoords.lat}
                    userLng={userCoords.lng}
                  />
                </Suspense>
              )}
            </>
          )}
        </div>
      )}

      {/* Come funziona */}
      {!cercato && (
        <div style={{ maxWidth: 600, margin: '40px auto 0', padding: '0 20px 60px' }}>
          <p style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Come funziona</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { n: '01', titolo: 'Filtra', desc: 'Scegli carburante, raggio e marca' },
              { n: '02', titolo: 'Localizza', desc: 'GPS o cerca per indirizzo' },
              { n: '03', titolo: 'Risparmia', desc: 'Vai al distributore più economico' },
            ].map((step) => (
              <div key={step.n} style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{step.titolo}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 38, height: 38, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Dati ufficiali MISE</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Prezzi dal Ministero delle Imprese e del Made in Italy. Aggiornati ogni notte.
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>TrovaCarburante · Dati MISE · Aggiornati ogni notte</p>
      </footer>
    </div>
  );
}
