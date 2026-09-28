'use client';
/* Acordeón de preguntas frecuentes (una abierta a la vez). El JSON-LD
   FAQPage lo agrega la página, así Google y los asistentes de IA
   pueden citar las respuestas tal cual. */
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export type Pregunta = { p: string; r: string };

export default function FAQ({ items }: { items: Pregunta[] }) {
  const [abierta, setAbierta] = useState<number | null>(0);
  return (
    <div className="divide-y divide-linea overflow-hidden rounded-3xl border border-linea bg-papel">
      {items.map((it, i) => {
        const on = abierta === i;
        return (
          <div key={i}>
            <h3>
              <button className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-bold"
                aria-expanded={on} onClick={() => setAbierta(on ? null : i)}>
                {it.p}
                <motion.span animate={{ rotate: on ? 45 : 0 }} className="grid h-8 w-8 flex-none place-items-center rounded-full bg-lino text-xl text-rosa">+</motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <p className="px-6 pb-6 leading-relaxed text-tinta-suave">{it.r}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
