'use client';
/* ============================================================
   MERCERÍA ANIM · animación Remotion en bucle para cada rubro
   ------------------------------------------------------------
   Embebe con @remotion/player la composición del rubro (hilo,
   botón, cierre o elástico), sin controles y en loop. Con
   «reducir movimiento» queda quieta en el primer cuadro.
   Es decorativa: aria-hidden y sin clics (los toma el banner).
============================================================ */
import { Player } from '@remotion/player';
import { useReducedMotion } from 'framer-motion';
import { DURACION, FPS, LADO, LOOPS } from '@/components/remotion/MerceriaLoops';

export default function MerceriaAnim({ rubro, className = '' }: { rubro: string; className?: string }) {
  const quieto = !!useReducedMotion();
  const Comp = LOOPS[rubro as keyof typeof LOOPS];
  if (!Comp) return null;
  return (
    <span aria-hidden="true" className={`pointer-events-none block ${className}`}>
      <Player
        component={Comp}
        durationInFrames={DURACION}
        fps={FPS}
        compositionWidth={LADO}
        compositionHeight={LADO}
        autoPlay={!quieto}
        loop
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      />
    </span>
  );
}
