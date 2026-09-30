import Link from 'next/link';
import Beneficios from '@/components/Beneficios';
import FAQ from '@/components/FAQ';
import HeroApp from '@/components/HeroApp';
import JsonLd from '@/components/JsonLd';
import ProductoCard from '@/components/ProductoCard';
import Revelar from '@/components/Revelar';
import { FAQ_HOME } from '@/content/faq';
import { getDestacados } from '@/lib/productos';
import { SITIO, waLink, WA_COMPRAR_APP } from '@/lib/sitio';

export const revalidate = 60;

export default async function Home() {
  const destacados = await getDestacados(11);
  return (
    <>
      <HeroApp />

      {/* ---- beneficios: foto + tarjetas que aparecen al scrollear ---- */}
      <Beneficios />

      {/* ---- destacados: 11 productos + tarjeta «ver todo» = 12 (3 filas de 4) ---- */}
      <section className="mx-auto max-w-6xl px-5 py-10" aria-labelledby="destacados">
        <Revelar className="flex items-end justify-between gap-6">
          <div>
            <p className="kicker text-rosa">Mercería</p>
            <h2 id="destacados" className="titulo mt-3 text-4xl md:text-5xl">Lo más pedido</h2>
          </div>
          <Link href="/merceria" className="hidden font-bold text-rosa md:block">Ver los 50 productos →</Link>
        </Revelar>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {destacados.map((p, i) => (
            <Revelar key={p.slug} delay={(i % 4) * 0.06}><ProductoCard p={p} /></Revelar>
          ))}
          <Revelar delay={0.18}>
            <Link href="/merceria" className="flex h-full min-h-64 flex-col justify-between rounded-3xl bg-tinta p-6 text-papel transition hover:bg-rosa">
              <p className="kicker opacity-70">Catálogo completo</p>
              <p className="titulo text-3xl">Hilos, botones, cierres y elásticos →</p>
            </Link>
          </Revelar>
        </div>
      </section>

      {/* ---- descargá la app ---- */}
      <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="descarga">
        <Revelar>
          <div className="grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-rosa p-8 text-white md:grid-cols-2 md:p-14">
            <div>
              <p className="kicker opacity-80">La app</p>
              <h2 id="descarga" className="titulo mt-3 text-4xl md:text-5xl">Tu taller, ordenado en el celular.</h2>
              <p className="mt-4 max-w-md opacity-90">Medidas por clienta, entregas con aviso, lo que te deben, tu stock de mercería y tus números. Sin internet y sin suscripción.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href={WA_COMPRAR_APP} target="_blank" rel="noopener"
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-rosa shadow-xl shadow-rosa-oscuro/40 transition hover:-translate-y-0.5 hover:bg-rosa-claro">
                  Comprar la app
                </a>
                <a href={SITIO.pwa} className="rounded-full border border-white/50 px-6 py-3.5 font-bold transition hover:bg-white/10">Probala ahora</a>
                <Link href="/app" className="px-2 py-3.5 font-bold underline-offset-4 hover:underline">Ver funciones</Link>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3 text-sm">
              {['📏 Medidas con calculadora de patrón', '📅 Agenda con alarmas', '🧵 Stock de mercería', '💰 Ventas y ganancia', '📷 Fotos de cada trabajo', '🔥 Racha y hábitos'].map(x => (
                <li key={x} className="rounded-2xl bg-white/15 p-4 font-semibold backdrop-blur">{x}</li>
              ))}
            </ul>
          </div>
        </Revelar>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mx-auto max-w-3xl px-5 py-10" aria-labelledby="faq">
        <Revelar>
          <p className="kicker text-center text-rosa">Preguntas frecuentes</p>
          <h2 id="faq" className="titulo mt-3 text-center text-4xl md:text-5xl">Lo que más nos preguntan</h2>
        </Revelar>
        <Revelar className="mt-8"><FAQ items={FAQ_HOME} /></Revelar>
        <JsonLd data={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQ_HOME.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
        }} />
      </section>

      {/* ---- CTA ---- */}
      <section className="mx-auto max-w-6xl px-5 pt-16">
        <Revelar>
          <div className="rounded-[2.5rem] border border-linea bg-papel p-10 text-center md:p-16">
            <h2 className="titulo mx-auto max-w-2xl text-4xl md:text-6xl">¿Arrancamos tu próximo proyecto?</h2>
            <p className="mx-auto mt-4 max-w-lg text-tinta-suave">Contanos qué estás cosiendo y te armamos el pedido con todo lo que necesitás.</p>
            <a href={waLink('¡Hola TEXMA! Quiero armar un pedido de mercería.')} target="_blank" rel="noopener"
              className="mt-8 inline-block rounded-full bg-rosa px-8 py-4 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.32)]">
              Escribinos por WhatsApp
            </a>
          </div>
        </Revelar>
      </section>
    </>
  );
}
