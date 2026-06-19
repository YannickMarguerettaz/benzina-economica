'use client';

import { useState } from 'react';
import GeoButton from '@/components/GeoButton';
import FilterBar from '@/components/FilterBar';
import DistributoreCard from '@/components/DistributoreCard';
import { fetchDistributori } from '@/lib/data';
import { aggiungiDistanza, sortPerPrezzo } from '@/lib/geo';
import { DistributoreConDistanza, Carburante } from '@/lib/types';

export default function Home() {
  const [risultati, setRisultati] = useState<DistributoreConDistanza[]>([]);
  const [carburante, setCarburante] = useState<Carburante>('benzina');
  const [raggio, setRaggio] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [cercato, setCercato] = useState(false);
  const [aggiornato, setAggiornato] = useState<string | null>(null);

  const cerca = async (lat: number, lng: number) => {
    setLoading(true);
    setErrore(null);
    try {
      const tutti = await fetchDistributori();
      const vicini = aggiungiDistanza(tutti, lat, lng, raggio);
      const ordinati = sortPerPrezzo(vicini, carburante);
      setRisultati(ordinati.slice(0, 20));
      setCercato(true);
      const res = await fetch('/data/distributori.json');
      const json = await res.json();
      setAggiornato(json.aggiornato);
    } catch {
      setErrore('Errore nel caricamento dei dati. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⛽ Benzina Economica</h1>
        <p className="text-gray-500 text-sm mt-1">Prezzi aggiornati dal Ministero delle Imprese</p>
      </div>

      <FilterBar
        carburante={carburante}
        raggio={raggio}
        onCarburanteChange={setCarburante}
        onRaggioChange={setRaggio}
      />

      <GeoButton onPosition={cerca} onError={setErrore} loading={loading} />

      {errore && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {errore}
        </div>
      )}

      {cercato && risultati.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          Nessun distributore trovato nel raggio di {raggio} km.<br />
          Prova ad aumentare il raggio.
        </div>
      )}

      {risultati.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{risultati.length} distributori trovati</p>
            {aggiornato && (
              <p className="text-xs text-gray-400">
                Aggiornato: {new Date(aggiornato).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>
          {risultati.map((d, i) => (
            <DistributoreCard key={d.id} distributore={d} carburante={carburante} rank={i} />
          ))}
        </div>
      )}
    </main>
  );
}
