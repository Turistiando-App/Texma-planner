/* Textos que van por fuera del celular: el gancho de la intro y la
   leyenda de cada sección. Van dentro de un <Sequence>, así que
   useCurrentFrame() acá es relativo al inicio de esa secuencia. */
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp } from '../ui/util';

export function Gancho() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const l2 = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const sale = interpolate(frame, [200, 240], [1, 0], clamp);
  const presenta = interpolate(frame, [300, 325, 425, 450], [0, 1, 1, 0], clamp);
  return (
    <>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ opacity: sale, transform: `scale(${interpolate(sale, [0, 1], [1.06, 1])})`, filter: `blur(${(1 - sale) * 10}px)` }}>
        <p className="titulo text-[150px] leading-[1.02] text-white"
          style={{ opacity: l1, transform: `translateY(${interpolate(l1, [0, 1], [50, 0])}px)` }}>Coser es un arte.</p>
        <p className="titulo text-[150px] leading-[1.02] text-rosa"
          style={{ opacity: l2, transform: `translateY(${interpolate(l2, [0, 1], [50, 0])}px)` }}>Organizarlo, también.</p>
      </div>
      <p className="absolute inset-x-0 top-[62px] text-center font-mono text-[22px] uppercase tracking-[.35em] text-white/60" style={{ opacity: presenta }}>
        Te presentamos <b className="text-white">TEXMA Planner</b>
      </p>
    </>
  );
}

export function Leyenda({ n, kicker, titulo, bajada, dura }: { n: string; kicker: string; titulo: string; bajada: string; dura: number }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20, dura - 20, dura], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [0, 30], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div className="absolute left-[150px] top-[330px] w-[760px]" style={{ opacity: o, transform: `translateY(${y}px)` }}>
      <p className="font-mono text-[22px] uppercase tracking-[.3em] text-rosa">{n} · {kicker}</p>
      <p className="mt-6 text-[88px] font-extrabold leading-[1] tracking-[-0.03em] text-white">{titulo}</p>
      <p className="mt-7 max-w-[640px] text-[34px] leading-snug text-white/60">{bajada}</p>
    </div>
  );
}
