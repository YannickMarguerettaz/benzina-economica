import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prezzi benzina per provincia — TrovaCarburante',
  description: 'Confronta i prezzi di benzina e diesel in tutte le 107 province italiane. Dati aggiornati ogni notte dal MISE.',
};

interface Provincia {
  sigla: string;
  nome: string;
  slug: string;
  totale_distributori: number;
  min_benzina: number | null;
  min_diesel: number | null;
}

const NOMI_CORRETTI: Record<string, string> = {
  SU: 'Sud Sardegna',
};

const REGIONI: Record<string, string[]> = {
  'Valle d\'Aosta': ['AO'],
  'Piemonte': ['AL', 'AT', 'BI', 'CN', 'NO', 'TO', 'VB', 'VC'],
  'Liguria': ['GE', 'IM', 'SP', 'SV'],
  'Lombardia': ['BG', 'BS', 'CO', 'CR', 'LC', 'LO', 'MB', 'MI', 'MN', 'PV', 'SO', 'VA'],
  'Trentino-Alto Adige': ['BZ', 'TN'],
  'Veneto': ['BL', 'PD', 'RO', 'TV', 'VE', 'VI', 'VR'],
  'Friuli-Venezia Giulia': ['GO', 'PN', 'TS', 'UD'],
  'Emilia-Romagna': ['BO', 'FC', 'FE', 'MO', 'PR', 'PC', 'RA', 'RE', 'RN'],
  'Toscana': ['AR', 'FI', 'GR', 'LI', 'LU', 'MS', 'PI', 'PO', 'PT', 'SI'],
  'Umbria': ['PG', 'TR'],
  'Marche': ['AN', 'AP', 'FM', 'MC', 'PU'],
  'Lazio': ['FR', 'LT', 'RI', 'RM', 'VT'],
  'Abruzzo': ['AQ', 'CH', 'PE', 'TE'],
  'Molise': ['CB', 'IS'],
  'Campania': ['AV', 'BN', 'CE', 'NA', 'SA'],
  'Puglia': ['BA', 'BR', 'BT', 'FG', 'LE', 'TA'],
  'Basilicata': ['MT', 'PZ'],
  'Calabria': ['CS', 'CZ', 'KR', 'RC', 'VV'],
  'Sicilia': ['AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP'],
  'Sardegna': ['CA', 'NU', 'OR', 'SS', 'SU'],
};

function getProvince(): { regioniMap: Record<string, Provincia[]>; totaleDistributori: number } {
  const path = join(process.cwd(), 'public', 'data', 'province.json');
  const tutte: Provincia[] = JSON.parse(readFileSync(path, 'utf-8')).province;

  const bySigna: Record<string, Provincia> = {};
  let totaleDistributori = 0;
  for (const p of tutte) {
    bySigna[p.sigla] = { ...p, nome: NOMI_CORRETTI[p.sigla] ?? p.nome };
    totaleDistributori += p.totale_distributori;
  }

  const regioniMap: Record<string, Provincia[]> = {};
  for (const [regione, sigle] of Object.entries(REGIONI)) {
    regioniMap[regione] = sigle
      .map((s) => bySigna[s])
      .filter(Boolean)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
  }
  return { regioniMap, totaleDistributori };
}

export default function PaginaProvince() {
  const { regioniMap, totaleDistributori } = getProvince();
  const regioni = Object.keys(REGIONI);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'var(--text)',
        color: '#fff',
        padding: '56px 24px 48px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
            ← Torna alla ricerca
          </Link>
          <h1 style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.2, marginBottom: 12 }}>
            Prezzi benzina per provincia
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 520, lineHeight: 1.6, marginBottom: 32 }}>
            Tutte le 107 province italiane con il prezzo minimo della benzina aggiornato ogni notte. Trova dove costa meno nella tua zona.
          </p>

          {/* Stat bar */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>107</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>province monitorate</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.12)' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>
                {totaleDistributori.toLocaleString('it')}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>distributori attivi</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.12)' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>20</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>regioni</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ancore regioni */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', overflowX: 'auto' }}>
          {regioni.map((r) => (
            <a
              key={r}
              href={`#${r.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: '4px 12px',
                border: '1px solid var(--border)',
                borderRadius: 20,
                color: 'var(--text)',
                textDecoration: 'none',
                background: 'var(--bg)',
                whiteSpace: 'nowrap',
              }}
            >
              {r}
            </a>
          ))}
        </div>
      </div>

      {/* Sezioni regioni */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {regioni.map((regione) => {
            const province = regioniMap[regione] ?? [];
            const anchor = regione.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const minBenzina = province.reduce((min, p) => {
              if (p.min_benzina && p.min_benzina < (min ?? 99)) return p.min_benzina;
              return min;
            }, null as number | null);

            return (
              <section key={regione} id={anchor} style={{ scrollMarginTop: 80 }}>
                {/* Intestazione regione */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                    {regione}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>min benzina</span>
                    {minBenzina && (
                      <span className="font-mono" style={{ fontSize: 16, fontWeight: 500, color: 'var(--green)' }}>
                        {minBenzina.toFixed(3)}€
                      </span>
                    )}
                  </div>
                </div>

                {/* Griglia province */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                  gap: 10,
                }}>
                  {province.map((p) => (
                    <Link key={p.sigla} href={`/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <div
                        className="station-card"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: '14px 16px',
                          cursor: 'pointer',
                          height: '100%',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                            {p.nome}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--muted)',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            padding: '2px 5px',
                            letterSpacing: '0.05em',
                          }}>
                            {p.sigla}
                          </span>
                        </div>

                        {p.min_benzina && (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span className="font-mono" style={{
                              fontSize: 20,
                              fontWeight: 500,
                              color: p.min_benzina === minBenzina ? 'var(--green)' : 'var(--text)',
                            }}>
                              {p.min_benzina.toFixed(3)}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>€/L</span>
                          </div>
                        )}

                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
                          {p.totale_distributori} distributori
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

    </div>
  );
}
