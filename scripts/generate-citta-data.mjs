import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = join(__dirname, '..', 'public', 'data', 'distributori.json');
const PROVINCE_PATH = join(__dirname, '..', 'public', 'data', 'province.json');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'citta.json');

const CITTA_TARGET = [
  'ROMA', 'MILANO', 'NAPOLI', 'TORINO', 'PALERMO',
  'GENOVA', 'FIRENZE', 'BOLOGNA', 'CATANIA', 'VERONA',
  'PADOVA', 'BARI', 'BRESCIA', 'MODENA', 'VENEZIA',
  'PARMA', 'TARANTO', 'PERUGIA', 'LATINA', 'REGGIO NELL\'EMILIA',
];

const SLUG_MAP = {
  'ROMA': 'roma', 'MILANO': 'milano', 'NAPOLI': 'napoli', 'TORINO': 'torino',
  'PALERMO': 'palermo', 'GENOVA': 'genova', 'FIRENZE': 'firenze', 'BOLOGNA': 'bologna',
  'CATANIA': 'catania', 'VERONA': 'verona', 'PADOVA': 'padova', 'BARI': 'bari',
  'BRESCIA': 'brescia', 'MODENA': 'modena', 'VENEZIA': 'venezia', 'PARMA': 'parma',
  'TARANTO': 'taranto', 'PERUGIA': 'perugia', 'LATINA': 'latina',
  'REGGIO NELL\'EMILIA': 'reggio-emilia',
};

const NOME_MAP = {
  'ROMA': 'Roma', 'MILANO': 'Milano', 'NAPOLI': 'Napoli', 'TORINO': 'Torino',
  'PALERMO': 'Palermo', 'GENOVA': 'Genova', 'FIRENZE': 'Firenze', 'BOLOGNA': 'Bologna',
  'CATANIA': 'Catania', 'VERONA': 'Verona', 'PADOVA': 'Padova', 'BARI': 'Bari',
  'BRESCIA': 'Brescia', 'MODENA': 'Modena', 'VENEZIA': 'Venezia', 'PARMA': 'Parma',
  'TARANTO': 'Taranto', 'PERUGIA': 'Perugia', 'LATINA': 'Latina',
  'REGGIO NELL\'EMILIA': 'Reggio Emilia',
};

const data = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));
const distributori = data.distributori;
const province = JSON.parse(readFileSync(PROVINCE_PATH, 'utf-8')).province;

const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 1000) / 1000 : null;
const min = arr => arr.length ? Math.round(Math.min(...arr) * 1000) / 1000 : null;
const max = arr => arr.length ? Math.round(Math.max(...arr) * 1000) / 1000 : null;

const citta = [];

for (const nome of CITTA_TARGET) {
  const lista = distributori.filter(d => d.comune && d.comune.trim().toUpperCase() === nome);
  if (!lista.length) continue;

  const benzine = lista.map(d => d.prezzi.benzina).filter(Boolean);
  const diesel = lista.map(d => d.prezzi.diesel).filter(Boolean);
  const gpl = lista.map(d => d.prezzi.gpl).filter(Boolean);
  const metano = lista.map(d => d.prezzi.metano).filter(Boolean);

  // Trova provincia dalla sigla del primo distributore
  const sigla = lista[0].provincia?.toUpperCase() ?? '';
  const prov = province.find(p => p.sigla === sigla);

  citta.push({
    nome: NOME_MAP[nome] ?? nome,
    slug: SLUG_MAP[nome] ?? nome.toLowerCase().replace(/\s+/g, '-'),
    provincia: prov?.nome ?? sigla,
    sigla,
    totale_distributori: lista.length,
    media_benzina: avg(benzine),
    media_diesel: avg(diesel),
    media_gpl: avg(gpl),
    media_metano: avg(metano),
    min_benzina: min(benzine),
    min_diesel: min(diesel),
    min_gpl: min(gpl),
    min_metano: min(metano),
    max_benzina: max(benzine),
    max_diesel: max(diesel),
    max_gpl: max(gpl),
    max_metano: max(metano),
  });
}

writeFileSync(OUTPUT_PATH, JSON.stringify({ citta }, null, 0), 'utf-8');
console.log(`Salvate ${citta.length} città in ${OUTPUT_PATH}`);
