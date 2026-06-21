import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Distributore } from '@/lib/types';
import ProvinciaClient from '@/components/ProvinciaClient';

interface Provincia {
  sigla: string;
  nome: string;
  slug: string;
  totale_distributori: number;
  media_benzina: number | null;
  media_diesel: number | null;
  min_benzina: number | null;
  min_diesel: number | null;
  max_benzina: number | null;
  max_diesel: number | null;
}

function getProvince(): Provincia[] {
  const path = join(process.cwd(), 'public', 'data', 'province.json');
  return JSON.parse(readFileSync(path, 'utf-8')).province;
}

function getDistributoriProvincia(sigla: string): Distributore[] {
  const path = join(process.cwd(), 'public', 'data', 'distributori.json');
  const tutti: Distributore[] = JSON.parse(readFileSync(path, 'utf-8')).distributori;
  return tutti.filter(
    (d) => d.provincia.toUpperCase() === sigla.toUpperCase() &&
      Object.keys(d.prezzi).length > 0
  );
}

export async function generateStaticParams() {
  const province = getProvince();
  return province.map((p) => ({ provincia: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ provincia: string }>;
}): Promise<Metadata> {
  const { provincia: slug } = await params;
  const province = getProvince();
  const prov = province.find((p) => p.slug === slug);
  if (!prov) return {};
  return {
    title: `Prezzi benzina ${prov.nome} — Distributori più economici aggiornati`,
    description: `Prezzi benzina e diesel a ${prov.nome} aggiornati ogni notte. Prezzo minimo benzina: ${prov.min_benzina?.toFixed(3) ?? 'N/D'}€/L. Confronta ${prov.totale_distributori} distributori e trova il più economico vicino a te.`,
  };
}

export default async function PaginaProvincia({
  params,
}: {
  params: Promise<{ provincia: string }>;
}) {
  const { provincia: slug } = await params;
  const province = getProvince();
  const prov = province.find((p) => p.slug === slug);
  if (!prov) notFound();

  const distributori = getDistributoriProvincia(prov.sigla);
  const oggi = new Date().toISOString().slice(0, 10);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Prezzi benzina ${prov.nome} — ${oggi}`,
    description: `Prezzi carburante aggiornati per ${prov.totale_distributori} distributori nella provincia di ${prov.nome}. Prezzo minimo benzina: ${prov.min_benzina?.toFixed(3) ?? 'N/D'}€/L, prezzo medio: ${prov.media_benzina?.toFixed(3) ?? 'N/D'}€/L.`,
    url: `https://trovacarburante.com/${prov.slug}`,
    dateModified: oggi,
    creator: {
      '@type': 'Organization',
      name: 'TrovaCarburante',
      url: 'https://trovacarburante.com',
    },
    spatialCoverage: {
      '@type': 'Place',
      name: prov.nome,
      address: { '@type': 'PostalAddress', addressRegion: prov.nome, addressCountry: 'IT' },
    },
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Prezzo minimo benzina', value: prov.min_benzina, unitCode: 'EUR' },
      { '@type': 'PropertyValue', name: 'Prezzo medio benzina', value: prov.media_benzina, unitCode: 'EUR' },
      { '@type': 'PropertyValue', name: 'Prezzo massimo benzina', value: prov.max_benzina, unitCode: 'EUR' },
      { '@type': 'PropertyValue', name: 'Totale distributori', value: prov.totale_distributori },
    ],
  };

  const diffCentesimi = prov.min_benzina && prov.max_benzina
    ? ((prov.max_benzina - prov.min_benzina) * 100).toFixed(1)
    : null;
  const risparmio = prov.min_benzina && prov.max_benzina
    ? ((prov.max_benzina - prov.min_benzina) * 50).toFixed(1)
    : null;
  const risparmioAnnuale = risparmio ? Math.round(parseFloat(risparmio) * 15) : null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      prov.media_benzina && {
        '@type': 'Question',
        name: `Qual è il prezzo medio della benzina a ${prov.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Oggi a ${prov.nome} il prezzo medio della benzina è ${prov.media_benzina.toFixed(3)}€/L${prov.min_benzina && prov.max_benzina ? `, con un minimo di ${prov.min_benzina.toFixed(3)}€/L e un massimo di ${prov.max_benzina.toFixed(3)}€/L tra i ${prov.totale_distributori} distributori monitorati.` : '.'}`,
        },
      },
      prov.min_benzina && {
        '@type': 'Question',
        name: `Dove trovo la benzina più economica a ${prov.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Il distributore più economico a ${prov.nome} pratica ${prov.min_benzina.toFixed(3)}€/L. Puoi vedere tutti i distributori ordinati per prezzo su TrovaCarburante.`,
        },
      },
      risparmio && risparmioAnnuale && {
        '@type': 'Question',
        name: `Quanto risparmio scegliendo il distributore più economico a ${prov.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `La differenza tra il distributore più economico e quello più caro a ${prov.nome} è di ${diffCentesimi} centesimi al litro. Su un pieno da 50 litri sono circa ${risparmio}€. In un anno il risparmio può arrivare a ~${risparmioAnnuale}€.`,
        },
      },
      {
        '@type': 'Question',
        name: `Con quale frequenza vengono aggiornati i prezzi a ${prov.nome}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I prezzi vengono aggiornati ogni notte alle 03:00 con i dati ufficiali del Ministero delle Imprese e del Made in Italy (MISE).',
        },
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProvinciaClient prov={prov} distributori={distributori} />
    </>
  );
}
