'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Carburante = 'benzina' | 'diesel' | 'gpl' | 'metano';

interface PuntoStorico {
  data: string;
  benzina: number | null;
  diesel: number | null;
  gpl: number | null;
  metano: number | null;
}

const COLORI: Record<Carburante, string> = {
  benzina: '#1a6b3a',
  diesel: '#1e40af',
  gpl: '#d97706',
  metano: '#7c3aed',
};

const LABEL: Record<Carburante, string> = {
  benzina: 'Benzina',
  diesel: 'Diesel',
  gpl: 'GPL',
  metano: 'Metano',
};

const CHIAVI: Record<Carburante, string> = {
  benzina: 'med_b',
  diesel: 'med_d',
  gpl: 'med_g',
  metano: 'med_m',
};

export default function GraficoStorico({ sigla }: { sigla: string }) {
  const [dati, setDati] = useState<PuntoStorico[]>([]);
  const [attivi, setAttivi] = useState<Carburante[]>(['benzina', 'diesel']);

  useEffect(() => {
    fetch('/data/storico.json')
      .then(r => r.json())
      .then((storico: { data: string; province: Record<string, Record<string, number | null>> }[]) => {
        const punti: PuntoStorico[] = storico
          .filter(s => s.province[sigla])
          .map(s => {
            const p = s.province[sigla];
            return {
              data: s.data.slice(5),
              benzina: p.med_b ?? null,
              diesel: p.med_d ?? null,
              gpl: p.med_g ?? null,
              metano: p.med_m ?? null,
            };
          });
        setDati(punti);
      })
      .catch(() => {});
  }, [sigla]);

  if (dati.length < 2) return null;

  const toggleCarburante = (c: Carburante) => {
    setAttivi(prev =>
      prev.includes(c)
        ? prev.length > 1 ? prev.filter(x => x !== c) : prev
        : [...prev, c]
    );
  };

  const tuttiNulli = (c: Carburante) => dati.every(d => d[c] === null);

  return (
    <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Andamento prezzi</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['benzina', 'diesel', 'gpl', 'metano'] as Carburante[]).map(c => (
            !tuttiNulli(c) && (
              <button
                key={c}
                onClick={() => toggleCarburante(c)}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  border: `1px solid ${attivi.includes(c) ? COLORI[c] : 'var(--border)'}`,
                  background: attivi.includes(c) ? COLORI[c] : 'transparent',
                  color: attivi.includes(c) ? 'white' : 'var(--muted)',
                }}
              >
                {LABEL[c]}
              </button>
            )
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dati} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="data" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v.toFixed(3)}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`€${value.toFixed(3)}/L`, name]}
            contentStyle={{ fontSize: 12, border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
          />
          {(['benzina', 'diesel', 'gpl', 'metano'] as Carburante[]).map(c =>
            attivi.includes(c) && !tuttiNulli(c) ? (
              <Line
                key={c}
                type="monotone"
                dataKey={c}
                name={LABEL[c]}
                stroke={COLORI[c]}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORI[c] }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
