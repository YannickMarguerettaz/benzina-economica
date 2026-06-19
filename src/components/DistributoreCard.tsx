import { DistributoreConDistanza, Carburante } from '@/lib/types';

interface Props {
  distributore: DistributoreConDistanza;
  carburante: Carburante;
  rank: number;
}

const EMOJI_BANDIERA: Record<string, string> = {
  ENI: '🟡',
  AGIP: '🟡',
  Q8: '🔵',
  SHELL: '🔴',
  TOTALENERGIES: '🔴',
  IP: '🟠',
};

export default function DistributoreCard({ distributore: d, carburante, rank }: Props) {
  const prezzo = d.prezzi[carburante];
  const emoji = EMOJI_BANDIERA[d.bandiera.toUpperCase()] ?? '⛽';
  const mapsUrl = `https://maps.google.com/?q=${d.lat},${d.lng}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
    >
      <div className="text-2xl w-8 text-center">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{d.nome || d.gestore}</div>
        <div className="text-sm text-gray-500 truncate">{d.indirizzo}, {d.comune}</div>
        <div className="text-xs text-gray-400 mt-0.5">{d.distanzaKm.toFixed(1)} km</div>
      </div>
      <div className="text-right shrink-0">
        {prezzo ? (
          <>
            <div className={`text-xl font-bold ${rank === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {prezzo.toFixed(3)}€
            </div>
            <div className="text-xs text-gray-400">/litro</div>
          </>
        ) : (
          <div className="text-sm text-gray-400">N/D</div>
        )}
      </div>
    </a>
  );
}
