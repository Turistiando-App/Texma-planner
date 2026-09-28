# TEXMA · sitio público + mercería

Next.js (App Router) + Tailwind CSS v4 + Framer Motion + Supabase.
Vive en `web/` del mismo repo que la PWA, pero se despliega como **otro
proyecto de Vercel** (la raíz del repo es la PWA + `/api` de licencias).

## Arrancar

```bash
cd web
npm install
cp .env.example .env.local     # opcional: sin Supabase usa los 50 productos de ejemplo
npm run dev                    # http://localhost:3000
```

## Estructura

```
web/
├─ app/
│  ├─ layout.tsx              fuentes, metadatos, fondo flotante, stock en vivo, JSON-LD Organization
│  ├─ page.tsx                Home: hero · valor · 11 destacados · descarga app · FAQ · CTA
│  ├─ merceria/page.tsx       catálogo (50 productos) con filtros
│  ├─ merceria/[slug]/        ficha de producto + JSON-LD Product + pedir por WhatsApp
│  ├─ app/page.tsx            /app · funciones de la app para modistas
│  ├─ blog/ · blog/[slug]/    guías (JSON-LD Article + FAQPage)
│  ├─ contacto/page.tsx       formulario → WhatsApp de ventas
│  ├─ sitemap.ts · robots.ts  SEO
│  └─ llms.txt/route.ts       resumen para asistentes de IA (AEO)
├─ components/
│  ├─ HeroHilo.tsx            hero sticky: el hilo pasa por el ojo de las agujas con el scroll
│  ├─ FondoCostura.tsx        carretes/agujas/botones flotando con parallax
│  ├─ Catalogo.tsx            filtros: categoría → subcategoría, precio, búsqueda, orden (en la URL)
│  ├─ StockEnVivo.tsx         Supabase Realtime → stock de las tarjetas al instante
│  ├─ ProductoCard · FAQ · Revelar · Header · Footer · ContactoForm · JsonLd
│  └─ dibujos.tsx             SVG de carrete/aguja/botón/cierre/elástico (foto de respaldo)
├─ content/                   blog.ts (artículos) · faq.ts
├─ lib/                       productos.ts (lectura + respaldo) · supabase.ts · sitio.ts · tipos.ts
├─ data/productos.json        50 productos de ejemplo (generados)
├─ scripts/generar-productos.mjs   → data/productos.json + supabase/productos_seed.sql
└─ supabase/                  productos.sql (tabla + RLS + realtime) · productos_seed.sql
```

## Supabase

1. SQL Editor → `supabase/productos.sql` (tabla `productos`, lectura pública solo de lo activo, realtime).
2. SQL Editor → `supabase/productos_seed.sql` (los 50 de ejemplo).
3. En Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la **anon**, nunca la service_role).

Las páginas se regeneran cada 60 s (ISR) y el stock fino llega en tiempo real por Realtime.
Si Supabase no está configurado o falla, el sitio usa `data/productos.json`.

## Deploy en Vercel

Nuevo proyecto → mismo repo → **Root Directory: `web`** → Framework: Next.js.
Variables: las del `.env.example`. Dominio sugerido: el principal (`texma.com.ar`) para el sitio
y un subdominio (`app.texma.com.ar`) para la PWA; poné esa URL en `NEXT_PUBLIC_PWA_URL`.

## Agregar contenido

- **Artículo del blog:** un objeto más en `content/blog.ts` (resumen + secciones + faq).
- **Productos:** en Supabase (o editar la lista de `scripts/generar-productos.mjs` y correr `npm run productos`).
