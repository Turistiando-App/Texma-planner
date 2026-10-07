'use client';
/* ============================================================
   HERO · el hilo que pasa por el ojo de las agujas
   ------------------------------------------------------------
   La sección mide 260vh y adentro hay un «escenario» sticky de 100vh:
   mientras la usuaria scrollea, el escenario queda quieto y la
   animación avanza con el progreso del scroll (estilo Apple):

     · el carrete gira y va soltando hilo
     · el hilo se dibuja (pathLength 0 → 1) y pasa por el ojo de 3 agujas
     · cada aguja se ilumina cuando el hilo la atraviesa
     · los textos entran y salen por tramos

   Truco del «pasar por el ojo»: cada aguja se dibuja en dos capas.
   Atrás va el cuerpo; después el hilo; y ARRIBA solo el borde de
   adelante del ojo. Así el hilo se ve entrando por el agujero.
   Con «reducir movimiento» todo queda en su estado final.
   En SVG, framer-motion ya centra solo los transforms (transform-box:
   fill-box): NO poner transformOrigin a mano, lo descentra.
============================================================ */
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* geometría del escenario (viewBox 1200 × 700) */
const OJOS = [
  { x: 430, y: 250 }, // aguja 1
  { x: 700, y: 430 }, // aguja 2
  { x: 970, y: 240 }, // aguja 3
];
const HILO =
  'M205 360 C 300 360, 350 250, 430 250 ' +      // del carrete al ojo 1
  'C 520 250, 600 430, 700 430 ' +                // del ojo 1 al ojo 2
  'C 800 430, 880 240, 970 240 ' +                // del ojo 2 al ojo 3
  'C 1050 240, 1110 330, 1260 350';              // y sale de cuadro

/* el hilo se dibuja entre estos dos puntos del scroll */
const HILO_DESDE = 0.04, HILO_HASTA = 0.9;
/* estimación inicial de en qué momento del scroll pasa el hilo por cada ojo;
   al montar se recalcula exacto midiendo el path (getPointAtLength) */
const PASO_INICIAL = [0.28, 0.52, 0.76];

function AgujaHero({ x, y, progreso, umbral, inclinacion }: {
  x: number; y: number; progreso: MotionValue<number>; umbral: number; inclinacion: number;
}) {
  const brillo = useTransform(progreso, [umbral - 0.06, umbral, umbral + 0.08], [0.35, 1, 0.75]);
  const escala = useTransform(progreso, [umbral - 0.04, umbral, umbral + 0.06], [1, 1.08, 1]);
  /* la aguja: el ojo está 40 unidades debajo de la punta de arriba */
  /* OJO: en SVG, el transform de framer (scale) pisa el atributo transform.
     Por eso la inclinación va en un <g> y la escala en otro adentro. */
  return (
    <g transform={`rotate(${inclinacion} ${x} ${y})`}>
      <motion.g style={{ scale: escala }}>
        <motion.circle cx={x} cy={y} r="34" fill="url(#hBrillo)" style={{ opacity: brillo }} />
        <path d={`M${x} ${y + 220} L${x - 7} ${y + 10} Q${x - 7} ${y - 38} ${x} ${y - 44} Q${x + 7} ${y - 38} ${x + 7} ${y + 10} Z`}
          fill="url(#hMetal)" />
        <ellipse cx={x} cy={y} rx="3.2" ry="15" fill="#F3EEE5" />
      </motion.g>
    </g>
  );
}
/* la capa de ADELANTE del ojo (va arriba del hilo) */
function OjoFrente({ x, y, inclinacion }: { x: number; y: number; inclinacion: number }) {
  return (
    <g transform={`rotate(${inclinacion} ${x} ${y})`}>
      <path d={`M${x - 5} ${y - 2} Q${x - 5} ${y + 16} ${x} ${y + 17} Q${x + 5} ${y + 16} ${x + 5} ${y - 2}`}
        fill="none" stroke="url(#hMetal)" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

export default function HeroHilo() {
  const ref = useRef<HTMLElement>(null);
  const hiloRef = useRef<SVGPathElement>(null);
  const [paso, setPaso] = useState(PASO_INICIAL);
  const quieto = useReducedMotion();
  /* mide dónde cae cada ojo sobre el hilo y lo pasa a «progreso de scroll» */
  useEffect(() => {
    const el = hiloRef.current; if (!el) return;
    const L = el.getTotalLength(), N = 600;
    const frac = OJOS.map(o => {
      let mejor = 0, dist = Infinity;
      for (let i = 0; i <= N; i++) {
        const q = el.getPointAtLength((L * i) / N), d = (q.x - o.x) ** 2 + (q.y - o.y) ** 2;
        if (d < dist) { dist = d; mejor = i / N; }
      }
      return mejor;
    });
    /* hilo = map(p, [DESDE, HASTA] → [0.02, 1])  ⇒  p = DESDE + (f − 0.02)/0.98 · (HASTA − DESDE) */
    setPaso(frac.map(f => HILO_DESDE + ((f - 0.02) / 0.98) * (HILO_HASTA - HILO_DESDE)));
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  /* un resorte suave: el hilo no «salta» con la ruedita del mouse */
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  const hilo = useTransform(p, [HILO_DESDE, HILO_HASTA], [0.02, 1]);
  const giro = useTransform(p, [0, 1], [0, 720]);
  const rollo = useTransform(p, [0, 1], [1, 0.72]);           // el carrete «adelgaza» al soltar hilo
  const t1 = useTransform(p, [0, 0.22, 0.32], [1, 1, 0]);
  const t1y = useTransform(p, [0, 0.32], [0, -40]);
  const t2 = useTransform(p, [0.3, 0.4, 0.6, 0.68], [0, 1, 1, 0]);
  const t3 = useTransform(p, [0.7, 0.82], [0, 1]);
  const pista = useTransform(p, [0, 0.08], [1, 0]);

  return (
    <section ref={ref} className="relative h-[260vh]" aria-label="TEXMA, costura y organización">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* textos por tramos */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-28 md:pt-32">
          <motion.div style={quieto ? {} : { opacity: t1, y: t1y }} className="max-w-2xl">
            <p className="kicker text-rosa">Mercería · App para modistas</p>
            <h1 className="titulo mt-3 text-5xl leading-[1.02] md:text-7xl">
              Coser es un arte.<br />Organizarlo, también.
            </h1>
            <p className="mt-5 max-w-lg text-base text-tinta-suave md:text-lg">
              Hilos, botones, cierres y elásticos para tus trabajos, y TEXMA, la app que ordena tus
              medidas, entregas y plata.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/merceria" className="rounded-full bg-rosa px-6 py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(236,25,104,.32)] transition hover:-translate-y-0.5">
                Ver la mercería
              </Link>
              <Link href="/planner" className="rounded-full border border-linea bg-papel px-6 py-3.5 font-bold transition hover:-translate-y-0.5">
                Conocé la app
              </Link>
            </div>
          </motion.div>
          {!quieto && (
            <>
              <motion.div style={{ opacity: t2 }} className="pointer-events-none absolute inset-x-5 top-28 md:top-32">
                <p className="kicker text-rosa">Paso a paso</p>
                <p className="titulo mt-3 max-w-xl text-4xl md:text-6xl">Cada puntada, en su lugar.</p>
              </motion.div>
              <motion.div style={{ opacity: t3 }} className="pointer-events-none absolute inset-x-5 top-28 md:top-32">
                <p className="kicker text-rosa">Enhebrado</p>
                <p className="titulo mt-3 max-w-xl text-4xl md:text-6xl">Tu taller, listo para crecer.</p>
              </motion.div>
            </>
          )}
        </div>

        {/* el escenario */}
        <div className="relative flex-1">
          <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet"
            className="absolute inset-x-0 bottom-0 mx-auto h-[62vh] w-full max-w-6xl md:h-[70vh]" aria-hidden="true">
            <defs>
              <linearGradient id="hMetal" x1="0" x2="1">
                <stop offset="0" stopColor="#80868D" /><stop offset=".5" stopColor="#EEF0F2" /><stop offset="1" stopColor="#959BA2" />
              </linearGradient>
              <radialGradient id="hBrillo">
                <stop offset="0" stopColor="#FBD9E6" stopOpacity=".95" /><stop offset="1" stopColor="#FBD9E6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* carrete que gira */}
            <g>
              <rect x="95" y="265" width="110" height="20" rx="7" fill="#C9A77C" />
              <rect x="95" y="435" width="110" height="20" rx="7" fill="#B08D63" />
              <motion.rect x="112" y="285" width="76" height="150" rx="6" fill="#EC1968"
                style={quieto ? {} : { scaleX: rollo }} />
              <motion.g style={quieto ? {} : { rotate: giro }}>
                {[0, 60, 120].map(a => (
                  <line key={a} x1="150" y1="330" x2="150" y2="390" stroke="rgba(255,255,255,.35)" strokeWidth="3"
                    transform={`rotate(${a} 150 360)`} />
                ))}
              </motion.g>
            </g>

            {/* capa 1: el cuerpo de las agujas */}
            {OJOS.map((o, i) => (
              <AgujaHero key={i} x={o.x} y={o.y} progreso={quieto ? scrollYProgress : p} umbral={paso[i]}
                inclinacion={[-14, 10, -8][i]} />
            ))}

            {/* capa 2: el hilo */}
            <path d={HILO} fill="none" stroke="#EC1968" strokeOpacity=".12" strokeWidth="10" strokeLinecap="round" />
            <motion.path ref={hiloRef} d={HILO} fill="none" stroke="#EC1968" strokeWidth="4" strokeLinecap="round"
              style={{ pathLength: quieto ? 1 : hilo }} />

            {/* capa 3: el borde de adelante de cada ojo, ARRIBA del hilo */}
            {OJOS.map((o, i) => <OjoFrente key={i} x={o.x} y={o.y} inclinacion={[-14, 10, -8][i]} />)}
          </svg>

          {!quieto && (
            <motion.p style={{ opacity: pista }} className="kicker absolute bottom-8 left-1/2 -translate-x-1/2 text-tinta-suave">
              Deslizá ↓
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
