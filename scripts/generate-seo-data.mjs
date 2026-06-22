import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INPUT_PATH = join(__dirname, '..', 'public', 'data', 'distributori.json');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'province.json');

const PROVINCE_NOMI = {
  AG: 'Agrigento', AL: 'Alessandria', AN: 'Ancona', AO: 'Aosta',
  AR: 'Arezzo', AP: 'Ascoli Piceno', AT: 'Asti', AV: 'Avellino',
  BA: 'Bari', BT: 'Barletta-Andria-Trani', BL: 'Belluno', BN: 'Benevento',
  BG: 'Bergamo', BI: 'Biella', BO: 'Bologna', BZ: 'Bolzano',
  BS: 'Brescia', BR: 'Brindisi', CA: 'Cagliari', CL: 'Caltanissetta',
  CB: 'Campobasso', CE: 'Caserta', CT: 'Catania', CZ: 'Catanzaro',
  CH: 'Chieti', CO: 'Como', CS: 'Cosenza', CR: 'Cremona',
  KR: 'Crotone', CN: 'Cuneo', EN: 'Enna', FM: 'Fermo',
  FE: 'Ferrara', FI: 'Firenze', FG: 'Foggia', FC: 'Forli-Cesena',
  FR: 'Frosinone', GE: 'Genova', GO: 'Gorizia', GR: 'Grosseto',
  IM: 'Imperia', IS: 'Isernia', SP: 'La Spezia', AQ: 'LAquila',
  LT: 'Latina', LE: 'Lecce', LC: 'Lecco', LI: 'Livorno',
  LO: 'Lodi', LU: 'Lucca', MC: 'Macerata', MN: 'Mantova',
  MS: 'Massa-Carrara', MT: 'Matera', ME: 'Messina', MI: 'Milano',
  MO: 'Modena', MB: 'Monza-e-Brianza', NA: 'Napoli', NO: 'Novara',
  NU: 'Nuoro', OR: 'Oristano', PD: 'Padova', PA: 'Palermo',
  PR: 'Parma', PV: 'Pavia', PG: 'Perugia', PU: 'Pesaro-e-Urbino',
  PE: 'Pescara', PC: 'Piacenza', PI: 'Pisa', PT: 'Pistoia',
  PN: 'Pordenone', PZ: 'Potenza', PO: 'Prato', RG: 'Ragusa',
  RA: 'Ravenna', RC: 'Reggio-Calabria', RE: 'Reggio-Emilia', RI: 'Rieti',
  RN: 'Rimini', RM: 'Roma', RO: 'Rovigo', SA: 'Salerno',
  SS: 'Sassari', SV: 'Savona', SI: 'Siena', SR: 'Siracusa',
  SO: 'Sondrio', TA: 'Taranto', TE: 'Teramo', TR: 'Terni',
  TO: 'Torino', TP: 'Trapani', TN: 'Trento', TV: 'Treviso',
  TS: 'Trieste', UD: 'Udine', VA: 'Varese', VE: 'Venezia',
  VB: 'Verbano-Cusio-Ossola', VC: 'Vercelli', VR: 'Verona',
  VV: 'Vibo-Valentia', VI: 'Vicenza', VT: 'Viterbo',
};

function generaSlug(sigla) {
  const nome = PROVINCE_NOMI[sigla.toUpperCase()] ?? sigla;
  return nome.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[àáâã]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9-]/g, '');
}

const data = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));
const distributori = data.distributori;

const perProvincia = {};
for (const d of distributori) {
  const sigla = (d.provincia ?? '').toUpperCase();
  if (!sigla || !d.prezzi || Object.keys(d.prezzi).length === 0) continue;
  if (!perProvincia[sigla]) perProvincia[sigla] = [];
  perProvincia[sigla].push(d);
}

const province = [];
for (const [sigla, lista] of Object.entries(perProvincia)) {
  const benzine = lista.map(d => d.prezzi.benzina).filter(Boolean);
  const diesel = lista.map(d => d.prezzi.diesel).filter(Boolean);
  const gpl = lista.map(d => d.prezzi.gpl).filter(Boolean);
  const metano = lista.map(d => d.prezzi.metano).filter(Boolean);
  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 1000) / 1000 : null;
  const min = (arr) => arr.length ? Math.round(Math.min(...arr) * 1000) / 1000 : null;
  const max = (arr) => arr.length ? Math.round(Math.max(...arr) * 1000) / 1000 : null;
  province.push({
    sigla,
    nome: PROVINCE_NOMI[sigla] ?? sigla,
    slug: generaSlug(sigla),
    totale_distributori: lista.length,
    media_benzina: avg(benzine),
    media_diesel: avg(diesel),
    media_gpl: avg(gpl),
    media_metano: avg(metano),
    min_benzina: min(benzine),
    min_diesel: min(diesel),
    max_benzina: max(benzine),
    max_diesel: max(diesel),
  });
}

writeFileSync(OUTPUT_PATH, JSON.stringify({ province }, null, 0), 'utf-8');
console.log(`Salvate ${province.length} province in ${OUTPUT_PATH}`);
