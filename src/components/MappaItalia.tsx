'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

interface ProvinciaData {
  sigla: string;
  nome: string;
  slug: string;
  media_benzina: number | null;
}

interface Tooltip {
  x: number;
  y: number;
  nome: string;
  prezzo: string;
  slug: string;
}

const GEO_URL = '/data/province-topo.json';

export default function MappaItalia() {
  const [province, setProvince] = useState<ProvinciaData[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    fetch('/data/province.json')
      .then((r) => r.json())
      .then((d) => setProvince(d.province));
  }, []);

  const prezzi = province
    .map((p) => p.media_benzina)
    .filter((v): v is number => v !== null);

  const minPrezzo = prezzi.length ? Math.min(...prezzi) : 1.7;
  const maxPrezzo = prezzi.length ? Math.max(...prezzi) : 2.0;

  const colorScale = scaleLinear<string>()
    .domain([minPrezzo, (minPrezzo + maxPrezzo) / 2, maxPrezzo])
    .range(['#1a6b3a', '#f59e0b', '#dc2626']);

  const getProvinciaByGeo = (geo: { properties: Record<string, string> }): ProvinciaData | undefined => {
    const sigla = (geo.properties.prov_acr || '').toUpperCase();
    const nome = (geo.properties.prov_name || '').toLowerCase();
    return province.find(
      (p) =>
        p.sigla.toUpperCase() === sigla ||
        p.nome.toLowerCase() === nome
    );
  };

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '48px 32px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontSize: 11,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 8,
        }}>
          Prezzi benzina oggi in Italia
        </p>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          margin: '0 0 32px',
        }}>
          Dove costa meno fare il pieno?
        </h2>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [12.5, 42.5], scale: 2400 }}
            width={500}
            height={540}
            style={{ width: '100%', maxWidth: 500, height: 'auto' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const prov = getProvinciaByGeo(geo);
                  const prezzo = prov?.media_benzina ?? null;
                  const fill = prezzo ? colorScale(prezzo) : '#e8e6e1';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', cursor: prov ? 'pointer' : 'default' },
                        hover: { outline: 'none', opacity: 0.8, cursor: prov ? 'pointer' : 'default' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(e) => {
                        if (!prov || !prezzo) return;
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          nome: prov.nome,
                          prezzo: prezzo.toFixed(3),
                          slug: prov.slug,
                        });
                      }}
                      onMouseMove={(e) => {
                        setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => {
                        if (prov) window.location.href = `/${prov.slug}`;
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {tooltip && (
            <div style={{
              position: 'fixed',
              left: tooltip.x + 14,
              top: tooltip.y - 44,
              background: 'var(--text)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              pointerEvents: 'none',
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              {tooltip.nome} · €{tooltip.prezzo}/L
            </div>
          )}
        </div>

        {/* Legenda */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>€{minPrezzo.toFixed(3)} più economica</span>
          <div style={{
            width: 160,
            height: 6,
            borderRadius: 3,
            background: 'linear-gradient(to right, #1a6b3a, #f59e0b, #dc2626)',
          }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>€{maxPrezzo.toFixed(3)} più cara</span>
        </div>
      </div>
    </div>
  );
}
