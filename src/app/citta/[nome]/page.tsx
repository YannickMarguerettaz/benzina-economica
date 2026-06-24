import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Distributore } from '@/lib/types';
import CittaClient from '@/components/CittaClient';

interface CittaDati {
  nome: string;
  slug: string;
  provincia: string;
  sigla: string;
  totale_distributori: number;
  media_benzina: number | null;
  media_diesel: number | null;
  media_gpl: number | null;
  media_metano: number | null;
  min_benzina: number | null;
  min_diesel: number | null;
  min_gpl: number | null;
  min_metano: number | null;
  max_benzina: number | null;
  max_diesel: number | null;
  max_gpl: number | null;
  max_metano: number | null;
}

function getCitta(): CittaDati[] {
  const path = join(process.cwd(), 'public', 'data', 'citta.json');
  return JSON.parse(readFileSync(path, 'utf-8')).citta;
}

function getDistributoriCitta(nome: string): Distributore[] {
  const path = join(process.cwd(), 'public', 'data', 'distributori.json');
  const tutti: Distributore[] = JSON.parse(readFileSync(path, 'utf-8')).distributori;
  return tutti.filter(
    d => d.comune && d.comune.trim().toUpperCase() === nome.toUpperCase() &&
      Object.keys(d.prezzi).length > 0
  );
}

export async function generateStaticParams() {
  const citta = getCitta();
  return citta.map(c => ({ nome: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nome: string }>;
}): Promise<Metadata> {
  const { nome: slug } = await params;
  const citta = getCitta();
  const c = citta.find(x => x.slug === slug);
  if (!c) return {};
  return {
    title: `Prezzi benzina ${c.nome} — Distributori più economici aggiornati`,
    description: `Prezzi benzina e diesel a ${c.nome} aggiornati ogni notte. Prezzo minimo benzina: ${c.min_benzina?.toFixed(3) ?? 'N/D'}€/L. Confronta ${c.totale_distributori} distributori e trova il più economico vicino a te.`,
  };
}

export default async function PaginaCitta({
  params,
}: {
  params: Promise<{ nome: string }>;
}) {
  const { nome: slug } = await params;
  const citta = getCitta();
  const c = citta.find(x => x.slug === slug);
  if (!c) notFound();

  const distributori = getDistributoriCitta(c.nome);
  const oggi = new Date().toISOString().slice(0, 10);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Prezzi benzina ${c.nome} — ${oggi}`,
    description: `Prezzi carburante aggiornati per ${c.totale_distributori} distributori a ${c.nome}. Prezzo minimo benzina: ${c.min_benzina?.toFixed(3) ?? 'N/D'}€/L, prezzo medio: ${c.media_benzina?.toFixed(3) ?? 'N/D'}€/L.`,
    url: `https://trovacarburante.com/citta/${c.slug}`,
    dateModified: oggi,
    creator: { '@type': 'Organization', name: 'TrovaCarburante', url: 'https://trovacarburante.com' },
    spatialCoverage: {
      '@type': 'Place',
      name: c.nome,
      address: { '@type': 'PostalAddress', addressLocality: c.nome, addressCountry: 'IT' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <CittaClient citta={c} distributori={distributori} />
    </>
  );
}
