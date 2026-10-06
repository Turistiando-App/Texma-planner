'use client';
/* ============================================================
   CINE · video promo de la app en un marco 16:9
   ------------------------------------------------------------
   El video arranca mudo y en bucle, sin controles (de fondo).
   El botón superpuesto lo reinicia con sonido y le devuelve los
   controles nativos. Detrás, un resplandor rosa/verde muy sutil.
============================================================ */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';

export default function CineApp() {
  const quieto = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [conSonido, setConSonido] = useState(false);

  const reproducir = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.loop = false;
    v.controls = true;
    v.play().catch(() => {});
    setConSonido(true);
  };

  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-5xl">
      {/* resplandor */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-70 blur-3xl
        bg-[radial-gradient(50%_60%_at_25%_40%,rgba(236,25,104,.35),transparent_70%),radial-gradient(45%_55%_at_80%_65%,rgba(52,211,153,.22),transparent_70%)]" />

      <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_30%_20%,#2A1018,#0A0A0A_60%)] ring-1 ring-white/10 shadow-[0_50px_120px_-30px_rgba(0,0,0,.9)] md:rounded-[2.5rem]">
        <video
          ref={video}
          src="/promo-app.mp4"
          autoPlay muted loop playsInline preload="metadata"
          onEnded={() => setConSonido(false)}
          className="absolute inset-0 h-full w-full object-cover"
          aria-label="Video de presentación de TEXMA Planner" />

        <AnimatePresence>
          {!conSonido && (
            <motion.div
              key="velo"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-black/10 to-black/20">
              <motion.button
                type="button" onClick={reproducir}
                whileHover={quieto ? undefined : { scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 py-2.5 pl-2.5 pr-6 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/20 md:text-base">
                <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-black md:h-14 md:w-14">
                  {!quieto && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-white/40" />}
                  <Play className="relative ml-0.5 h-5 w-5 fill-current md:h-6 md:w-6" aria-hidden="true" />
                </span>
                Reproducir con sonido
                <Volume2 className="h-4 w-4 text-white/70" aria-hidden="true" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
