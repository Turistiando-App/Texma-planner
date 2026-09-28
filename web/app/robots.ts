import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/sitio';

/* Todo abierto, también para los crawlers de IA (AEO): queremos que
   citen las guías del blog y el catálogo. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITIO.url}/sitemap.xml`,
    host: SITIO.url,
  };
}
