import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROVINCE_PATH = join(__dirname, '..', 'public', 'data', 'province.json');
const STORICO_PATH = join(__dirname, '..', 'public', 'data', 'storico.json');

const oggi = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const { province } = JSON.parse(readFileSync(PROVINCE_PATH, 'utf-8'));

const snapshot = { data: oggi, province: {} };
for (const p of province) {
  snapshot.province[p.sigla] = {
    min_b: p.min_benzina,
    med_b: p.media_benzina,
    min_d: p.min_diesel,
    med_d: p.media_diesel,
    med_g: p.media_gpl,
    med_m: p.media_metano,
  };
}

const storico = existsSync(STORICO_PATH)
  ? JSON.parse(readFileSync(STORICO_PATH, 'utf-8'))
  : [];

// Evita duplicati per la stessa data
const senzaOggi = storico.filter(s => s.data !== oggi);
senzaOggi.push(snapshot);
senzaOggi.sort((a, b) => a.data.localeCompare(b.data));

writeFileSync(STORICO_PATH, JSON.stringify(senzaOggi), 'utf-8');
console.log(`Storico aggiornato: ${senzaOggi.length} giorni salvati (ultimo: ${oggi})`);
