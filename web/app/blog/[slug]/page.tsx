import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { ARTICULOS, getArticulo } from '@/content/blog';
import { SITIO } from '@/lib/sitio';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return ARTICULOS.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = getArticulo((await params).slug);
  if (!a) return {};
  return {
    title: a.titulo,
    description: a.descripcion,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: { type: 'article', publishedTime: a.fecha, title: a.titulo, description: a.descripcion },
  };
}

export default async function ArticuloPage({ params }: { params: Params }) {
  const a = getArticulo((await params).slug);
  if (!a) notFound();
  const url = `${SITIO.url}/blog/${a.slug}`;
  return (
    <article className="mx-auto max-w-3xl px-5 pt-28">
      <Link href="/blog" className="kicker text-tinta-suave hover:text-rosa">← Blog</Link>
      <h1 className="titulo mt-4 text-5xl leading-[1.05] md:text-6xl">{a.titulo}</h1>
      <p className="kicker mt-4 text-tinta-suave">
        <time dateTime={a.fecha}>{new Date(a.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</time> · {a.lectura} min de lectura
      </p>

      {/* respuesta directa arriba: es lo que citan Google y los asistentes de IA */}
      <p className="mt-8 rounded-3xl border-l-4 border-rosa bg-papel p-6 text-lg leading-relaxed">
        <strong>En corto: </strong>{a.resumen}
      </p>

      {a.secciones.map(s => (
        <section key={s.h2} className="mt-10">
          <h2 className="titulo text-3xl">{s.h2}</h2>
          {s.parrafos.map((t, i) => <p key={i} className="mt-4 leading-relaxed text-tinta-suave">{t}</p>)}
          {s.lista && (
            <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-tinta-suave marker:font-mono marker:text-rosa">
              {s.lista.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          )}
        </section>
      ))}

      <section className="mt-12" aria-labelledby="faq-art">
        <h2 id="faq-art" className="titulo text-3xl">Preguntas frecuentes</h2>
        <dl className="mt-5 space-y-4">
          {a.faq.map(f => (
            <div key={f.p} className="rounded-3xl border border-linea bg-papel p-5">
              <dt className="font-bold">{f.p}</dt>
              <dd className="mt-2 text-tinta-suave">{f.r}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-12 rounded-3xl bg-tinta p-7 text-papel">
        <p className="titulo text-2xl">¿Te falta algo para arrancar?</p>
        <p className="mt-2 opacity-80">Hilos, cierres, botones y elásticos con stock real.</p>
        <Link href="/merceria" className="mt-5 inline-block rounded-full bg-rosa px-6 py-3 font-bold text-white">Ver la mercería</Link>
      </div>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Article', headline: a.titulo, description: a.descripcion,
        datePublished: a.fecha, dateModified: a.fecha, inLanguage: 'es-AR', mainEntityOfPage: url,
        author: { '@type': 'Organization', name: 'TEXMA' }, publisher: { '@type': 'Organization', name: 'TEXMA' },
        keywords: a.etiquetas.join(', '), abstract: a.resumen,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: a.faq.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
      }} />
    </article>
  );
}
