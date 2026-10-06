'use client';
/* ============================================================
   SCROLL-TELLING · iPhone pegajoso que cambia de pantalla
   ------------------------------------------------------------
   Izquierda: un bloque de texto por función (9), cada uno de alto de
   pantalla. Derecha (lg+): un iPhone sticky. useScroll mide el avance
   por toda la sección y cada pantalla tiene su tramo de opacidad, con
   un crossfade corto entre tramos. Los tramos se calculan a partir de
   N, así que sumar o sacar pasos no requiere tocar nada más.
   En mobile no hay sticky: cada bloque lleva su iPhone debajo.
   Si un PNG todavía no está, se ve el degradado con el nombre.
============================================================ */
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  CalendarClock, Dumbbell, LineChart, Package, Pill, Scissors, ShoppingCart, Sparkles, TrendingUp, type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

type Paso = { id: string; kicker: string; t: string; d: string; img: string; i: LucideIcon; tono: string };

const PASOS: Paso[] = [
  {
    id: 'costura', kicker: 'Costura', i: Scissors, img: '/mockup-costura.png', tono: 'from-[#3A0F20] to-[#0A0A0A]',
    t: 'Cada clienta, con sus medidas a mano.',
    d: 'Guardá las medidas en cm con la calculadora de patrón al lado (÷2, ÷4), el maniquí de referencia y hasta 4 fotos por trabajo.',
  },
  {
    id: 'inversiones', kicker: 'Inversiones', i: TrendingUp, img: '/mockup-inversiones.png', tono: 'from-[#0F2233] to-[#0A0A0A]',
    t: 'Lo que ahorrás, creciendo.',
    d: 'Anotá tus ahorros e inversiones y mirá cuánto rinden mes a mes, sin planillas.',
  },
  {
    id: 'compras', kicker: 'Lista de compras', i: ShoppingCart, img: '/mockup-compras.png', tono: 'from-[#2A2410] to-[#0A0A0A]',
    t: 'Nada se te olvida en la tienda.',
    d: 'Armá la lista mientras trabajás y tachá lo que ya compraste. Siempre en el bolsillo.',
  },
  {
    id: 'entrenamiento', kicker: 'Entrenamiento', i: Dumbbell, img: '/mockup-entrenamiento.png', tono: 'from-[#102A2A] to-[#0A0A0A]',
    t: 'Un rato para vos.',
    d: 'Rutinas simples y un registro de tus días de ejercicio, para cuidar la espalda después de tantas horas en la máquina.',
  },
  {
    id: 'merceria', kicker: 'Mercería y stock', i: Package, img: '/mockup-merceria.png', tono: 'from-[#2A1030] to-[#0A0A0A]',
    t: 'Tu mercería, siempre contada.',
    d: 'Cintas, cierres y botones con precio por metro o unidad y alertas cuando algo se está por terminar.',
  },
  {
    id: 'tratamientos', kicker: 'Tratamientos', i: Sparkles, img: '/mockup-tratamientos.png', tono: 'from-[#33101F] to-[#0A0A0A]',
    t: 'Tus cuidados, al día.',
    d: 'Seguí tratamientos de belleza o salud con sus sesiones y fechas, todo en el mismo lugar.',
  },
  {
    id: 'remedios', kicker: 'Remedios', i: Pill, img: '/mockup-remedios.png', tono: 'from-[#0F2A1A] to-[#0A0A0A]',
    t: 'Cada toma, a su hora.',
    d: 'Cargá tus remedios con dosis y horario, y la app te avisa cuando toca.',
  },
  {
    id: 'agenda', kicker: 'Agenda', i: CalendarClock, img: '/mockup-agenda.png', tono: 'from-[#0F2A22] to-[#0A0A0A]',
    t: 'Entregas que no se te pasan.',
    d: 'Vista por semana o mes y alarmas en el celular aunque la app esté cerrada. Sabés qué entregás hoy y qué quedó sin retirar.',
  },
  {
    id: 'finanzas', kicker: 'Finanzas', i: LineChart, img: '/mockup-finanzas.png', tono: 'from-[#2E1A0C] to-[#0A0A0A]',
    t: 'Tu plata, clara.',
    d: 'Señas, saldos, ventas de mercería y gastos fijos. Cada trabajo cobrado entra solo como ingreso y ves tu ganancia real mes a mes.',
  },
];

const N = PASOS.length;
/* cada bloque de texto queda centrado en pantalla cuando el avance vale i/(N-1);
   el cambio de pantalla cae a mitad de camino entre dos bloques */
const borde = (k: number) => (k - 0.5) / (N - 1);
const FUNDIDO = Math.min(0.05, 0.3 / (N - 1)); // medio ancho del crossfade, en fracción del scroll total

/* tramo de opacidad de la pantalla i: entra, queda, sale */
function rango(i: number): [number[], number[]] {
  if (N === 1) return [[0, 1], [1, 1]];
  const a = borde(i), b = borde(i + 1);
  if (i === 0) return [[0, b - FUNDIDO, b + FUNDIDO], [1, 1, 0]];
  if (i === N - 1) return [[a - FUNDIDO, a + FUNDIDO, 1], [0, 1, 1]];
  return [[a - FUNDIDO, a + FUNDIDO, b - FUNDIDO, b + FUNDIDO], [0, 1, 1, 0]];
}

function Pantalla({ paso, opacidad, escala }: { paso: Paso; opacidad?: MotionValue<number>; escala?: MotionValue<number> }) {
  const [sinImg, setSinImg] = useState(false);
  return (
    <motion.div style={{ opacity: opacidad, scale: escala }} className={`absolute inset-0 bg-gradient-to-b ${paso.tono}`}>
      {sinImg ? (
        <div className="grid h-full place-items-center p-6 text-center">
          <div>
            <paso.i className="mx-auto h-10 w-10 text-white/50" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-white/60">{paso.kicker}</p>
          </div>
        </div>
      ) : (
        <Image src={paso.img} alt={`Pantalla de ${paso.kicker} en TEXMA`} onError={() => setSinImg(true)}
          fill sizes="310px" className="object-cover" />
      )}
    </motion.div>
  );
}

/* pantalla del sticky: cada una con su tramo de opacidad */
function PantallaScroll({ paso, i, avance, quieto }: { paso: Paso; i: number; avance: MotionValue<number>; quieto: boolean }) {
  const [x, y] = rango(i);
  const opacidad = useTransform(avance, x, y);
  const escala = useTransform(opacidad, [0, 1], quieto ? [1, 1] : [1.04, 1]);
  return <Pantalla paso={paso} opacidad={opacidad} escala={escala} />;
}

function IPhone({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative aspect-[9/19.5] w-[280px] rounded-[3.2rem] bg-gradient-to-b from-neutral-700 to-neutral-900 p-[3px] shadow-[0_60px_120px_-30px_rgba(236,25,104,.35),0_30px_60px_-20px_rgba(0,0,0,.9)] xl:w-[310px] ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[3rem] border-[9px] border-black bg-black">
        {children}
        {/* dynamic island */}
        <div aria-hidden="true" className="absolute left-1/2 top-2.5 z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

export default function ScrollIphone() {
  const quieto = !!useReducedMotion();
  const caja = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: caja, offset: ['start start', 'end end'] });
  const barra = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="funciones" ref={caja} className="relative mx-auto max-w-6xl scroll-mt-24 px-5" aria-label="Funciones de la app">
      <div className="grid lg:grid-cols-2 lg:gap-16">
        {/* ---- textos ---- */}
        <div>
          {PASOS.map((p, i) => (
            <div key={p.id} className="flex min-h-[85svh] flex-col justify-center py-16 lg:min-h-screen lg:py-0">
              <motion.div
                initial={quieto ? false : { opacity: 0.15, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.6 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[.2em] text-rosa">
                  <p.i className="h-4 w-4" aria-hidden="true" /> 0{i + 1} · {p.kicker}
                </p>
                <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-gray-900 md:text-6xl">{p.t}</h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-tinta-suave">{p.d}</p>
              </motion.div>
              {/* mobile / tablet: su propio iPhone */}
              <IPhone className="mx-auto mt-12 lg:hidden">
                <Pantalla paso={p} />
              </IPhone>
            </div>
          ))}
        </div>

        {/* ---- iPhone pegajoso (desktop) ---- */}
        <div className="relative hidden lg:block">
          <div className="sticky top-24 flex h-[calc(100vh-7rem)] items-center justify-center">
            <div aria-hidden="true" className="absolute h-[70%] w-[70%] rounded-full bg-rosa/20 blur-[100px]" />
            <IPhone>
              {PASOS.map((p, i) => <PantallaScroll key={p.id} paso={p} i={i} avance={scrollYProgress} quieto={quieto} />)}
            </IPhone>
            {/* avance */}
            <div aria-hidden="true" className="absolute bottom-6 left-1/2 h-1 w-24 -translate-x-1/2 overflow-hidden rounded-full bg-tinta/10">
              <motion.div style={{ width: barra }} className="h-full rounded-full bg-tinta/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
