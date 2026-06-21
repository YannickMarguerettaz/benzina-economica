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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ProvinciaClient prov={prov} distributori={distributori} />
    </>
  );
}
