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

function getProvince(): Provincia[] {
  const path = join(process.cwd(), 'public', 'data', 'province.json');
  const province: Provincia[] = JSON.parse(readFileSync(path, 'utf-8')).province;
  return province
    .map((p) => ({ ...p, nome: NOMI_CORRETTI[p.sigla] ?? p.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
}

export default function PaginaProvince() {
  const province = getProvince();

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: 40 }}>
        <Link
          href="/"
          style={{ color: 'var(--muted)', fontSize: 14, textDecoration: 'none' }}
        >
          ← Torna alla ricerca
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
          Prezzi carburante per provincia
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          {province.length} province monitorate · dati aggiornati ogni notte
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {province.map((p) => (
          <Link
            key={p.sigla}
            href={`/${p.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="station-card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '16px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                  {p.nome}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--muted)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '2px 6px',
                }}>
                  {p.sigla}
                </span>
              </div>

              {p.min_benzina && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    className="font-mono"
                    style={{ fontSize: 20, fontWeight: 500, color: 'var(--green)' }}
                  >
                    {p.min_benzina.toFixed(3)}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>€/L benzina</span>
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                {p.totale_distributori} distributori
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
