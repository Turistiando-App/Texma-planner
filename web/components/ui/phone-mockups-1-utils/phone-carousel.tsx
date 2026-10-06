'use client';
/* ============================================================
   PHONE CAROUSEL · slider de mockups de iPhone
   ------------------------------------------------------------
   El del centro va grande; los vecinos se corren a los costados,
   más chicos y transparentes (sin blur ni velos oscuros). Se
   navega con flechas, puntos, teclado (← →), arrastrando o
   tocando un celular lateral. Avanza solo cada 4 s salvo con el
   mouse/foco encima o con «reducir movimiento».
   Los PNG ya traen el marco del iPhone (fondo transparente), así
   que acá solo se muestran con object-contain.
============================================================ */
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ImageItem {
  src: string;
  alt: string;
  label?: string;
}

const AUTOPLAY = 4000;  // ms entre pasos automáticos
const VISIBLES = 2;     // vecinos visibles por lado

/* distancia circular más corta de i al activo (−n/2 … n/2) */
function desfase(i: number, activo: number, n: number) {
  let d = i - activo;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

export function PhoneCarousel({ images, className }: { images: ImageItem[]; className?: string }) {
  const quieto = !!useReducedMotion();
  const n = images.length;
  const [activo, setActivo] = useState(0);
  const [pausa, setPausa] = useState(false);

  const ir = useCallback((i: number) => setActivo(((i % n) + n) % n), [n]);
  const siguiente = useCallback(() => setActivo(a => (a + 1) % n), [n]);
  const anterior = useCallback(() => setActivo(a => (a - 1 + n) % n), [n]);

  useEffect(() => {
    if (quieto || pausa || n < 2) return;
    const t = setTimeout(siguiente, AUTOPLAY);
    return () => clearTimeout(t);
  }, [activo, pausa, quieto, n, siguiente]);

  const soltar = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) siguiente();
    else if (info.offset.x > 60 || info.velocity.x > 400) anterior();
  };

  if (!n) return null;
  const actual = images[activo];

  return (
    <div
      className={cn('relative w-full select-none outline-none', className)}
      role="region" aria-roledescription="carrusel" aria-label="Pantallas de la app"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
      }}
      onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)} onBlur={() => setPausa(false)}>

      {/* pista: el alto lo fija el celular del centro */}
      <motion.div
        className="relative mx-auto aspect-[1276/2368] w-[62vw] max-w-[300px] cursor-grab touch-pan-y active:cursor-grabbing sm:w-[260px] lg:w-[300px]"
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={soltar}>
        {images.map((img, i) => {
          const d = desfase(i, activo, n);
          const lejos = Math.abs(d);
          const visible = lejos <= VISIBLES;
          return (
            <motion.button
              key={img.src}
              type="button"
              tabIndex={-1}
              aria-hidden={d !== 0}
              onClick={() => d !== 0 && ir(i)}
              className="absolute inset-0 origin-bottom"
              style={{ zIndex: 10 - lejos, pointerEvents: visible ? 'auto' : 'none' }}
              initial={false}
              animate={{
                x: `${d * 62}%`,
                scale: 1 - Math.min(lejos, VISIBLES + 1) * 0.14,
                opacity: visible ? 1 - lejos * 0.3 : 0,
              }}
              transition={quieto ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}>
              <Image
                src={img.src} alt={img.alt} fill draggable={false}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 62vw"
                priority={lejos <= 1}
                className="object-contain drop-shadow-[0_24px_30px_rgba(43,38,34,.14)]" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* controles */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full" onClick={anterior} aria-label="Pantalla anterior">
          <ChevronLeft />
        </Button>
        <div className="flex items-center gap-1.5">
          {images.map((img, i) => (
            <button key={img.src} type="button" onClick={() => ir(i)}
              aria-label={`Ver ${img.label ?? img.alt}`} aria-current={i === activo}
              className={cn('h-2 rounded-full transition-all',
                i === activo ? 'w-6 bg-primary' : 'w-2 bg-tinta/20 hover:bg-tinta/40')} />
          ))}
        </div>
        <Button variant="outline" size="icon" className="rounded-full" onClick={siguiente} aria-label="Pantalla siguiente">
          <ChevronRight />
        </Button>
      </div>

      <p className="mt-4 text-center font-mono text-xs uppercase tracking-[.2em] text-tinta-suave" aria-live="polite">
        {String(activo + 1).padStart(2, '0')} · {actual.label ?? actual.alt}
      </p>
    </div>
  );
}
