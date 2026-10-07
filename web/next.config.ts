import type { NextConfig } from 'next';

/* La PWA (TEXMA Planner) vive en /app de este mismo proyecto: un solo
   dominio para la web, el login, la app y la API de licencias.
   Los archivos los genera scripts/copiar-pwa.mjs en public/app/. */
const NO_CACHE = 'no-cache, no-store, must-revalidate';

const config: NextConfig = {
  images: {
    /* fotos de productos desde el Storage de Supabase */
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      /* fotos de los artículos del blog */
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return [
      /* /app es la PWA (la landing de la app pasó a /planner) */
      { source: '/app', destination: '/app/index.html' },
      /* link de entrega de licencias: /d/<token> (lo arma el panel) */
      { source: '/d/:token', destination: '/api/claim/:token' },
    ];
  },
  async headers() {
    return [
      /* el SW está en /app/sw.js pero controla /app (sin barra): hay que permitirlo */
      { source: '/app/sw.js', headers: [{ key: 'Service-Worker-Allowed', value: '/app' }, { key: 'Cache-Control', value: NO_CACHE }] },
      /* la página y el manifest siempre frescos: si no, una versión nueva no se ve */
      { source: '/app', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/app/index.html', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/app/manifest.json', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
    ];
  },
};

export default config;
