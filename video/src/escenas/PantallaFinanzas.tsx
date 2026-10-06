/* ============================================================
   PANTALLA FINANZAS
   El balance general cuenta desde 0; el cursor toca «Ingresos del
   mes» y la barra se llena sola del 10 % al 85 %. Después se
   despliegan las categorías.
============================================================ */
import { TrendingUp } from 'lucide-react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ESCENA } from '../tiempos';
import type { Toque } from '../ui/Cursor';
import { clamp, plata } from '../ui/util';

const D = ESCENA.finanzas.desde;
export const FI = {
  cuenta: [40, 130] as const,     // el balance sube contando
  toque: 150,                     // clic en «Ingresos del mes»
  barra: [160, 330] as const,     // la barra va del 10 % al 85 %
  categorias: 300,
};

export const TOQUES_FINANZAS: Toque[] = [{ f: D + FI.toque, x: 201, y: 412 }];

const BALANCE = 1_284_600;
const META = 630_000;
const CATEGORIAS = [
  { c: 'Costura', v: 386_400, p: 1 },
  { c: 'Mercería', v: 112_000, p: 0.29 },
  { c: 'Arreglos', v: 40_000, p: 0.1 },
];

export function PantallaFinanzas() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - D;

  const cuenta = interpolate(f, FI.cuenta, [0, BALANCE], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pct = interpolate(f, FI.barra, [10, 85], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tocado = f >= FI.toque;
  const cats = (i: number) => spring({ frame: f - FI.categorias - i * 8, fps, config: { damping: 18 } });

  return (
    <div className="absolute inset-0 bg-lino">
      <div className="absolute left-[22px] top-[66px]">
        <p className="kicker text-tinta-suave">Octubre 2026</p>
        <p className="titulo text-[34px] leading-tight">Finanzas</p>
      </div>

      {/* balance general */}
      <div className="absolute left-[18px] right-[18px] top-[146px] h-[176px] overflow-hidden rounded-3xl bg-tinta p-5 text-papel">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rosa/40 blur-3xl" />
        <p className="relative font-mono text-[10px] uppercase tracking-[.16em] text-white/60">Balance general</p>
        <p className="titulo relative mt-1 text-[46px] leading-none">{plata(cuenta)}</p>
        <div className="relative mt-4 flex gap-2">
          <span className="flex-1 rounded-2xl bg-white/10 px-3 py-2"><span className="block text-[10px] text-white/60">INGRESOS</span><b className="font-mono text-[14px]">{plata(538_400 * cuenta / BALANCE)}</b></span>
          <span className="flex-1 rounded-2xl bg-white/10 px-3 py-2"><span className="block text-[10px] text-white/60">GASTOS</span><b className="font-mono text-[14px]">{plata(96_200 * cuenta / BALANCE)}</b></span>
        </div>
      </div>

      {/* ingresos del mes · centro en (201, 412) */}
      <div className={`absolute left-[18px] right-[18px] top-[340px] h-[158px] rounded-3xl border-2 bg-white p-5 ${tocado ? 'border-rosa' : 'border-linea'}`}>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-extrabold">Ingresos del mes</p>
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700"><TrendingUp size={13} /> +18 %</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="font-mono text-[24px] font-bold">{plata(META * pct / 100)}</span>
          <span className="font-mono text-[13px] font-bold text-rosa">{Math.round(pct)} %</span>
        </div>
        <div className="mt-2.5 h-3.5 overflow-hidden rounded-full bg-lino">
          <div className="h-full rounded-full bg-gradient-to-r from-rosa to-[#F2803C]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 font-mono text-[10px] text-tinta-suave">META DEL MES {plata(META)}</p>
      </div>

      {/* categorías */}
      <div className="absolute left-[18px] right-[18px] top-[514px] rounded-3xl border border-linea bg-papel px-5 py-4">
        {CATEGORIAS.map((c, i) => (
          <div key={c.c} className="py-1.5" style={{ opacity: cats(i), transform: `translateX(${interpolate(cats(i), [0, 1], [20, 0])}px)` }}>
            <div className="flex justify-between text-[13px] font-bold"><span>{c.c}</span><span className="font-mono">{plata(c.v)}</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-lino">
              <div className="h-full rounded-full bg-rosa" style={{ width: `${c.p * 100 * cats(i)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
