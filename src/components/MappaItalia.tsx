'use client';

import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

type CarburanteMappa = 'benzina' | 'diesel' | 'gpl' | 'metano';

interface ProvinciaData {
  sigla: string;
  nome: string;
  slug: string;
  media_benzina: number | null;
  media_diesel: number | null;
  media_gpl: number | null;
  media_metano: number | null;
}

interface Tooltip {
  x: number;
  y: number;
  nome: string;
  prezzo: string;
  slug: string;
}

interface TapInfo {
  nome: string;
  prezzo: string;
  slug: string;
}

const GEO_URL = '/data/province-topo.json';

export default function MappaItalia({ carburante = 'benzina' }: { carburante?: CarburanteMappa }) {
  const [province, setProvince] = useState<ProvinciaData[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [tapInfo, setTapInfo] = useState<TapInfo | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/data/province.json')
      .then((r) => r.json())
      .then((d) => setProvince(d.province));
    setIsMobile('ontouchstart' in window);
  }, []);

  const prezzoKey = `media_${carburante}` as keyof ProvinciaData;

  const prezzi = province
    .map((p) => p[prezzoKey] as number | null)
    .filter((v): v is number => v !== null);

  const minPrezzo = prezzi.length ? Math.min(...prezzi) : 1.7;
  const maxPrezzo = prezzi.length ? Math.max(...prezzi) : 2.0;

  const colorScale = scaleLinear<string>()
    .domain([minPrezzo, (minPrezzo + maxPrezzo) / 2, maxPrezzo])
    .range(['#1a6b3a', '#f59e0b', '#dc2626']);

  const getProvinciaByGeo = (geo: { properties: Record<string, string | number> }): ProvinciaData | undefined => {
    const sigla = String(geo.properties.prov_acr || '').toUpperCase();
    const nome = String(geo.properties.prov_name || '').toLowerCase();
    return province.find(
      (p) =>
        p.sigla.toUpperCase() === sigla ||
        p.nome.toLowerCase() === nome
    );
  };

  const handleTap = (prov: ProvinciaData, prezzo: number) => {
    if (tapInfo?.slug === prov.slug) {
      window.location.href = `/${prov.slug}`;
      return;
    }
    setTapInfo({ nome: prov.nome, prezzo: prezzo.toFixed(3), slug: prov.slug });
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setTapInfo(null), 4000);
  };

  return (
    <div style={{ padding: '24px 32px 48px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [12.5, 41.5], scale: 2200 }}
            width={500}
            height={600}
            style={{ width: '100%', maxWidth: 500, height: 'auto' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const prov = getProvinciaByGeo(geo);
                  const prezzo = prov ? (prov[prezzoKey] as number | null) : null;
                  const fill = prezzo ? colorScale(prezzo) : '#e8e6e1';
                  const isActive = tapInfo?.slug === prov?.slug;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isActive ? '#fff' : fill}
                      stroke={isActive ? '#1a6b3a' : '#ffffff'}
                      strokeWidth={isActive ? 1.5 : 0.5}
                      style={{
                        default: { outline: 'none', cursor: prov ? 'pointer' : 'default' },
                        hover: { outline: 'none', opacity: 0.8, cursor: prov ? 'pointer' : 'default' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(e) => {
                        if (isMobile || !prov || !prezzo) return;
                        setTooltip({ x: e.clientX, y: e.clientY, nome: prov.nome, prezzo: prezzo.toFixed(3), slug: prov.slug });
                      }}
                      onMouseMove={(e) => {
                        if (isMobile) return;
                        setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                      }}
                      onMouseLeave={() => { if (!isMobile) setTooltip(null); }}
                      onClick={() => {
                        if (isMobile) {
                          if (prov && prezzo) handleTap(prov, prezzo);
                        } else {
                          if (prov) window.location.href = `/${prov.slug}`;
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Tooltip desktop */}
          {!isMobile && tooltip && (
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

        {/* Banner tap mobile */}
        {isMobile && tapInfo && (
          <div
            onClick={() => window.location.href = `/${tapInfo.slug}`}
            style={{
              marginTop: 16,
              padding: '14px 20px',
              background: 'var(--text)',
              color: 'white',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{tapInfo.nome}</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>media {carburante} · €{tapInfo.prezzo}/L</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Vedi prezzi →</div>
          </div>
        )}

        {/* Legenda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>€{minPrezzo.toFixed(3)} più economica</span>
          <div style={{ width: 160, height: 6, borderRadius: 3, background: 'linear-gradient(to right, #1a6b3a, #f59e0b, #dc2626)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>€{maxPrezzo.toFixed(3)} più cara</span>
        </div>
      </div>
    </div>
  );
}
