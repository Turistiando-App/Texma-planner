import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductoVisual } from '@/components/dibujos';
import JsonLd from '@/components/JsonLd';
import ProductoCard from '@/components/ProductoCard';
import { StockBadge } from '@/components/StockEnVivo';
import { getProducto, getProductos } from '@/lib/productos';
import { pesos, precioPor, SITIO, waLink } from '@/lib/sitio';

export const revalidate = 60;
type Params = Promise<{ slug: string }>;

/* las 50 fichas se pre-generan en el build (y se re-validan cada 60 s) */
export async function generateStaticParams() {
  return (await getProductos()).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProducto((await params).slug);
  if (!p) return {};
  return {
    title: p.titulo,
    description: `${p.titulo} a ${pesos(p.precio)} ${precioPor(p.unidad)}. ${p.categoria} · ${p.subcategoria}. Stock real y envíos a todo el país.`,
    alternates: { canonical: `/merceria/${p.slug}` },
  };
}

export default async function Ficha({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProducto(slug);
  if (!p) notFound();
  const parecidos = (await getProductos()).filter(x => x.categoria === p.categoria && x.slug !== p.slug).slice(0, 4);
  const msg = `¡Hola TEXMA! Quiero pedir: ${p.titulo} (${pesos(p.precio)} ${precioPor(p.unidad)}). ¿Cuántos ${p.unidad === 'mts' ? 'metros' : 'unidades'} hay?`;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28">
      <nav className="kicker text-tinta-suave" aria-label="Migas">
        <Link href="/merceria" className="hover:text-rosa">Mercería</Link> / <Link href={`/merceria?cat=${encodeURIComponent(p.categoria)}`} className="hover:text-rosa">{p.categoria}</Link>
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="grid aspect-square place-items-center rounded-[2.5rem] border border-linea bg-[radial-gradient(circle_at_50%_40%,#FFFFFF,#F3EEE5)]">
          <ProductoVisual p={p} />
        </div>
        <div className="flex flex-col">
          <p className="font-mono text-xs uppercase tracking-widest text-tinta-suave">{p.categoria} · {p.subcategoria}</p>
          <h1 className="titulo mt-2 text-4xl md:text-5xl">{p.titulo}</h1>
          <div className="mt-4"><StockBadge slug={p.slug} stock={p.stock} unidad={p.unidad} /></div>
          <p className="mt-6 font-mono text-4xl font-bold">{pesos(p.precio)}</p>
          <p className="font-mono text-sm text-rosa">Precio {precioPor(p.unidad)}</p>
          <p className="mt-6 leading-relaxed text-tinta-suave">{p.descripcion}</p>
          <a href={waLink(msg)} target="_blank" rel="noopener"
            className="mt-8 rounded-full bg-rosa px-8 py-4 text-center font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.32)]">
            Pedir por WhatsApp
          </a>
          <p className="mt-3 text-center text-xs text-tinta-suave">Te confirmamos stock, total y envío antes de pagar.</p>
        </div>
      </div>
      {parecidos.length > 0 && (
        <section className="mt-20">
          <h2 className="titulo text-3xl">También en {p.categoria.toLowerCase()}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{parecidos.map(x => <ProductoCard key={x.slug} p={x} />)}</div>
        </section>
      )}
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: p.titulo, description: p.descripcion,
        category: `${p.categoria} > ${p.subcategoria}`, brand: { '@type': 'Brand', name: 'TEXMA' },
        offers: {
          '@type': 'Offer', priceCurrency: 'ARS', price: p.precio, url: `${SITIO.url}/merceria/${p.slug}`,
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      }} />
    </div>
  );
}
