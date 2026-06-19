'use client';

interface Props {
  onPosition: (lat: number, lng: number) => void;
  onError: (msg: string) => void;
  loading: boolean;
}

export default function GeoButton({ onPosition, onError, loading }: Props) {
  const handleClick = () => {
    if (!navigator.geolocation) {
      onError('Il tuo browser non supporta la geolocalizzazione');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onPosition(pos.coords.latitude, pos.coords.longitude),
      () => onError('Impossibile rilevare la posizione. Controlla i permessi del browser.'),
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium tracking-wide hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Ricerca in corso...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          Usa la mia posizione
        </span>
      )}
    </button>
  );
}
