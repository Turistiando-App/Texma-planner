'use client';
/* ============================================================
   FRASE ROTATIVA · cierre del título del hero de /app
   ------------------------------------------------------------
   Rota las frases en bucle cada 3 s con un fundido suave.
   El ancho lo fija la frase más larga (invisible), así el título
   no salta al cambiar. Con movimiento reducido, el fundido es más corto.
============================================================ */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FRASES = ['Desde el celular.', 'Sin internet.', 'Con tu propio stock.', 'Para modistas reales.'];
const LARGA = FRASES.reduce((a, b) => (b.length > a.length ? b : a));

export default function FraseRotativa() {
  const quieto = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % FRASES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-grid justify-items-center font-serif italic text-pink-600">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">{LARGA}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={FRASES[i]}
          className="col-start-1 row-start-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: quieto ? 0.2 : 0.6, ease: 'easeInOut' }}>
          {FRASES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
