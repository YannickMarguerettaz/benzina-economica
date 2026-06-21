import { readFileSync } from 'fs';
import { join } from 'path';
import type { MetadataRoute } from 'next';

interface Provincia {
  slug: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const province: Provincia[] = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'province.json'), 'utf-8')
  ).province;

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
    ...province.map((p) => ({
      url: `https://trovacarburante.com/${p.slug}`,
      lastModified: oggi,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
}
