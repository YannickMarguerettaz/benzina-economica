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
      className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block">⟳</span>
          Ricerca in corso...
        </>
      ) : (
        <>📍 Trova vicino a me</>
      )}
    </button>
  );
}
