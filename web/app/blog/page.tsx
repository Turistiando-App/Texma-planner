import type { Metadata } from 'next';
import Link from 'next/link';
import Revelar from '@/components/Revelar';
import { ARTICULOS } from '@/content/blog';

export const metadata: Metadata = {
  title: 'Blog de costura: guías y paso a paso',
  description: 'Guías prácticas de costura: qué hilo usar, cómo poner un cierre invisible, cómo tomar medidas y más, explicadas por modistas.',
  alternates: { canonical: '/blog' },
};

const fecha = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Blog() {
  const lista = [...ARTICULOS].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <div className="mx-auto max-w-4xl px-5 pt-28">
      <p className="kicker text-rosa">Blog</p>
      <h1 className="titulo mt-3 text-5xl md:text-6xl">Costura, paso a paso</h1>
      <div className="mt-12 space-y-5">
        {lista.map((a, i) => (
          <Revelar key={a.slug} delay={i * 0.06}>
            <Link href={`/blog/${a.slug}`} className="group block rounded-3xl border border-linea bg-papel p-7 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(43,38,34,.08)]">
              <p className="kicker text-tinta-suave">{fecha(a.fecha)} · {a.lectura} min</p>
              <h2 className="titulo mt-2 text-3xl group-hover:text-rosa">{a.titulo}</h2>
              <p className="mt-3 leading-relaxed text-tinta-suave">{a.descripcion}</p>
            </Link>
          </Revelar>
        ))}
      </div>
    </div>
  );
}
