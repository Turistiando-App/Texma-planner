/* ============================================================
   OFFLINE · el celular se aleja (lo mueve VideoTexma) y al lado
   aparecen una compu y una tablet. Un switch estilo iOS «Modo
   Offline» pasa de gris a verde y todo sigue funcionando.
   Frames relativos al inicio de la secuencia.
============================================================ */
import { Check, Laptop, Tablet, WifiOff } from 'lucide-react';
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp } from '../ui/util';

export const OF = {
  titulo: 40,
  laptop: 60,
  tablet: 80,
  switch: 200,      // se prende el switch
  ok: 235,          // «todo sigue funcionando» + tildes en los equipos
  sale: [450, 490] as const,   // fade out (se pisa con el inicio del cierre)
};

function Equipo({ x, y, entra, ok, etiqueta, children }: { x: number; y: number; entra: number; ok: number; etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, top: y, opacity: entra, transform: `translate(-50%,-50%) translateY(${interpolate(entra, [0, 1], [60, 0])}px)` }}>
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-rosa/25 blur-[70px]" />
        {children}
        <span className="absolute -right-3 -top-3 grid h-14 w-14 place-items-center rounded-full bg-[#34C759] text-white shadow-[0_10px_30px_rgba(52,199,89,.5)]"
          style={{ transform: `scale(${ok})` }}>
          <Check size={30} strokeWidth={3} />
        </span>
      </div>
      <p className="mt-5 font-mono text-[22px] uppercase tracking-[.3em] text-white/60">{etiqueta}</p>
    </div>
  );
}

export function Offline() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (desde: number, damping = 16) => spring({ frame: frame - desde, fps, config: { damping } });
  const sale = interpolate(frame, OF.sale, [1, 0], clamp);
  const prendido = s(OF.switch, 14);
  const ok = s(OF.ok, 10);
  const titulo = s(OF.titulo, 200);

  return (
    <div className="absolute inset-0" style={{ opacity: sale }}>
      <div className="absolute inset-x-0 top-[70px] text-center" style={{ opacity: titulo, transform: `translateY(${interpolate(titulo, [0, 1], [30, 0])}px)` }}>
        <p className="text-[76px] font-extrabold tracking-[-0.03em] text-white">Funciona sin internet.</p>
        <p className="mt-2 text-[32px] text-white/60">En el celu, la tablet o la compu.</p>
      </div>

      <Equipo x={470} y={560} entra={s(OF.laptop)} ok={ok} etiqueta="Compu">
        <Laptop size={330} strokeWidth={1.1} className="text-white" />
      </Equipo>
      <Equipo x={1450} y={560} entra={s(OF.tablet)} ok={ok} etiqueta="Tablet">
        <Tablet size={260} strokeWidth={1.1} className="text-white" />
      </Equipo>

      {/* switch iOS */}
      <div className="absolute left-1/2 top-[905px] flex w-[560px] items-center gap-5 rounded-[28px] border border-white/10 bg-white/[.06] px-7 py-5 backdrop-blur"
        style={{ opacity: s(OF.titulo + 40), transform: `translateX(-50%) translateY(${interpolate(s(OF.titulo + 40), [0, 1], [40, 0])}px)` }}>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white"><WifiOff size={28} /></span>
        <span className="flex-1">
          <b className="block text-[28px] text-white">Modo Offline</b>
          <span className="text-[18px]" style={{ color: interpolateColors(prendido, [0, 1], ['rgba(255,255,255,.5)', '#34C759']) }}>
            {frame >= OF.ok ? 'Todo sigue funcionando ✓' : 'Sin conexión'}
          </span>
        </span>
        <span className="relative h-[46px] w-[78px] rounded-full" style={{ background: interpolateColors(prendido, [0, 1], ['#3A3A3C', '#34C759']) }}>
          <span className="absolute left-[3px] top-[3px] h-[40px] w-[40px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.3)]"
            style={{ transform: `translateX(${interpolate(prendido, [0, 1], [0, 32], clamp)}px)` }} />
        </span>
      </div>
    </div>
  );
}
