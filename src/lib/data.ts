import { Distributore } from './types';

let cache: Distributore[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60;

export async function fetchDistributori(): Promise<Distributore[]> {
  const now = Date.now();
  if (cache && now - cacheTimestamp < CACHE_TTL_MS) {
    return cache;
  }
  const res = await fetch('/data/distributori.json', { next: { revalidate: 3600 } } as RequestInit);
  if (!res.ok) throw new Error('Impossibile caricare i dati');
  const json = await res.json();
  cache = json.distributori as Distributore[];
  cacheTimestamp = now;
  return cache;
}

export async function fetchAggiornato(): Promise<string> {
  const res = await fetch('/data/distributori.json', { next: { revalidate: 3600 } } as RequestInit);
  const json = await res.json();
  return json.aggiornato as string;
}
