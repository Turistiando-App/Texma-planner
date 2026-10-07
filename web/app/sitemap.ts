import type { MetadataRoute } from 'next';
import { ARTICULOS } from '@/content/blog';
import { getProductos } from '@/lib/productos';
import { SITIO } from '@/lib/sitio';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => `${SITIO.url}${p}`;
  const productos = await getProductos();
  return [
    { url: u('/'), changeFrequency: 'weekly', priority: 1 },
    { url: u('/merceria'), changeFrequency: 'daily', priority: 0.9 },
    { url: u('/planner'), changeFrequency: 'monthly', priority: 0.8 },
    { url: u('/blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: u('/contacto'), changeFrequency: 'yearly', priority: 0.5 },
    ...productos.map(p => ({ url: u(`/merceria/${p.slug}`), changeFrequency: 'daily' as const, priority: 0.6 })),
    ...ARTICULOS.map(a => ({ url: u(`/blog/${a.slug}`), lastModified: a.fecha, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
