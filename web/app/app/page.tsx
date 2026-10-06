import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CineApp from '@/components/app/CineApp';
import FraseRotativa from '@/components/app/FraseRotativa';
import ScrollIphone from '@/components/app/ScrollIphone';
import JsonLd from '@/components/JsonLd';
import Revelar from '@/components/Revelar';
import { SITIO, WA_COMPRAR_APP } from '@/lib/sitio';

export const metadata: Metadata = {
  title: 'La app para modistas y costureras',
  description: 'TEXMA ordena tu taller de costura: medidas por clienta con calculadora de patrón, entregas con alarma, cobros, stock de mercería y finanzas. Funciona sin internet.',
  alternates: { canonical: '/app' },
};

const EXTRAS = [
  { t: 'Tu mercería con stock', d: 'Cintas, cierres y botones con precio por metro o unidad y alertas de reposición.', e: '🧵' },
  { t: 'Sin internet', d: 'Funciona en el taller aunque no haya señal. Tus datos quedan en tu celular.', e: '📶' },
  { t: 'Copia de seguridad', d: 'Exportás todo cuando quieras y lo pasás a otro celular.', e: '🔒' },
];

const PASOS = [
  'Escribinos por WhatsApp y te pasamos el precio (pago único, sin suscripción).',
  'Te mandamos un link con tu código y la descarga para Android, iPhone o compu.',
  'Abrís TEXMA, pegás el código y listo: queda activada en tu celular.',
];

/* /app es clara (lino) con contrastes fuertes. El hero lleva un degradado rosa
   pastel muy suave que se funde en el lino, con texto oscuro encima. */
export default function PaginaApp() {
  return (
    <div className="overflow-x-clip bg-lino text-gray-900">
      {/* ---- hero «cine» ---- */}
      <section className="bg-gradient-to-b from-pink-200 via-pink-100 via-55% to-lino" aria-labelledby="hero-app">
       <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 md:pb-20 md:pt-40">
        <Revelar className="text-center">
          <p className="font-mono text-xs uppercase tracking-[.25em] text-rosa-oscuro">TEXMA Planner</p>
          <h1 id="hero-app" className="mx-auto mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-gray-900 md:text-7xl">
            Medí, agendá y cobrá.<br /><FraseRotativa />
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-700">
            El planner que entiende a las modistas: medidas, entregas, cobros, stock y plata en un solo lugar.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href={WA_COMPRAR_APP} target="_blank" rel="noopener"
              className="rounded-full bg-gray-900 px-8 py-4 font-semibold text-white transition hover:bg-black">
              Comprar la app
            </a>
            <Link href="/login" className="inline-flex items-center gap-1.5 rounded-full px-5 py-4 font-semibold text-gray-900 transition hover:text-rosa">
              Abrir la app <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Revelar>
       </div>
       {/* el video sale del max-w del texto: casi todo el ancho en desktop */}
       <div className="px-3 pb-16 sm:px-5">
         <CineApp />
       </div>
      </section>

      {/* ---- scroll-telling con iPhone pegajoso ---- */}
      <div className="mt-16 md:mt-24">
        <ScrollIphone />
      </div>

      {/* ---- y además ---- */}
      <section className="mx-auto mt-24 max-w-6xl px-5" aria-labelledby="extras">
        <Revelar>
          <h2 id="extras" className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">Y además.</h2>
        </Revelar>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {EXTRAS.map((f, i) => (
            <Revelar key={f.t} delay={i * 0.07}>
              <article className="h-full rounded-3xl border border-linea bg-white p-7 shadow-[0_1px_2px_rgba(43,38,34,.04)] transition hover:border-rosa/40 hover:shadow-[0_18px_40px_-12px_rgba(43,38,34,.18)]">
                <span className="text-3xl" aria-hidden="true">{f.e}</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{f.t}</h3>
                <p className="mt-2 leading-relaxed text-tinta-suave">{f.d}</p>
              </article>
            </Revelar>
          ))}
        </div>
      </section>

      {/* ---- cómo la conseguís ---- */}
      <section className="mx-auto mt-32 max-w-6xl px-5" aria-labelledby="como">
        <Revelar>
          <h2 id="como" className="scroll-mt-24 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">Cómo la conseguís.</h2>
        </Revelar>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <Revelar key={i} delay={i * 0.08}>
              <li className="h-full rounded-3xl bg-tinta p-7 text-papel">
                <span className="font-mono text-sm text-rosa-claro">Paso {i + 1}</span>
                <p className="mt-3 text-lg leading-snug">{p}</p>
              </li>
            </Revelar>
          ))}
        </ol>
        <Revelar>
          <div className="mt-14 flex justify-center">
            <a href={WA_COMPRAR_APP} target="_blank" rel="noopener"
              className="rounded-full bg-rosa px-10 py-5 text-lg font-semibold text-white shadow-[0_20px_60px_-15px_rgba(236,25,104,.7)] transition hover:-translate-y-0.5 hover:bg-rosa-oscuro">
              Quiero TEXMA para mi taller
            </a>
          </div>
        </Revelar>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'TEXMA',
        applicationCategory: 'BusinessApplication', operatingSystem: 'Android, iOS, Web',
        description: 'Planner para modistas: medidas, entregas, cobros, stock de mercería y finanzas.',
        offers: { '@type': 'Offer', priceCurrency: 'ARS' }, url: `${SITIO.url}/app`,
      }} />
    </div>
  );
}
