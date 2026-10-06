/* Cursor (dedo) que viaja de toque en toque y hace clic con una onda.
   Los toques van en frames GLOBALES y coordenadas de pantalla del iPhone. */
import { Easing, interpolate, useCurrentFrame } from 'remotion';

export type Toque = { f: number; x: number; y: number };

const VIAJE = 18;   // frames que tarda en llegar a cada toque
const CLIC = 12;    // frames que dura la onda del clic

export function Cursor({ toques, aparece, desaparece }: { toques: Toque[]; aparece: number; desaparece: number }) {
  const frame = useCurrentFrame();
  if (frame < aparece || frame > desaparece || toques.length === 0) return null;

  /* quieto hasta VIAJE antes de cada toque; después se desliza */
  const fs = [aparece], xs = [toques[0].x + 90], ys = [toques[0].y + 160];
  for (const t of toques) {
    const sale = Math.max(fs[fs.length - 1] + 1, t.f - VIAJE);
    fs.push(sale, Math.max(sale + 1, t.f));
    xs.push(xs[xs.length - 1], t.x);
    ys.push(ys[ys.length - 1], t.y);
  }
  const opc = { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const x = interpolate(frame, fs, xs, opc);
  const y = interpolate(frame, fs, ys, opc);
  const opacidad = interpolate(frame, [aparece, aparece + 10, desaparece - 10, desaparece], [0, 1, 1, 0]);

  const clic = toques.find(t => frame >= t.f && frame < t.f + CLIC);
  const p = clic ? (frame - clic.f) / CLIC : 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-[60]" style={{ opacity: opacidad }}>
      {clic && (
        <div className="absolute rounded-full border-[3px] border-rosa/70"
          style={{ left: clic.x - 35, top: clic.y - 35, width: 70, height: 70, transform: `scale(${interpolate(p, [0, 1], [0.3, 1.5])})`, opacity: 1 - p }} />
      )}
      <div className="absolute rounded-full border-2 border-tinta/35 bg-white/60 shadow-[0_8px_22px_rgba(0,0,0,.25)]"
        style={{ left: x - 22, top: y - 22, width: 44, height: 44, transform: `scale(${clic ? interpolate(p, [0, 0.35, 1], [1, 0.8, 1]) : 1})` }} />
    </div>
  );
}
