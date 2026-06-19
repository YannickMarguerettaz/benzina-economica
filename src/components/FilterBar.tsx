'use client';

import { Carburante } from '@/lib/types';

interface Props {
  carburante: Carburante;
  raggio: number;
  marca: string;
  onCarburanteChange: (c: Carburante) => void;
  onRaggioChange: (r: number) => void;
  onMarcaChange: (m: string) => void;
}

const CARBURANTI: { value: Carburante; label: string }[] = [
  { value: 'benzina', label: 'Benzina' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gpl', label: 'GPL' },
  { value: 'metano', label: 'Metano' },
];

const RAGGI = [2, 5, 10, 20];

const MARCHE = [
  'Tutte',
  'Agip Eni',
  'IP',
  'Q8',
  'Shell',
  'TotalEnergies',
  'Tamoil',
  'Esso',
  'Altro',
];

const segmentStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '6px 4px',
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  background: active ? 'white' : 'transparent',
  color: active ? 'var(--text)' : 'var(--muted)',
  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap' as const,
});

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: 8,
  display: 'block',
};

export default function FilterBar({ carburante, raggio, marca, onCarburanteChange, onRaggioChange, onMarcaChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Carburante */}
      <div>
        <span style={labelStyle}>Carburante</span>
        <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 8, padding: 3 }}>
          {CARBURANTI.map((c) => (
            <button key={c.value} onClick={() => onCarburanteChange(c.value)} style={segmentStyle(carburante === c.value)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Raggio */}
      <div>
        <span style={labelStyle}>Raggio</span>
        <div style={{ display: 'flex', gap: 2, background: '#f0efed', borderRadius: 8, padding: 3 }}>
          {RAGGI.map((r) => (
            <button key={r} onClick={() => onRaggioChange(r)} style={segmentStyle(raggio === r)}>
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Marca */}
      <div>
        <span style={labelStyle}>Marca</span>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {MARCHE.map((m) => (
            <button
              key={m}
              onClick={() => onMarcaChange(m)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: marca === m ? '1px solid var(--text)' : '1px solid var(--border)',
                background: marca === m ? 'var(--text)' : 'white',
                color: marca === m ? 'white' : 'var(--muted)',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
