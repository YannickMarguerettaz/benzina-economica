import { DistributoreConDistanza, Carburante } from '@/lib/types';

interface Props {
  distributore: DistributoreConDistanza;
  carburante: Carburante;
  rank: number;
}

export default function DistributoreCard({ distributore: d, carburante, rank }: Props) {
  const prezzo = d.prezzi[carburante];
  const mapsUrl = `https://maps.google.com/?q=${d.lat},${d.lng}`;
  const isBest = rank === 0;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '18px 20px',
        background: isBest ? 'var(--green-bg)' : 'var(--surface)',
        border: `1px solid ${isBest ? 'var(--green-border)' : 'var(--border)'}`,
        borderRadius: 12,
        textDecoration: 'none',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Rank */}
      <div style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        background: isBest ? 'var(--green)' : '#f0efed',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          fontWeight: 500,
          color: isBest ? 'white' : 'var(--muted)',
        }}>
          {rank + 1}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {d.nome || d.gestore}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {d.indirizzo} · {d.comune}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
          {d.distanzaKm.toFixed(1)} km di distanza
        </div>
      </div>

      {/* Prezzo */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {prezzo != null ? (
          <>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 24,
              fontWeight: 500,
              color: isBest ? 'var(--green)' : 'var(--text)',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}>
              {prezzo.toFixed(3)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>€/litro</div>
          </>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>N/D</div>
        )}
      </div>

      {/* Arrow */}
      <div style={{ flexShrink: 0, color: 'var(--muted)', opacity: 0.4 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
