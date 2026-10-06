'use client';
/* ============================================================
   FRASE ROTATIVA · cierre del título del hero de /app
   ------------------------------------------------------------
   Máquina de escribir: escribe letra por letra, pausa, borra
   rápido y pasa a la siguiente frase, en bucle. El ancho lo fija
   la frase más larga (invisible), así el título no salta.
   Para lectores de pantalla queda fija la primera frase.
   Con movimiento reducido, cambia la frase entera cada 3 s.
============================================================ */
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FRASES = ['Desde el celular.', 'Sin internet.', 'Con tu propio stock.', 'Para modistas reales.'];
const LARGA = FRASES.reduce((a, b) => (b.length > a.length ? b : a));

const ESCRIBIR = 75;   // ms por letra al escribir
const BORRAR = 35;     // ms por letra al borrar
const PAUSA = 1800;    // ms con la frase completa
const RESPIRO = 350;   // ms vacío antes de la siguiente

function useMaquina(activa: boolean) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    if (!activa) {
      const t = setInterval(() => setI(x => (x + 1) % FRASES.length), 3000);
      return () => clearInterval(t);
    }
    const frase = FRASES[i];
    let t: ReturnType<typeof setTimeout>;
    if (!borrando && n < frase.length) t = setTimeout(() => setN(n + 1), ESCRIBIR);
    else if (!borrando) t = setTimeout(() => setBorrando(true), PAUSA);
    else if (n > 0) t = setTimeout(() => setN(n - 1), BORRAR);
    else t = setTimeout(() => { setBorrando(false); setI((i + 1) % FRASES.length); }, RESPIRO);
    return () => clearTimeout(t);
  }, [activa, i, n, borrando]);

  return activa ? FRASES[i].slice(0, n) : FRASES[i];
}

export default function FraseRotativa() {
  const quieto = !!useReducedMotion();
  const texto = useMaquina(!quieto);

  return (
    <span className="relative inline-grid justify-items-center font-serif italic text-pink-600">
      <span className="sr-only">{FRASES[0]}</span>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">{LARGA}</span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        {texto || '​'}
        {!quieto && (
          <motion.span
            className="ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] rounded-full bg-pink-600"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
        )}
      </span>
    </span>
  );
}
