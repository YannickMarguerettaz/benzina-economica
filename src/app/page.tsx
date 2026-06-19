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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">TrovaCarburante</h1>
          <p className="text-xs text-gray-400 mt-0.5">Prezzi aggiornati dal Ministero delle Imprese</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <FilterBar
          carburante={carburante}
          raggio={raggio}
          onCarburanteChange={setCarburante}
          onRaggioChange={setRaggio}
        />

        <GeoButton onPosition={cerca} onError={setErrore} loading={loading} />

        {errore && (
          <div className="border border-red-200 bg-red-50 rounded-lg px-4 py-3 text-sm text-red-600">
            {errore}
          </div>
        )}

        {cercato && risultati.length === 0 && !loading && (
          <div className="text-center text-gray-400 text-sm py-10">
            Nessun distributore nel raggio di {raggio} km.<br />
            Prova ad aumentare il raggio.
          </div>
        )}

        {risultati.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {risultati.length} risultati
              </p>
              {aggiornato && (
                <p className="text-xs text-gray-400">
                  Dati del {new Date(aggiornato).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>
            {risultati.map((d, i) => (
              <DistributoreCard key={d.id} distributore={d} carburante={carburante} rank={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
