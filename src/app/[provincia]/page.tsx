import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import DistributoreCard from '@/components/DistributoreCard';
import { Distributore } from '@/lib/types';

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
    (d) => d.provincia.toUpperCase() === sigla.toUpperCase() && d.prezzi.benzina
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
  const ordinati = [...distributori]
    .sort((a, b) => (a.prezzi.benzina ?? 99) - (b.prezzi.benzina ?? 99))
    .slice(0, 20);

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Prezzi benzina a {prov.nome}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {prov.totale_distributori} distributori monitorati
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {prov.min_benzina && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{prov.min_benzina.toFixed(3)}€</div>
            <div className="text-sm text-green-600">min. benzina</div>
          </div>
        )}
        {prov.min_diesel && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{prov.min_diesel.toFixed(3)}€</div>
            <div className="text-sm text-blue-600">min. diesel</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">I più economici (benzina)</h2>
        {ordinati.map((d, i) => (
          <DistributoreCard
            key={d.id}
            distributore={{ ...d, distanzaKm: 0 }}
            carburante="benzina"
            rank={i}
          />
        ))}
      </div>
    </main>
  );
}
