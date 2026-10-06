import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import BlogGrid from '@/components/BlogGrid';
import JsonLd from '@/components/JsonLd';
import Revelar from '@/components/Revelar';
import { ARTICULOS, CATEGORIAS } from '@/content/blog';
import { SITIO } from '@/lib/sitio';

const TITULO = 'Blog de costura, patronaje y diseño de indumentaria';
const DESCRIPCION = 'Guías de diseño de indumentaria, patronaje, moldería digital, upcycling, asesoría de imagen y tendencias textiles, más un planner para modistas. Escrito por TEXMA.';

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  keywords: [
    'diseño de indumentaria', 'asesoría de imagen', 'upcycling', 'moldería digital', 'patronaje',
    'tendencias textiles', 'planner para modistas', 'costura', 'modistas', 'mercería',
  ],
  alternates: { canonical: '/blog' },
  openGraph: { type: 'website', title: TITULO, description: DESCRIPCION, url: '/blog' },
};

const fecha = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Blog() {
  const lista = [...ARTICULOS].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const hero = lista.find(a => a.destacado) ?? lista[0];
  const resto = lista.filter(a => a !== hero);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28">
      <Revelar>
        <p className="kicker text-rosa">Blog TEXMA</p>
        <h1 className="titulo mt-3 max-w-4xl text-5xl leading-[1.02] md:text-6xl">
          Costura, patronaje y diseño de indumentaria
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-tinta-suave">
          Guías prácticas para modistas y costureras: moldería digital, upcycling, asesoría de imagen, tendencias textiles y cómo organizar tu taller.
        </p>
      </Revelar>

      {/* ---- post destacado ---- */}
      <Revelar>
        <Link href={`/blog/${hero.slug}`}
          className="group mt-12 grid overflow-hidden rounded-[2rem] border border-linea bg-papel transition hover:shadow-[0_24px_60px_-20px_rgba(43,38,34,.25)] md:grid-cols-[1.25fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[420px]">
            <Image src={hero.imagen.src} alt={hero.imagen.alt} fill priority sizes="(min-width:768px) 640px, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-rosa px-3 py-1 text-xs font-bold text-white">Destacado</span>
              <span className="rounded-full bg-rosa-claro px-3 py-1 text-xs font-bold text-rosa-oscuro">{hero.categoria}</span>
            </div>
            <h2 className="titulo mt-4 text-4xl leading-[1.05] group-hover:text-rosa md:text-5xl">{hero.titulo}</h2>
            <p className="mt-4 leading-relaxed text-tinta-suave">{hero.resumen}</p>
            <p className="kicker mt-6 text-tinta-suave"><time dateTime={hero.fecha}>{fecha(hero.fecha)}</time> · {hero.lectura} min de lectura</p>
            <span className="mt-6 inline-flex w-fit rounded-full bg-tinta px-6 py-3 text-sm font-bold text-papel transition group-hover:bg-rosa">Leer el artículo</span>
          </div>
        </Link>
      </Revelar>

      {/* ---- grilla con chips ---- */}
      <section className="mt-16" aria-labelledby="todos">
        <h2 id="todos" className="titulo text-3xl md:text-4xl">Todos los artículos</h2>
        <div className="mt-6">
          <BlogGrid articulos={resto} categorias={[...new Set(resto.map(a => a.categoria))]} />
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Blog', name: TITULO, description: DESCRIPCION,
        url: `${SITIO.url}/blog`, inLanguage: 'es-AR',
        publisher: { '@type': 'Organization', name: 'TEXMA', url: SITIO.url, logo: `${SITIO.url}/logo-texma.png` },
        about: CATEGORIAS.map(c => ({ '@type': 'Thing', name: c })),
        blogPost: lista.map(a => ({
          '@type': 'BlogPosting', headline: a.titulo, description: a.descripcion, datePublished: a.fecha,
          url: `${SITIO.url}/blog/${a.slug}`, image: a.imagen.src, articleSection: a.categoria, keywords: a.etiquetas.join(', '),
        })),
      }} />
    </div>
  );
}
