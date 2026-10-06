/* CIERRE · logo de TEXMA centrado y botón «Comprar App» con latido
   continuo (doble pulso, como un corazón). Frames relativos a la secuencia. */
import { ShoppingBag } from 'lucide-react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp } from '../ui/util';

const LATIDO = 30; // frames por latido (1 por segundo)

/* dos golpes por ciclo: «pum-pum» */
function latido(frame: number) {
  const t = (frame % LATIDO) / LATIDO;
  const golpe = (c: number, a: number) => a * Math.exp(-((t - c) ** 2) / 0.0035);
  return 1 + golpe(0.12, 0.08) + golpe(0.34, 0.05);
}

export function Cierre() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 25, fps, config: { damping: 200 } });
  const boton = spring({ frame: frame - 55, fps, config: { damping: 12 } });
  const late = frame > 75 ? latido(frame - 75) : 1;
  const onda = ((frame - 75) % LATIDO) / LATIDO;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div style={{ opacity: logo, transform: `translateY(${interpolate(logo, [0, 1], [40, 0])}px)` }} className="text-center">
        <p className="titulo text-[230px] leading-none text-white"><span className="text-rosa">T</span>EXMA</p>
        <p className="mt-4 font-mono text-[26px] uppercase tracking-[.6em] text-white/50">Planner</p>
      </div>

      <div className="relative mt-20" style={{ transform: `scale(${boton * late})`, opacity: interpolate(boton, [0, 0.3], [0, 1], clamp) }}>
        {frame > 75 && (
          <span className="absolute inset-0 rounded-full border-4 border-rosa"
            style={{ transform: `scale(${1 + onda * 0.45})`, opacity: (1 - onda) * 0.6 }} />
        )}
        <span className="relative flex items-center gap-4 rounded-full bg-rosa px-16 py-8 text-[46px] font-extrabold text-white shadow-[0_30px_90px_-20px_rgba(236,25,104,.9)]">
          <ShoppingBag size={44} strokeWidth={2.4} /> Comprar App
        </span>
      </div>

      <p className="mt-12 text-[28px] text-white/50" style={{ opacity: interpolate(frame, [90, 110], [0, 1], clamp) }}>
        Pago único · texma.com.ar
      </p>
    </div>
  );
}
