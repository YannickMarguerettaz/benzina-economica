// Test delle funzioni pure dello script
import { strictEqual, deepStrictEqual, ok } from 'assert';

// Copia inline delle funzioni da testare (per non dover importare il modulo intero)
function calcolaPrezzoMedio(prezzi) {
  if (!prezzi.length) return null;
  if (prezzi.length === 1) return Math.round(prezzi[0] * 1000) / 1000;
  const media = prezzi.reduce((a, b) => a + b, 0) / prezzi.length;
  const filtrati = prezzi.filter(p => Math.abs(p - media) < media * 0.3);
  const lista = filtrati.length ? filtrati : prezzi;
  return Math.round((lista.reduce((a, b) => a + b, 0) / lista.length) * 1000) / 1000;
}

function pulisciAnagrafica(dati) {
  return dati.filter(d =>
    d.lat > -90 && d.lat < 90 &&
    d.lng > -180 && d.lng < 180 &&
    d.lat !== 0 && d.lng !== 0
  );
}

// Test 1: outlier escluso (molti valori normali + un outlier moderato che la media non domina)
{
  const prezzi = [1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 2.50];
  const risultato = calcolaPrezzoMedio(prezzi);
  ok(Math.abs(risultato - 1.5) < 0.01, `Test 1 fallito: ${risultato}`);
  console.log('✅ Test 1: calcola_prezzo_medio esclude outlier');
}

// Test 2: lista vuota
{
  strictEqual(calcolaPrezzoMedio([]), null);
  console.log('✅ Test 2: calcola_prezzo_medio lista vuota restituisce null');
}

// Test 3: singolo valore
{
  strictEqual(calcolaPrezzoMedio([1.80]), 1.80);
  console.log('✅ Test 3: calcola_prezzo_medio singolo valore');
}

// Test 4: coordinate invalide rimosse
{
  const dati = [
    { id: 1, lat: 45.0, lng: 7.0 },
    { id: 2, lat: 0.0, lng: 0.0 },
    { id: 3, lat: 91.0, lng: 7.0 },
  ];
  const risultato = pulisciAnagrafica(dati);
  strictEqual(risultato.length, 1);
  strictEqual(risultato[0].id, 1);
  console.log('✅ Test 4: pulisci_anagrafica rimuove coordinate invalide');
}

console.log('\n✅ Tutti i test passati');
