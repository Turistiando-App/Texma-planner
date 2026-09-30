import type { Metadata } from 'next';
import Catalogo from '@/components/Catalogo';
import JsonLd from '@/components/JsonLd';
import { getProductos } from '@/lib/productos';
import { SITIO } from '@/lib/sitio';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Mercería online: hilos, botones, cierres y elásticos',
  description: 'Catálogo de mercería con stock real: hilos de poliéster y overlock, botones, cierres invisibles y metálicos, elásticos por metro. Pedí por WhatsApp.',
  alternates: { canonical: '/merceria' },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function Merceria({ searchParams }: { searchParams: SP }) {
  const [productos, sp] = await Promise.all([getProductos(), searchParams]);
  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-28">
      <p className="kicker text-rosa">Mercería</p>
      <h1 className="titulo mt-3 text-5xl md:text-6xl">Todo para coser</h1>
      <p className="mt-4 max-w-2xl text-tinta-suave">
        {productos.length} productos con stock real. Buscá, elegí tu rubro y pedí por WhatsApp.
      </p>
      <div className="mt-8">
        <Catalogo productos={productos} inicial={{
          cat: uno(sp.cat), sub: uno(sp.sub), q: uno(sp.q), orden: uno(sp.orden) || undefined,
        }} />
      </div>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'ItemList', name: 'Mercería TEXMA',
        itemListElement: productos.slice(0, 50).map((p, i) => ({
          '@type': 'ListItem', position: i + 1, url: `${SITIO.url}/merceria/${p.slug}`, name: p.titulo,
        })),
      }} />
    </div>
  );
}
