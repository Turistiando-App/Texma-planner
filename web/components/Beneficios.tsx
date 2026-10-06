'use client';
/* ============================================================
   BENEFICIOS · video grande + tarjetas que aparecen al scrollear
   ------------------------------------------------------------
   Izquierda: /costura.mp4 en bucle, mudo, con bordes muy redondeados.
   Mientras carga (o si no está) queda a la vista un degradado de marca.
   Derecha: las tarjetas entran escalonadas (fade + suben) con
   whileInView cuando el 30 % de la columna está en pantalla.
============================================================ */
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { HeartHandshake, PackageCheck, Scissors, Smartphone, Truck } from 'lucide-react';

const BENEFICIOS = [
  { t: 'Stock real, al día', d: 'Lo que ves en el catálogo es lo que hay en el taller. Se actualiza solo cuando algo se vende.', i: PackageCheck },
  { t: 'Te asesora una modista', d: '¿No sabés qué cierre o qué elástico va? Preguntanos por WhatsApp: lo usamos todos los días.', i: Scissors },
  { t: 'Envíos a todo el país', d: 'Armamos el pedido en el día y te lo mandamos por correo o moto en la ciudad.', i: Truck },
  { t: 'Todo tu taller en el celu', d: 'Con la app TEXMA tenés medidas, entregas, stock y plata ordenados, sin planillas.', i: Smartphone },
];

const lista: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const tarjeta: Variants = {
  oculto: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Beneficios() {
  const quieto = useReducedMotion();
  return (
    <section className="mx-auto max-w-6xl px-5 py-24" aria-labelledby="valor">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* ---- video ---- */}
        <motion.div
          initial={quieto ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[radial-gradient(120%_90%_at_30%_20%,#FBD9E6,#F3EEE5_55%,#E4DCCD)] shadow-[0_40px_80px_-30px_rgba(43,38,34,.35)]">
          <video autoPlay loop muted playsInline preload="metadata" src="/costura.mp4"
            aria-label="Cinta métrica sobre un molde de costura"
            className="absolute inset-0 h-full w-full rounded-[2.5rem] object-cover" />
          <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-3 shadow-lg backdrop-blur">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rosa text-white"><HeartHandshake className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-bold leading-tight text-tinta">Hecho por modistas,<br /><span className="font-normal text-tinta-suave">para modistas</span></span>
          </div>
        </motion.div>

        {/* ---- tarjetas ---- */}
        <div>
          <p className="kicker text-rosa">Por qué TEXMA</p>
          <h2 id="valor" className="titulo mt-3 max-w-xl text-4xl md:text-5xl">Todo lo que tu costura necesita, sin vueltas.</h2>
          <motion.ul
            variants={lista}
            initial={quieto ? false : 'oculto'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-10 grid gap-4 sm:grid-cols-2">
            {BENEFICIOS.map(b => (
              <motion.li key={b.t} variants={tarjeta}
                className="group rounded-3xl border border-linea bg-white p-6 shadow-[0_1px_2px_rgba(43,38,34,.04)] transition-shadow hover:shadow-[0_18px_40px_-12px_rgba(43,38,34,.18)]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rosa-claro text-rosa-oscuro transition group-hover:bg-rosa group-hover:text-white">
                  <b.i className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{b.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{b.d}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
