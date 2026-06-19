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
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Carburante</p>
        <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
          {CARBURANTI.map((c) => (
            <button
              key={c.value}
              onClick={() => onCarburanteChange(c.value)}
              className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                carburante === c.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Raggio</p>
        <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
          {RAGGI.map((r) => (
            <button
              key={r}
              onClick={() => onRaggioChange(r)}
              className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                raggio === r
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
