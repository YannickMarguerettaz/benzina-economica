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

function getProvince(): Record<string, Provincia[]> {
  const path = join(process.cwd(), 'public', 'data', 'province.json');
  const tutte: Provincia[] = JSON.parse(readFileSync(path, 'utf-8')).province;

  const bySigna: Record<string, Provincia> = {};
  for (const p of tutte) {
    bySigna[p.sigla] = { ...p, nome: NOMI_CORRETTI[p.sigla] ?? p.nome };
  }

  const result: Record<string, Provincia[]> = {};
  for (const [regione, sigle] of Object.entries(REGIONI)) {
    result[regione] = sigle
      .map((s) => bySigna[s])
      .filter(Boolean)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
  }
  return result;
}

export default function PaginaProvince() {
  const regioniMap = getProvince();
  const regioni = Object.keys(REGIONI);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Link href="/" style={{ color: 'var(--muted)', fontSize: 14, textDecoration: 'none' }}>
          ← Torna alla ricerca
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
          Prezzi carburante per provincia
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          107 province monitorate · dati aggiornati ogni notte
        </p>
      </div>

      {/* Ancore regioni */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 48,
        paddingBottom: 24,
        borderBottom: '1px solid var(--border)',
      }}>
        {regioni.map((r) => (
          <a
            key={r}
            href={`#${r.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            style={{
              fontSize: 13,
              padding: '5px 12px',
              border: '1px solid var(--border)',
              borderRadius: 20,
              color: 'var(--text)',
              textDecoration: 'none',
              background: 'var(--surface)',
              whiteSpace: 'nowrap',
            }}
          >
            {r}
          </a>
        ))}
      </div>

      {/* Sezioni per regione */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        {regioni.map((regione) => {
          const province = regioniMap[regione] ?? [];
          const anchor = regione.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <section key={regione} id={anchor}>
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
                {regione}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
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
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                          {p.nome}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: 'var(--muted)',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          padding: '2px 5px',
                        }}>
                          {p.sigla}
                        </span>
                      </div>

                      {p.min_benzina && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span className="font-mono" style={{ fontSize: 18, fontWeight: 500, color: 'var(--green)' }}>
                            {p.min_benzina.toFixed(3)}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>€/L</span>
                        </div>
                      )}

                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
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
    </main>
  );
}
