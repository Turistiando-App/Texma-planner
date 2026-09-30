'use client';
/* ============================================================
   HERO · portada estilo SaaS
   ------------------------------------------------------------
   Fondo casi negro con un resplandor radial rosa/coral muy suave.
   Izquierda: texto + CTA. Derecha: la foto de la modista adelante y
   dos réplicas de pantallas de la app (Finanzas y ficha de un pedido)
   asomando por detrás en abanico, todo flotando en bucle con desfase.
   Las réplicas copian el CSS de la PWA con la paleta «rosa»
   (.card, .balance, .carry, .fin2, .catbar, .pdk, .pdt, .pdtag, .pdmed).
   Con «reducir movimiento» nada flota y todo muestra su estado final.
============================================================ */
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ChevronRight, MoveHorizontal, Ruler, Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { WA_COMPRAR_APP } from '@/lib/sitio';

const EASE = [0.22, 1, 0.36, 1] as const;
/* mismo formato que fMoney() de la app: «$ 1.284.600» */
const NF = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const plata = (n: number) => `$ ${NF.format(Math.round(n))}`;

/* bloque que entra con fade y después flota en bucle */
function Flotante({ delay, className, children }: { delay: number; className: string; children: React.ReactNode }) {
  const quieto = useReducedMotion();
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15 + delay * 0.35, ease: EASE }}>
      <motion.div
        animate={quieto ? undefined : { y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* número que sube rápido desde 0 al cargar */
function Contador({ valor, delay = 0.6 }: { valor: number; delay?: number }) {
  const quieto = useReducedMotion();
  const n = useMotionValue(quieto ? valor : 0);
  const txt = useTransform(n, plata);
  useEffect(() => {
    if (quieto) { n.set(valor); return; }
    const a = animate(n, valor, { duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] });
    return () => a.stop();
  }, [n, valor, delay, quieto]);
  return <motion.span>{txt}</motion.span>;
}

/* ---- tarjeta de Finanzas: réplica de la vista Finanzas de la PWA ---- */
const DETALLE = [
  { c: 'Costura', v: 386_400 },
  { c: 'Mercería', v: 112_000 },
  { c: 'Arreglos', v: 40_000 },
];
function TarjetaFinanzas() {
  const quieto = useReducedMotion();
  const tin = DETALLE.reduce((a, d) => a + d.v, 0), tout = 125_800, antes = 872_000;
  return (
    <div className="w-full rounded-[22px] border border-linea bg-papel px-4 py-3.5 text-tinta shadow-[0_30px_60px_-18px_rgba(0,0,0,.55)]">
      {/* .calhead */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-[9px] border border-linea"><ChevronLeft className="h-3.5 w-3.5" /></span>
        <span className="font-serif text-[17px] font-semibold italic">Septiembre 2026</span>
        <span className="grid h-7 w-7 place-items-center rounded-[9px] border border-linea"><ChevronRight className="h-3.5 w-3.5" /></span>
      </div>
      {/* .lbl + .balance */}
      <p className="mx-0.5 mb-1 font-mono text-[9px] uppercase tracking-[1.6px] text-tinta-suave">Balance real acumulado</p>
      <p className="font-serif text-[30px] font-bold italic leading-none tracking-[.5px] text-rosa-oscuro sm:text-[34px]">
        <Contador valor={antes + tin - tout} />
      </p>
      {/* .carry */}
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-tinta-suave">
        <span>Venía de antes <b className="font-mono text-tinta">{plata(antes)}</b></span>
        <span>Este mes <b className="font-mono text-rosa">+ {plata(tin - tout)}</b></span>
      </div>
      {/* .fin2 (Ingresos abierto = .fbox.on) */}
      <div className="mt-2.5 flex gap-2">
        <div className="flex-1 rounded-[14px] border border-[#F27BA6] bg-rosa-claro px-2.5 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[1.6px] text-tinta-suave">Ingresos ›</p>
          <b className="font-mono text-[12.5px]"><Contador valor={tin} delay={0.8} /></b>
        </div>
        <div className="flex-1 rounded-[14px] border border-linea bg-lino px-2.5 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[1.6px] text-tinta-suave">Gastos ›</p>
          <b className="font-mono text-[12.5px]">{plata(tout)}</b>
        </div>
      </div>
      {/* detalle de ingresos: .catbar con la barra que se llena sola */}
      <div className="mt-3 border-t border-linea pt-2">
        <p className="mx-0.5 mb-1 font-mono text-[9px] uppercase tracking-[1.6px] text-tinta-suave">Detalle de ingresos · 14</p>
        {DETALLE.map((d, i) => (
          <div key={d.c} className="flex items-center gap-2 py-1">
            <span className="w-[62px] truncate font-mono text-[10px] text-tinta-suave">{d.c}</span>
            <div className="h-[7px] flex-1 overflow-hidden rounded-full border border-linea bg-lino">
              <motion.i className="block h-full rounded-full bg-rosa"
                initial={{ width: quieto ? `${(d.v / DETALLE[0].v) * 100}%` : '0%' }}
                animate={{ width: `${(d.v / DETALLE[0].v) * 100}%` }}
                transition={{ duration: 1.4, delay: 1 + i * 0.18, ease: EASE }} />
            </div>
            <span className="min-w-[58px] text-right font-mono text-[10px]">{plata(d.v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- ficha de pedido: réplica del detalle de proyecto de la PWA ---- */
const MEDIDAS = [
  { l: 'Busto', v: 92, i: Shirt },
  { l: 'Cintura', v: 74, i: Ruler },
  { l: 'Cadera', v: 100, i: MoveHorizontal },
];
const ESTADOS = [
  { t: 'en proceso', c: 'border-[#F5B98C] bg-[#FDEBDD] text-[#B4531A]' },
  { t: 'terminado', c: 'border-[#A9D6BD] bg-[#E3F2EA] text-[#256B47]' },
];
function TarjetaPedido() {
  const quieto = useReducedMotion();
  const [e, setE] = useState(quieto ? 1 : 0);
  /* en proceso → terminado → en proceso… cada 3 s */
  useEffect(() => {
    if (quieto) { setE(1); return; }
    const id = setInterval(() => setE(v => 1 - v), 3000);
    return () => clearInterval(id);
  }, [quieto]);
  const est = ESTADOS[e];
  return (
    <div className="w-full rounded-[22px] border border-linea bg-papel px-4 py-3.5 text-tinta shadow-[0_30px_60px_-18px_rgba(0,0,0,.55)]">
      <p className="font-mono text-[9px] uppercase tracking-[1.4px] text-tinta-suave">Vestido · Sofía R.</p>
      <p className="mb-2 mt-1 font-serif text-[24px] font-bold italic leading-[1.05]">Vestido de fiesta</p>
      {/* .pdtags */}
      <div className="flex flex-wrap gap-1.5">
        <motion.span layout
          className={`relative overflow-hidden rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-bold tracking-[.5px] transition-colors duration-500 ${est.c}`}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={est.t} className="inline-flex items-center gap-1"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}>
              {e === 1 && <Check className="h-3 w-3" strokeWidth={3} />}{est.t}
            </motion.span>
          </AnimatePresence>
        </motion.span>
        <span className="rounded-full border border-linea bg-papel px-2.5 py-1 font-mono text-[9.5px] tracking-[.5px] text-tinta-suave">entrega vie 14</span>
        <span className="rounded-full border border-linea bg-papel px-2.5 py-1 font-mono text-[9.5px] tracking-[.5px] text-tinta-suave">saldo $ 45.000</span>
      </div>
      {/* .pdsec · .pdmed */}
      <p className="mx-0.5 mb-1.5 mt-3 font-mono text-[9px] uppercase tracking-[1.6px] text-tinta-suave">Medidas · cm</p>
      <div className="grid grid-cols-3 gap-1.5">
        {MEDIDAS.map(m => (
          <div key={m.l} className="rounded-xl bg-lino px-2 py-1.5">
            <span className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[.4px] text-tinta-suave">
              <m.i className="h-3 w-3 text-rosa" strokeWidth={2} />{m.l}
            </span>
            <b className="font-mono text-[15px]">{m.v}<small className="ml-0.5 text-[9px] font-normal text-tinta-suave">cm</small></b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroApp() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0E0A0B] text-white" aria-label="TEXMA, app para modistas y mercería">
      {/* resplandor de marca: muy sutil, dos focos radiales */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10
        bg-[radial-gradient(60%_55%_at_78%_45%,rgba(236,25,104,.22),transparent_70%),radial-gradient(40%_40%_at_10%_100%,rgba(166,16,72,.18),transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[.07]
        [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)]
        [background-size:56px_56px] [mask-image:radial-gradient(70%_60%_at_60%_40%,black,transparent)]" />

      <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-5 pb-16 pt-28 md:grid-cols-2 md:pt-24">
        {/* ---- texto + CTA ---- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          <h1 className="titulo text-5xl leading-[1.02] md:text-7xl">
            Coser es un arte.<br /><span className="text-rosa">Organizarlo, también.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base text-white/70 md:text-lg">
            TEXMA ordena las medidas, entregas, cobros y stock de tu taller en el celular. Y en la mercería
            tenés hilos, botones, cierres y elásticos con stock real.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={WA_COMPRAR_APP} target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-rosa px-7 py-4 font-bold text-white shadow-[0_14px_40px_-8px_rgba(236,25,104,.65)] transition hover:-translate-y-0.5 hover:bg-rosa-oscuro">
              Comprar la app <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href="/merceria"
              className="rounded-full border border-white/20 px-7 py-4 font-bold transition hover:border-white/50 hover:bg-white/5">
              Ver la mercería
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
            {['Pago único', 'Funciona sin internet', 'Android, iPhone y compu'].map(x => (
              <li key={x} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-rosa" aria-hidden="true" />{x}</li>
            ))}
          </ul>
        </motion.div>

        {/* ---- composición en abanico: las pantallas de la app asoman por detrás de la foto ----
             capas: finanzas z-10 · pedido z-20 · foto z-30 (adelante de todo).
             La foto va corrida a la derecha y las tarjetas salen por la izquierda,
             que es donde tienen su contenido (balance, estado, medidas). */}
        <div className="relative mx-auto h-[540px] w-full max-w-[540px] md:h-[620px]" aria-hidden="true">
          {/* halo detrás de todo, da la sensación de profundidad */}
          <div className="absolute left-1/2 top-1/2 z-0 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosa/25 blur-[90px]" />

          {/* finanzas: atrás de todo, arriba a la izquierda */}
          <Flotante delay={0} className="left-0 top-0 z-10 w-[64%] sm:w-[56%] max-w-[300px]">
            <div className="-rotate-6"><TarjetaFinanzas /></div>
          </Flotante>

          {/* ficha del pedido: segunda capa, abajo a la izquierda */}
          <Flotante delay={1.2} className="bottom-0 left-[2%] z-20 w-[66%] sm:w-[56%] max-w-[300px]">
            <div className="rotate-[5deg]"><TarjetaPedido /></div>
          </Flotante>

          {/* la foto: adelante de todo */}
          <Flotante delay={0.5} className="right-[4%] top-[12%] z-30 w-[54%]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] ring-1 ring-white/15 shadow-[-30px_40px_90px_-20px_rgba(0,0,0,.9)]">
              <Image src="/modista.jpg" alt="" fill priority
                sizes="(min-width: 768px) 292px, 54vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          </Flotante>
        </div>
      </div>
    </section>
  );
}
