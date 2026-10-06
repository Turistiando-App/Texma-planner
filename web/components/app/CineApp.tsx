'use client';
/* ============================================================
   CINE · video promo de la app en un marco 16:9
   ------------------------------------------------------------
   El video se reproduce solo, en bucle y sin controles nativos.
   Un clic en cualquier parte del video SOLO alterna el sonido
   (nunca pausa ni agranda). El ícono flotante de la esquina
   muestra si el audio está activado o silenciado.
============================================================ */
import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

export default function CineApp() {
  const quieto = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [mudo, setMudo] = useState(true);

  const alternarSonido = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-6xl">
      {/* resplandor */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] opacity-70 blur-3xl
        bg-[radial-gradient(50%_60%_at_25%_40%,rgba(236,25,104,.35),transparent_70%),radial-gradient(45%_55%_at_80%_65%,rgba(52,211,153,.22),transparent_70%)]" />

      <button
        type="button" onClick={alternarSonido}
        aria-label={mudo ? 'Activar el sonido del video' : 'Silenciar el video'}
        aria-pressed={!mudo}
        className="relative block aspect-video w-full cursor-pointer overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_120%_at_30%_20%,#2A1018,#0A0A0A_60%)] ring-1 ring-black/5 shadow-[0_50px_120px_-30px_rgba(236,25,104,.45)] md:rounded-[2.5rem]">
        <video
          ref={video}
          src="/promo-app.mp4"
          autoPlay muted loop playsInline preload="metadata"
          disablePictureInPicture
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-label="Video de presentación de TEXMA Planner" />

        <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 md:bottom-6 md:right-6 md:h-12 md:w-12">
          {mudo
            ? <VolumeX className="h-5 w-5" aria-hidden="true" />
            : <Volume2 className="h-5 w-5" aria-hidden="true" />}
        </span>
      </button>
    </motion.div>
  );
}
