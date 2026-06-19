'use client';

import { useEffect, useRef } from 'react';
import { DistributoreConDistanza, Carburante } from '@/lib/types';

interface Props {
  distributori: DistributoreConDistanza[];
  carburante: Carburante;
  userLat: number;
  userLng: number;
}

export default function MappaDistributori({ distributori, carburante, userLat, userLng }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      // Fix icone Leaflet con Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([userLat, userLng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Marker posizione utente
      const iconUtente = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#1a1917;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([userLat, userLng], { icon: iconUtente })
        .addTo(map)
        .bindPopup('<strong>La tua posizione</strong>');

      // Marker distributori
      distributori.forEach((d, i) => {
        const prezzo = d.prezzi[carburante];
        const isBest = i === 0;
        const colore = isBest ? '#1a6b3a' : '#1a1917';

        const icon = L.divIcon({
          html: `<div style="
            background:${colore};
            color:white;
            padding:4px 7px;
            border-radius:6px;
            font-size:11px;
            font-weight:600;
            white-space:nowrap;
            font-family:'DM Mono',monospace;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
            position:relative;
          ">${prezzo ? prezzo.toFixed(3) + '€' : 'N/D'}<div style="
            position:absolute;
            bottom:-5px;
            left:50%;
            transform:translateX(-50%);
            width:0;height:0;
            border-left:5px solid transparent;
            border-right:5px solid transparent;
            border-top:5px solid ${colore};
          "></div></div>`,
          className: '',
          iconSize: [60, 28],
          iconAnchor: [30, 33],
        });

        const mapsUrl = `https://maps.google.com/?q=${d.lat},${d.lng}`;
        L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'DM Sans',sans-serif;min-width:180px">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px">${d.nome || d.gestore}</div>
              <div style="font-size:12px;color:#8a8680;margin-bottom:6px">${d.indirizzo}, ${d.comune}</div>
              <div style="font-size:11px;color:#8a8680;margin-bottom:8px">${d.distanzaKm.toFixed(1)} km</div>
              ${prezzo ? `<div style="font-size:18px;font-weight:600;color:${isBest ? '#1a6b3a' : '#1a1917'};font-family:'DM Mono',monospace">${prezzo.toFixed(3)}€<span style="font-size:11px;font-weight:400;color:#8a8680"> /litro</span></div>` : ''}
              <a href="${mapsUrl}" target="_blank" style="display:inline-block;margin-top:8px;font-size:12px;color:#1a1917;text-decoration:underline">Apri in Maps →</a>
            </div>
          `);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [distributori, carburante, userLat, userLng]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 420,
          borderRadius: 10,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      />
    </>
  );
}
