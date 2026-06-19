import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const URL_ANAGRAFICA = 'https://www.mise.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv';
const URL_PREZZI = 'https://www.mise.gov.it/images/exportCSV/prezzo_alle_8.csv';
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'distributori.json');

const CARBURANTI_MAP = {
  'Benzina': 'benzina',
  'Gasolio': 'diesel',
  'GPL': 'gpl',
  'Metano': 'metano',
  'Benzina Special': 'benzina',
  'Gasolio Special': 'diesel',
};

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

function mergeDati(anagrafica, prezzi) {
  const prezziPerImpianto = {};
  for (const p of prezzi) {
    const carb = CARBURANTI_MAP[p.carburante];
    if (!carb) continue;
    if (!prezziPerImpianto[p.id_impianto]) prezziPerImpianto[p.id_impianto] = {};
    if (!prezziPerImpianto[p.id_impianto][carb]) prezziPerImpianto[p.id_impianto][carb] = [];
    prezziPerImpianto[p.id_impianto][carb].push(p.prezzo);
  }

  return anagrafica.map(d => {
    const bucket = prezziPerImpianto[d.id] ?? {};
    const prezziCalcolati = {};
    for (const [carb, lista] of Object.entries(bucket)) {
      const media = calcolaPrezzoMedio(lista);
      if (media !== null) prezziCalcolati[carb] = media;
    }
    return { ...d, prezzi: prezziCalcolati };
  });
}

async function fetchCsv(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} per ${url}`);
  const buffer = await res.arrayBuffer();
  return iconv.decode(Buffer.from(buffer), 'iso-8859-1');
}

function parseAnagrafica(testo) {
  const righe = testo.trim().split('\n').slice(1);
  const risultato = [];
  for (const riga of righe) {
    const parti = riga.trim().split('|');
    if (parti.length < 10) continue;
    try {
      risultato.push({
        id: parseInt(parti[0]),
        gestore: parti[1].trim(),
        bandiera: parti[2].trim(),
        tipo: parti[3].trim(),
        nome: parti[4].trim(),
        indirizzo: parti[5].trim(),
        comune: parti[6].trim(),
        provincia: parti[7].trim(),
        lat: parseFloat(parti[8].replace(',', '.')),
        lng: parseFloat(parti[9].replace(',', '.')),
        self: false,
      });
    } catch { continue; }
  }
  return risultato;
}

function parsePrezzi(testo) {
  // Il file prezzi ha una riga extra in cima con la data di estrazione,
  // poi la riga di header, poi i dati. Separatore: | (non ;)
  const righe = testo.trim().split('\n');
  // Trova l'indice della riga header (quella che contiene "idImpianto")
  const headerIdx = righe.findIndex(r => r.includes('idImpianto'));
  const datiRighe = headerIdx >= 0 ? righe.slice(headerIdx + 1) : righe.slice(1);
  const risultato = [];
  for (const riga of datiRighe) {
    const parti = riga.trim().split('|');
    if (parti.length < 5) continue;
    try {
      risultato.push({
        id_impianto: parseInt(parti[0]),
        carburante: parti[1].trim(),
        prezzo: parseFloat(parti[2].replace(',', '.')),
        self: parseInt(parti[3]) === 1,
        data_ora: parti[4].trim(),
      });
    } catch { continue; }
  }
  return risultato;
}

async function main() {
  console.log(`[${new Date().toISOString()}] Fetch anagrafica...`);
  const testoAnagrafica = await fetchCsv(URL_ANAGRAFICA);
  let anagrafica = parseAnagrafica(testoAnagrafica);
  console.log(`  ${anagrafica.length} impianti trovati`);

  anagrafica = pulisciAnagrafica(anagrafica);
  console.log(`  ${anagrafica.length} impianti dopo pulizia coordinate`);

  console.log(`[${new Date().toISOString()}] Fetch prezzi...`);
  const testoPrezzi = await fetchCsv(URL_PREZZI);
  const prezzi = parsePrezzi(testoPrezzi);
  console.log(`  ${prezzi.length} prezzi trovati`);

  console.log(`[${new Date().toISOString()}] Merge dati...`);
  const distributori = mergeDati(anagrafica, prezzi);
  const distributoriConPrezzi = distributori.filter(d => Object.keys(d.prezzi).length > 0);
  console.log(`  ${distributoriConPrezzi.length} distributori con almeno un prezzo`);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const output = {
    aggiornato: new Date().toISOString(),
    totale: distributoriConPrezzi.length,
    distributori: distributoriConPrezzi,
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(output), 'utf-8');
  console.log(`[${new Date().toISOString()}] Salvato: ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
