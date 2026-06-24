import { readFileSync } from 'fs';
import { join } from 'path';
import type { MetadataRoute } from 'next';

interface Provincia {
  slug: string;
}

interface Citta {
  slug: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const province: Provincia[] = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'province.json'), 'utf-8')
  ).province;

  const citta: Citta[] = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'citta.json'), 'utf-8')
  ).citta;

  const oggi = new Date().toISOString().slice(0, 10);

  return [
    {
      url: 'https://trovacarburante.com',
      lastModified: oggi,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://trovacarburante.com/province',
      lastModified: oggi,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...(['benzina', 'diesel', 'gpl', 'metano'] as const).map((c) => ({
      url: `https://trovacarburante.com/province/${c}`,
      lastModified: oggi,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...province.map((p) => ({
      url: `https://trovacarburante.com/${p.slug}`,
      lastModified: oggi,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...citta.map((c) => ({
      url: `https://trovacarburante.com/citta/${c.slug}`,
      lastModified: oggi,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ];
}
