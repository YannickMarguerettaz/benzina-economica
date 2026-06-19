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
      className={`flex items-center gap-4 px-4 py-3.5 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${
        isBest ? 'border-emerald-200' : 'border-gray-200'
      }`}
    >
      <div className="shrink-0 w-6 text-center">
        <span className={`text-xs font-semibold ${isBest ? 'text-emerald-600' : 'text-gray-400'}`}>
          {rank + 1}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{d.nome || d.gestore}</div>
        <div className="text-xs text-gray-400 truncate mt-0.5">{d.indirizzo} · {d.comune}</div>
        <div className="text-xs text-gray-400 mt-0.5">{d.distanzaKm.toFixed(1)} km</div>
      </div>
      <div className="text-right shrink-0">
        {prezzo != null ? (
          <>
            <div className={`text-lg font-bold tabular-nums ${isBest ? 'text-emerald-600' : 'text-gray-900'}`}>
              {prezzo.toFixed(3)}
              <span className="text-sm font-normal text-gray-400"> €</span>
            </div>
            <div className="text-xs text-gray-400">/litro</div>
          </>
        ) : (
          <div className="text-sm text-gray-300">N/D</div>
        )}
      </div>
    </a>
  );
}
