/* ============================================================
   PANTALLA AGENDA
   Los pedidos de la semana entran escalonados; el cursor toca la
   pastilla de «Vestido de fiesta Sofía» y pasa de «En proceso»
   (naranja) a «Terminado» (verde). Arriba cae el aviso.
============================================================ */
import { BellRing, Check, Clock } from 'lucide-react';
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ESCENA } from '../tiempos';
import type { Toque } from '../ui/Cursor';
import { clamp } from '../ui/util';

const D = ESCENA.agenda.desde;
export const A = {
  entran: 30,        // las tarjetas entran
  pastilla: 170,     // clic en la pastilla de estado
  aviso: 205,        // cae el aviso de arriba
};

const PASTILLA = { x: 98, y: 357 };
export const TOQUES_AGENDA: Toque[] = [{ f: D + A.pastilla, ...PASTILLA }];

const DIAS = [['L', 12], ['M', 13], ['M', 14], ['J', 15], ['V', 16], ['S', 17], ['D', 18]] as const;
const OTROS = [
  { t: 'Arreglo de pantalón · Marta', d: 'Vie 16 · 11:00', e: 'Pendiente', c: 'bg-linea text-tinta-suave' },
  { t: 'Camisa a medida · Ana', d: 'Sáb 17 · 10:30', e: 'En proceso', c: 'bg-[#FDEBDD] text-[#B4531A] border border-[#F5B98C]' },
];

export function PantallaAgenda() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = frame - D;

  const cambio = interpolate(a, [A.pastilla + 2, A.pastilla + 14], [0, 1], clamp);
  const pop = spring({ frame: a - A.pastilla - 2, fps, config: { damping: 9, stiffness: 180 } });
  const terminado = a >= A.pastilla + 8;
  const aviso = spring({ frame: a - A.aviso, fps, config: { damping: 15 } }) - spring({ frame: a - A.aviso - 110, fps, config: { damping: 15 } });
  const entra = (i: number) => spring({ frame: a - A.entran - i * 8, fps, config: { damping: 16 } });

  return (
    <div className="absolute inset-0 bg-lino">
      <div className="absolute left-[22px] top-[66px]">
        <p className="kicker text-tinta-suave">Semana del 12 al 18</p>
        <p className="titulo text-[34px] leading-tight">Agenda</p>
      </div>

      {/* semana */}
      <div className="absolute left-[18px] right-[18px] top-[146px] flex gap-1.5">
        {DIAS.map(([l, n]) => (
          <div key={n} className={`flex h-[64px] flex-1 flex-col items-center justify-center rounded-2xl ${n === 14 ? 'bg-tinta text-papel' : 'border border-linea bg-papel'}`}>
            <span className="font-mono text-[9px] opacity-60">{l}</span>
            <span className="text-[17px] font-extrabold">{n}</span>
          </div>
        ))}
      </div>

      <p className="kicker absolute left-[22px] top-[228px] text-tinta-suave">Pedidos de la semana</p>

      {/* tarjeta principal · pastilla centrada en (98, 357) */}
      <div className="absolute left-[18px] right-[18px] top-[252px] h-[160px] rounded-3xl border border-linea bg-white p-4 shadow-[0_10px_30px_rgba(43,38,34,.08)]"
        style={{ opacity: entra(0), transform: `translateY(${interpolate(entra(0), [0, 1], [30, 0])}px)` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[17px] font-extrabold leading-tight">Vestido de fiesta Sofía</p>
            <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-tinta-suave"><Clock size={12} /> ENTREGA MIÉ 14 · 18:00</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-rosa-claro text-sm font-extrabold text-rosa-oscuro">SG</span>
        </div>
        <div className="absolute flex h-[34px] w-[128px] items-center justify-center gap-1.5 rounded-full border text-[13px] font-extrabold"
          style={{
            left: PASTILLA.x - 18 - 64, top: PASTILLA.y - 252 - 17,
            background: interpolateColors(cambio, [0, 1], ['#FDEBDD', '#E3F2EA']),
            borderColor: interpolateColors(cambio, [0, 1], ['#F5B98C', '#A9D6BD']),
            color: interpolateColors(cambio, [0, 1], ['#B4531A', '#256B47']),
            transform: `scale(${a >= A.pastilla ? 1 + 0.12 * Math.sin(Math.min(1, pop) * Math.PI) : 1})`,
          }}>
          {terminado && <Check size={15} strokeWidth={3} />}
          {terminado ? 'Terminado' : 'En proceso'}
        </div>
        <div className="absolute bottom-4 right-4 flex gap-1.5 font-mono text-[10px]">
          <span className="rounded-full border border-linea bg-papel px-2.5 py-1">SEÑA $ 20.000</span>
          <span className="rounded-full border border-linea bg-papel px-2.5 py-1">SALDO $ 45.000</span>
        </div>
      </div>

      {/* otros pedidos */}
      {OTROS.map((o, i) => (
        <div key={o.t} className="absolute left-[18px] right-[18px] flex h-[92px] items-center justify-between rounded-3xl border border-linea bg-papel px-4"
          style={{ top: 428 + i * 104, opacity: entra(i + 1), transform: `translateY(${interpolate(entra(i + 1), [0, 1], [30, 0])}px)` }}>
          <div>
            <p className="text-[15px] font-extrabold">{o.t}</p>
            <p className="mt-1 font-mono text-[11px] text-tinta-suave">{o.d}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold ${o.c}`}>{o.e}</span>
        </div>
      ))}

      {/* aviso que cae de arriba */}
      <div className="absolute left-[14px] right-[14px] top-[58px] z-[45] flex items-center gap-3 rounded-[22px] bg-white/95 p-3 shadow-[0_20px_40px_rgba(43,38,34,.2)]"
        style={{ opacity: aviso, transform: `translateY(${interpolate(aviso, [0, 1], [-120, 0])}px)` }}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white"><BellRing size={20} /></span>
        <span><b className="block text-[14px]">¡Pedido terminado!</b><span className="text-[12px] text-tinta-suave">Avisale a Sofía que ya puede retirar.</span></span>
      </div>
    </div>
  );
}
