import { Distributore, DistributoreConDistanza, Carburante } from './types';

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function aggiungiDistanza(
  distributori: Distributore[],
  userLat: number,
  userLng: number,
  raggioKm: number
): DistributoreConDistanza[] {
  return distributori
    .map((d) => ({
      ...d,
      distanzaKm: haversineKm(userLat, userLng, d.lat, d.lng),
    }))
    .filter((d) => d.distanzaKm <= raggioKm);
}

export function sortPerDistanza(lista: DistributoreConDistanza[]): DistributoreConDistanza[] {
  return [...lista].sort((a, b) => a.distanzaKm - b.distanzaKm);
}

export function sortPerPrezzo(
  lista: DistributoreConDistanza[],
  carburante: Carburante
): DistributoreConDistanza[] {
  return lista
    .filter((d) => d.prezzi[carburante] !== undefined)
    .sort((a, b) => (a.prezzi[carburante] ?? 0) - (b.prezzi[carburante] ?? 0));
}
