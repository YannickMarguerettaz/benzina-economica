import { DistributoreConDistanza, Carburante } from '@/lib/types';

interface Props {
  distributore: DistributoreConDistanza;
  carburante: Carburante;
  rank: number;
  prezzoMedio?: number;
}

export default function DistributoreCard({ distributore: d, carburante, rank, prezzoMedio }: Props) {
  const prezzo = d.prezzi[carburante];
  const mapsUrl = `https://maps.google.com/?q=${d.lat},${d.lng}`;
  const isBest = rank === 0;
  const risparmio = prezzoMedio && prezzo ? prezzoMedio - prezzo : null;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--surface)',
        border: `1px solid ${isBest ? 'var(--green-border)' : 'var(--border)'}`,
        borderLeft: isBest ? '4px solid var(--green)' : '4px solid transparent',
        borderRadius: 12,
        textDecoration: 'none',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
        boxShadow: isBest ? '0 2px 16px rgba(26,107,58,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = isBest ? '0 2px 16px rgba(26,107,58,0.08)' : '0 1px 4px rgba(0,0,0,0.04)')}
    >
      {/* Rank */}
      <div style={{
        flexShrink: 0,
        width: 52,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isBest ? 'var(--green-bg)' : '#f7f6f3',
        borderRight: '1px solid var(--border)',
        padding: '16px 0',
        gap: 4,
      }}>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: isBest ? 18 : 15,
          fontWeight: 700,
          color: isBest ? 'var(--green)' : 'var(--muted)',
          lineHeight: 1,
        }}>
          {rank + 1}
        </span>
        {isBest && (
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            top
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {d.nome || d.gestore}
          </span>
          {d.bandiera && d.bandiera !== 'Pompe Bianche' && (
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--muted)',
              background: '#f0efed',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {d.bandiera}
            </span>
          )}
        </div>

        <div style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {d.indirizzo}, {d.comune} ({d.provincia})
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', background: '#f0efed', borderRadius: 20, padding: '3px 8px' }}>
            📍 {d.distanzaKm.toFixed(1)} km
          </span>
          {d.self ? (
            <span style={{ fontSize: 11, fontWeight: 500, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 20, padding: '3px 8px' }}>
              Self service
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 500, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '3px 8px' }}>
              Servito
            </span>
          )}
        </div>
      </div>

      {/* Prezzo */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '14px 16px',
        gap: 4,
        minWidth: 100,
      }}>
        {prezzo != null ? (
          <>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 26,
              fontWeight: 700,
              color: isBest ? 'var(--green)' : 'var(--text)',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}>
              {prezzo.toFixed(3)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>€/litro</div>
            {risparmio !== null && risparmio > 0.005 && (
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--green)',
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                borderRadius: 4,
                padding: '2px 6px',
                marginTop: 2,
              }}>
                -{risparmio.toFixed(3)}€
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>N/D</div>
        )}
      </div>

      {/* Arrow */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', paddingRight: 12, color: 'var(--muted)', opacity: 0.35 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
