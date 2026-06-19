import { haversineKm, sortPerDistanza, sortPerPrezzo } from '../src/lib/geo';
import { DistributoreConDistanza } from '../src/lib/types';

const makeDistributore = (overrides: Partial<DistributoreConDistanza> = {}): DistributoreConDistanza => ({
  id: 1,
  gestore: 'ENI',
  bandiera: 'ENI',
  tipo: 'Stradale',
  nome: 'ENI Test',
  indirizzo: 'Via Test 1',
  comune: 'Torino',
  provincia: 'TO',
  lat: 45.07,
  lng: 7.68,
  prezzi: { benzina: 1.85 },
  self: false,
  aggiornato: '2026-06-19',
  distanzaKm: 0,
  ...overrides,
});

test('haversineKm calcola distanza Roma-Milano ~477km', () => {
  const km = haversineKm(41.9028, 12.4964, 45.4654, 9.1866);
  expect(km).toBeCloseTo(477, -1);
});

test('haversineKm restituisce 0 per stesso punto', () => {
  expect(haversineKm(45.0, 7.0, 45.0, 7.0)).toBe(0);
});

test('sortPerDistanza ordina dal più vicino', () => {
  const lista = [
    makeDistributore({ id: 1, distanzaKm: 5 }),
    makeDistributore({ id: 2, distanzaKm: 1 }),
    makeDistributore({ id: 3, distanzaKm: 3 }),
  ];
  const ordinati = sortPerDistanza(lista);
  expect(ordinati.map(d => d.id)).toEqual([2, 3, 1]);
});

test('sortPerPrezzo ordina per prezzo carburante selezionato', () => {
  const lista = [
    makeDistributore({ id: 1, prezzi: { benzina: 1.90 }, distanzaKm: 1 }),
    makeDistributore({ id: 2, prezzi: { benzina: 1.75 }, distanzaKm: 2 }),
    makeDistributore({ id: 3, prezzi: { benzina: 1.82 }, distanzaKm: 0.5 }),
  ];
  const ordinati = sortPerPrezzo(lista, 'benzina');
  expect(ordinati.map(d => d.id)).toEqual([2, 3, 1]);
});

test('sortPerPrezzo esclude distributori senza prezzo per carburante selezionato', () => {
  const lista = [
    makeDistributore({ id: 1, prezzi: { benzina: 1.85 }, distanzaKm: 1 }),
    makeDistributore({ id: 2, prezzi: { diesel: 1.70 }, distanzaKm: 0.5 }),
  ];
  const ordinati = sortPerPrezzo(lista, 'benzina');
  expect(ordinati.map(d => d.id)).toEqual([1]);
});
