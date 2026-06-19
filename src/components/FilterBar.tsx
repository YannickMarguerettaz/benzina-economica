'use client';

import { Carburante } from '@/lib/types';

interface Props {
  carburante: Carburante;
  raggio: number;
  onCarburanteChange: (c: Carburante) => void;
  onRaggioChange: (r: number) => void;
}

const CARBURANTI: { value: Carburante; label: string }[] = [
  { value: 'benzina', label: 'Benzina' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gpl', label: 'GPL' },
  { value: 'metano', label: 'Metano' },
];

const RAGGI = [2, 5, 10, 20];

export default function FilterBar({ carburante, raggio, onCarburanteChange, onRaggioChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CARBURANTI.map((c) => (
          <button
            key={c.value}
            onClick={() => onCarburanteChange(c.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              carburante === c.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {RAGGI.map((r) => (
          <button
            key={r}
            onClick={() => onRaggioChange(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              raggio === r
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {r} km
          </button>
        ))}
      </div>
    </div>
  );
}
