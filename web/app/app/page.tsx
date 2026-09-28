import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Revelar from '@/components/Revelar';
import { SITIO, waLink } from '@/lib/sitio';

export const metadata: Metadata = {
  title: 'La app para modistas y costureras',
  description: 'TEXMA ordena tu taller de costura: medidas por clienta con calculadora de patrón, entregas con alarma, cobros, stock de mercería y finanzas. Funciona sin internet.',
  alternates: { canonical: '/app' },
};

const FUNCIONES = [
  { t: 'Medidas por clienta', d: 'Cada proyecto guarda sus medidas en cm con la calculadora de patrón al lado (÷2, ÷4), el maniquí de referencia y hasta 4 fotos.', e: '📏' },
  { t: 'Entregas que no se olvidan', d: 'Agenda por semana o mes con alarmas en el celular, aunque la app esté cerrada. Sabés qué entregás hoy y qué quedó sin retirar.', e: '📅' },
  { t: 'Cobros y señas', d: 'Precio, seña, saldo y materiales de cada trabajo. Al marcarlo cobrado entra solo como ingreso en tus finanzas.', e: '💳' },
  { t: 'Tu mercería con stock', d: 'Cintas, cierres y botones con precio por metro o unidad, alertas de reposición y balance de ventas por mes.', e: '🧵' },
  { t: 'Finanzas reales', d: 'Balance acumulado mes a mes, gastos fijos con aviso y metas de ahorro con foto.', e: '💰' },
  { t: 'Tus datos, tuyos', d: 'Todo queda en tu celular: funciona sin internet y exportás una copia de seguridad cuando quieras.', e: '🔒' },
];

const PASOS = [
  'Escribinos por WhatsApp y te pasamos el precio (pago único, sin suscripción).',
  'Te mandamos un link con tu código y la descarga para Android, iPhone o compu.',
  'Abrís TEXMA, pegás el código y listo: queda activada en tu celular.',
];

export default function PaginaApp() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-28">
      <Revelar>
        <p className="kicker text-rosa">La app</p>
        <h1 className="titulo mt-3 max-w-3xl text-5xl md:text-7xl">El planner que entiende a las modistas.</h1>
        <p className="mt-5 max-w-2xl text-lg text-tinta-suave">
          TEXMA junta en un solo lugar lo que hoy tenés repartido entre cuadernos, planillas y el WhatsApp: medidas, entregas, cobros, stock y plata.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={SITIO.pwa} className="rounded-full bg-rosa px-7 py-4 font-bold text-white">Abrir TEXMA</a>
          <a href={waLink('¡Hola! Quiero comprar la app TEXMA.')} target="_blank" rel="noopener" className="rounded-full border border-linea bg-papel px-7 py-4 font-bold">Comprar por WhatsApp</a>
        </div>
      </Revelar>

      <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Funciones">
        {FUNCIONES.map((f, i) => (
          <Revelar key={f.t} delay={(i % 3) * 0.07}>
            <article className="h-full rounded-3xl border border-linea bg-papel p-7">
              <span className="text-3xl" aria-hidden="true">{f.e}</span>
              <h2 className="mt-4 text-xl font-bold">{f.t}</h2>
              <p className="mt-2 leading-relaxed text-tinta-suave">{f.d}</p>
            </article>
          </Revelar>
        ))}
      </section>

      <section className="mt-24" aria-labelledby="como">
        <Revelar><h2 id="como" className="titulo text-4xl md:text-5xl">Cómo la conseguís</h2></Revelar>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <Revelar key={i} delay={i * 0.08}>
              <li className="h-full rounded-3xl bg-tinta p-7 text-papel">
                <span className="font-mono text-sm text-rosa-claro">Paso {i + 1}</span>
                <p className="mt-3 text-lg leading-snug">{p}</p>
              </li>
            </Revelar>
          ))}
        </ol>
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
