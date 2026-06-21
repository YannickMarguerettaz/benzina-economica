'use client';

import { useState, lazy, Suspense } from 'react';
import DistributoreCard from '@/components/DistributoreCard';
import { fetchDistributori } from '@/lib/data';
import { aggiungiDistanza, sortPerPrezzo } from '@/lib/geo';
import { DistributoreConDistanza, Carburante } from '@/lib/types';

const MappaDistributori = lazy(() => import('@/components/MappaDistributori'));

const CARBURANTI: { value: Carburante; label: string }[] = [
  { value: 'benzina', label: 'Benzina' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gpl', label: 'GPL' },
  { value: 'metano', label: 'Metano' },
];

const RAGGI = [2, 5, 10, 20];

const MARCHE = ['Tutte', 'Agip Eni', 'IP', 'Q8', 'Shell', 'TotalEnergies', 'Tamoil', 'Esso', 'Altro'];

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
  const [filtriAperti, setFiltriAperti] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'gps' | 'data' | null>(null);

  const cerca = async (lat: number, lng: number, overrideCarburante?: Carburante, overrideRaggio?: number) => {
    const carburanteEffettivo = overrideCarburante ?? carburante;
    const raggioEffettivo = overrideRaggio ?? raggio;
    setLoading(true);
    setLoadingStep('data');
    setErrore(null);
    setUserCoords({ lat, lng });
    try {
      const tutti = await fetchDistributori();
      const vicini = aggiungiDistanza(tutti, lat, lng, raggioEffettivo);
      const filtrati = marca === 'Tutte'
        ? vicini
        : marca === 'Altro'
          ? vicini.filter(d => !['Agip Eni', 'IP', 'Q8', 'Shell', 'TotalEnergies', 'Tamoil', 'Esso'].some(m => d.bandiera.toLowerCase().includes(m.toLowerCase())))
          : vicini.filter(d => d.bandiera.toLowerCase().includes(marca.toLowerCase()));
      const ordinati = sortPerPrezzo(filtrati, carburanteEffettivo);
      setRisultati(ordinati.slice(0, 20));
      setCercato(true);
      const res = await fetch('/data/distributori.json');
      const json = await res.json();
      setAggiornato(json.aggiornato);
    } catch {
      setErrore('Errore nel caricamento dei dati. Riprova.');
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setErrore('Il tuo browser non supporta la geolocalizzazione');
      return;
    }
    setLoading(true);
    setLoadingStep('gps');
    setErrore(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => cerca(pos.coords.latitude, pos.coords.longitude),
      () => { setErrore('Impossibile rilevare la posizione. Controlla i permessi del browser.'); setLoading(false); setLoadingStep(null); },
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

  const segPill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? '1px solid var(--text)' : '1px solid var(--border)',
    background: active ? 'var(--text)' : 'white',
    color: active ? 'white' : 'var(--muted)',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/icon-192.png" alt="TrovaCarburante" width={34} height={34} style={{ display: 'block' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px', color: 'var(--text)' }}>TrovaCarburante</span>
          </div>
          <a href="/province" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>Cerca per provincia</a>
        </div>
      </header>

      {/* Hero + Ricerca (solo pre-ricerca) */}
      {!cercato && (
        <section className="hero-section" style={{ background: 'var(--text)', color: 'white', padding: '64px 32px 80px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 12px' }}>
              Trova il carburante<br />
              <span style={{ fontWeight: 700 }}>più economico vicino a te</span>
            </h1>
            <p style={{ fontSize: 15, opacity: 0.5, marginTop: 16, lineHeight: 1.7, marginBottom: 40 }}>
              Niente registrazione, niente app. Dati aggiornati ogni giorno.
            </p>

            {/* Barra ricerca principale */}
            {modalitaRicerca === 'gps' ? (
              <div style={{ marginBottom: 16 }}>
                <button
                  onClick={handleGps}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '18px 28px',
                    background: loading ? 'var(--green)' : 'var(--green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: loading ? '14px 14px 0 0' : 14,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: loading ? 'none' : '0 8px 40px rgba(0,0,0,0.2)',
                    transition: 'box-shadow 0.2s, border-radius 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                      </svg>
                      {loadingStep === 'gps' ? 'Rilevamento posizione...' : 'Caricamento prezzi...'}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                      </svg>
                      Cerca vicino a me
                    </>
                  )}
                </button>
                {loading && (
                  <div style={{ height: 4, background: 'rgba(26,107,58,0.2)', borderRadius: '0 0 14px 14px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
                    <div className={loadingStep === 'gps' ? 'progress-bar-gps' : 'progress-bar-data'} style={{ height: '100%', background: 'var(--green)' }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="search-bar-address" style={{ background: 'white', borderRadius: 14, padding: 8, display: 'flex', gap: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.2)', marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Città o indirizzo..."
                  value={indirizzo}
                  onChange={(e) => setIndirizzo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleIndirizzo()}
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    background: 'transparent',
                    color: 'var(--text)',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={handleIndirizzo}
                  disabled={loading}
                  style={{
                    padding: '14px 24px',
                    background: loading ? '#555' : 'var(--green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? (
                    <svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                    </svg>
                  ) : 'Cerca'}
                </button>
              </div>
            )}

            {/* Toggle GPS / Indirizzo */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              <button onClick={() => setModalitaRicerca('gps')} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: modalitaRicerca === 'gps' ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.2)',
                background: modalitaRicerca === 'gps' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                Usa la mia posizione
              </button>
              <button onClick={() => setModalitaRicerca('indirizzo')} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: modalitaRicerca === 'indirizzo' ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.2)',
                background: modalitaRicerca === 'indirizzo' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                Cerca per indirizzo
              </button>
            </div>

            {/* Carburante */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              {CARBURANTI.map(c => (
                <button key={c.value} onClick={() => setCarburante(c.value)} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  border: carburante === c.value ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
                  background: carburante === c.value ? 'white' : 'transparent',
                  color: carburante === c.value ? 'var(--text)' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Filtri avanzati */}
            <button
              onClick={() => setFiltriAperti(!filtriAperti)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                gap: 6, margin: '0 auto', padding: '4px 8px',
              }}
            >
              Filtri avanzati
              <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: filtriAperti ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>

            {filtriAperti && (
              <div style={{ marginTop: 16, padding: 20, background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }} className="animate-fadeup">

                {/* Raggio */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 10 }}>Raggio</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {RAGGI.map(r => (
                      <button key={r} onClick={() => setRaggio(r)} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                        border: raggio === r ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
                        background: raggio === r ? 'white' : 'transparent',
                        color: raggio === r ? 'var(--text)' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marca */}
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 10 }}>Marca</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {MARCHE.map(m => (
                      <button key={m} onClick={() => setMarca(m)} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                        border: marca === m ? '1px solid white' : '1px solid rgba(255,255,255,0.2)',
                        background: marca === m ? 'white' : 'transparent',
                        color: marca === m ? 'var(--text)' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {errore && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
                {errore}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Card cerca post-ricerca (compatta) */}
      {cercato && (
        <div className="page-wrapper" style={{ maxWidth: 900, margin: '32px auto 0', padding: '0 32px', position: 'relative', zIndex: 10 }}>
          <div className="main-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
            {/* Riga 1: input + aggiorna + toggle GPS/Indirizzo */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, background: '#f7f6f3', borderRadius: 10, padding: '4px 4px 4px 14px', alignItems: 'center', border: '1px solid var(--border)' }}>
                {modalitaRicerca === 'indirizzo' ? (
                  <input
                    type="text"
                    placeholder="Indirizzo o città..."
                    value={indirizzo}
                    onChange={(e) => setIndirizzo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIndirizzo()}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, fontFamily: 'inherit', color: 'var(--text)', outline: 'none', minWidth: 0 }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--muted)' }}>Posizione GPS</span>
                )}
                <button
                  onClick={modalitaRicerca === 'gps' ? handleGps : handleIndirizzo}
                  disabled={loading}
                  style={{ padding: '8px 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                >
                  {loading ? '...' : 'Aggiorna'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 8, padding: 3, flexShrink: 0 }}>
                <button onClick={() => setModalitaRicerca('gps')} style={{ padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: modalitaRicerca === 'gps' ? 'white' : 'transparent', color: modalitaRicerca === 'gps' ? 'var(--text)' : 'var(--muted)', fontFamily: 'inherit' }}>GPS</button>
                <button onClick={() => setModalitaRicerca('indirizzo')} style={{ padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: modalitaRicerca === 'indirizzo' ? 'white' : 'transparent', color: modalitaRicerca === 'indirizzo' ? 'var(--text)' : 'var(--muted)', fontFamily: 'inherit' }}>Indirizzo</button>
              </div>
            </div>
            {/* Riga 2: carburante + raggio */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 8, padding: 3, flexShrink: 0 }}>
                {CARBURANTI.map(c => (
                  <button key={c.value} onClick={() => { setCarburante(c.value); if (userCoords) cerca(userCoords.lat, userCoords.lng, c.value); }} style={{ padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: carburante === c.value ? 'white' : 'transparent', color: carburante === c.value ? 'var(--text)' : 'var(--muted)', fontFamily: 'inherit' }}>{c.label}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 8, padding: 3, flexShrink: 0 }}>
                {RAGGI.map(r => (
                  <button key={r} onClick={() => { setRaggio(r); if (userCoords) cerca(userCoords.lat, userCoords.lng, undefined, r); }} style={{ padding: '6px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: raggio === r ? 'white' : 'transparent', color: raggio === r ? 'var(--text)' : 'var(--muted)', fontFamily: 'inherit' }}>{r}km</button>
                ))}
              </div>
            </div>

            {errore && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
                {errore}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risultati */}
      {cercato && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px 60px' }} className="animate-fadeup">
          {risultati.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14 }}>
              Nessun distributore trovato.<br />
              <span style={{ fontSize: 13 }}>Prova ad aumentare il raggio o cambiare marca.</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {risultati.length} risultati · {carburante} · {raggio} km
                </span>
                <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 7, padding: 2 }}>
                  {(['lista', 'mappa'] as const).map((v) => (
                    <button key={v} onClick={() => setVista(v)} style={{ padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: vista === v ? 'white' : 'transparent', color: vista === v ? 'var(--text)' : 'var(--muted)', boxShadow: vista === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      {v === 'lista' ? '≡ Lista' : '◎ Mappa'}
                    </button>
                  ))}
                </div>
              </div>

              {aggiornato && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Dati del {new Date(aggiornato).toLocaleDateString('it-IT')}</span>
                </div>
              )}

              {vista === 'lista' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {risultati.map((d, i) => (
                    <DistributoreCard key={d.id} distributore={d} carburante={carburante} rank={i} />
                  ))}
                </div>
              )}

              {vista === 'mappa' && userCoords && (
                <Suspense fallback={
                  <div style={{ height: 420, background: '#f0efed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--muted)' }}>
                    Caricamento mappa...
                  </div>
                }>
                  <MappaDistributori distributori={risultati} carburante={carburante} userLat={userCoords.lat} userLng={userCoords.lng} />
                </Suspense>
              )}
            </>
          )}
        </div>
      )}

      {/* Come funziona */}
      {!cercato && (
        <div style={{ maxWidth: 900, margin: '56px auto 0', padding: '0 32px 80px' }}>
          <p style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 24 }}>Come funziona</p>
          <div className="steps-grid">
            {[
              { n: '01', titolo: 'Filtra', desc: 'Scegli carburante, raggio e marca del distributore' },
              { n: '02', titolo: 'Localizza', desc: 'Usa il GPS oppure cerca per indirizzo o città' },
              { n: '03', titolo: 'Risparmia', desc: 'Vai al distributore più economico vicino a te' },
            ].map((step) => (
              <div key={step.n} style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{step.n}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{step.titolo}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 44, height: 44, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Dati ufficiali del MISE</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                I prezzi provengono dal Ministero delle Imprese e del Made in Italy. Aggiornati automaticamente ogni notte alle 03:00.
              </div>
            </div>
          </div>

          {/* Sezione SEO */}
          <div style={{ marginTop: 64, borderTop: '2px solid var(--text)' }}>

            {/* Stat bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 0 }} className="stat-bar">
              {[
                { n: '21.000+', label: 'distributori monitorati' },
                { n: 'ogni notte', label: 'aggiornamento prezzi' },
                { n: '~260€', label: 'risparmio annuale medio' },
                { n: '4', label: 'tipologie di carburante' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1,
                  padding: '24px 20px',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Blocco 1 — full width editoriale */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid var(--border)' }} className="editorial-row">
              <div style={{ padding: '40px 32px 40px 0', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>01</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.6px', margin: 0 }}>
                  Prezzi reali,<br />aggiornati<br />ogni notte
                </h2>
              </div>
              <div style={{ padding: '40px 0 40px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.9, margin: '0 0 24px' }}>
                  TrovaCarburante raccoglie ogni notte i prezzi di oltre 21.000 distributori italiani direttamente dal Ministero delle Imprese e del Made in Italy (MISE). I dati sono pubblici, gratuiti e aggiornati quotidianamente dai gestori degli impianti. Niente intermediari, niente stime: trovi sempre i prezzi reali praticati in quel momento.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Benzina', 'Diesel', 'GPL', 'Metano'].map(c => (
                    <div key={c} style={{ padding: '6px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>{c}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blocco 2 — risparmio con numero grande */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', borderBottom: '1px solid var(--border)' }} className="editorial-row editorial-row--reverse">
              <div style={{ padding: '40px 40px 40px 0', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>02</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.6px', margin: '0 0 20px' }}>
                  Quanto puoi risparmiare<br />sul carburante?
                </h2>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.9, margin: 0 }}>
                  La differenza tra il distributore più economico e quello più caro nella stessa città supera spesso i 15–20 centesimi al litro. Un pieno da 50 litri può costare fino a 10€ in meno. Moltiplicato per i rifornimenti annuali, il risparmio diventa significativo.
                </p>
              </div>
              <div style={{ padding: '40px 0 40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>risparmio annuale medio</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 56, fontWeight: 700, color: 'var(--green)', lineHeight: 1, letterSpacing: '-2px' }}>~260€</div>
                <div style={{ width: 40, height: 2, background: 'var(--green)', margin: '16px 0' }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                  11.000 km/anno · 7L/100km<br />
                  pieno ogni 2 settimane<br />
                  distributore più economico a 5 km
                </div>
              </div>
            </div>

            {/* Blocco 3 — due colonne simmetriche */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="seo-grid">
              <div style={{ padding: '40px 40px 40px 0', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>03</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.5px', margin: '0 0 16px' }}>
                  Benzina, diesel,<br />GPL e metano
                </h2>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.9, margin: 0 }}>
                  Il confronto funziona per tutti i carburanti. Puoi filtrare per tipologia e trovare il distributore più conveniente in base al tuo veicolo. I prezzi includono sia il servito che il self service.
                </p>
              </div>
              <div style={{ padding: '40px 0 40px 40px' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>04</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.5px', margin: '0 0 16px' }}>
                  Ricerca per<br />posizione o indirizzo
                </h2>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.9, margin: 0 }}>
                  Usa il GPS oppure cerca per indirizzo o città. Scegli il raggio da 2 a 20 km e ottieni la lista ordinata per prezzo. Nessuna registrazione, nessuna app.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 32px', textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>
          <a href="/province" style={{ fontSize: 13, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
            Prezzi benzina per provincia →
          </a>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { nome: 'Roma', slug: 'roma' },
            { nome: 'Milano', slug: 'milano' },
            { nome: 'Napoli', slug: 'napoli' },
            { nome: 'Torino', slug: 'torino' },
            { nome: 'Bologna', slug: 'bologna' },
          ].map((p) => (
            <a key={p.slug} href={`/${p.slug}`} style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
              {p.nome}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>TrovaCarburante · Dati MISE · Aggiornati ogni notte</p>
      </footer>
    </div>
  );
}
