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

  return <ProvinciaClient prov={prov} distributori={distributori} />;
}
