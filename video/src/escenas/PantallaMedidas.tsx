/* ============================================================
   PANTALLA MEDIDAS (pestaña Costura)
   Clic en «Nueva clienta» → sube la hoja → se tipean nombre y
   medidas → aparece la calculadora de patrón → «Guardar».
   Los momentos (M.*) son frames relativos al inicio de la escena.
============================================================ */
import { Calculator, Check, Plus } from 'lucide-react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ESCENA } from '../tiempos';
import type { Toque } from '../ui/Cursor';
import { caret, clamp, tipear, tramo } from '../ui/util';

const D = ESCENA.medidas.desde;
export const M = {
  nueva: 75,                       // clic en «Nueva clienta»
  nombre: 100, busto: 170, cintura: 230, cadera: 290,   // clic en cada campo (tipea 6 frames después)
  calculadora: 340,                // aparece el resultado
  guardar: 480,                    // clic en «Guardar»
};

const HOJA_TOP = 110;
const MEDIDAS = [
  { id: 'busto', l: 'Busto', v: '92', x: 76 },
  { id: 'cintura', l: 'Cintura', v: '70', x: 201 },
  { id: 'cadera', l: 'Cadera', v: '98', x: 326 },
] as const;
const FILA_Y = 327;

export const TOQUES_MEDIDAS: Toque[] = [
  { f: D + M.nueva, x: 201, y: 178 },
  { f: D + M.nombre, x: 250, y: 217 },
  ...MEDIDAS.map(m => ({ f: D + M[m.id], x: m.x, y: FILA_Y })),
  { f: D + M.guardar, x: 201, y: 627 },
];

const CLIENTAS = [
  { n: 'Lucía Fernández', d: 'Vestido de fiesta · 3 medidas' },
  { n: 'Marta Ríos', d: 'Arreglo de pantalón · 2 medidas' },
  { n: 'Ana Paz', d: 'Camisa a medida · 6 medidas' },
];

/* 0 = hoja cerrada, 1 = abierta (VideoTexma la usa para esconder la barra de abajo) */
export function hojaMedidas(frame: number, fps: number) {
  const m = frame - D;
  return spring({ frame: m - M.nueva - 4, fps, config: { damping: 18 } }) - spring({ frame: m - M.guardar - 14, fps, config: { damping: 18 } });
}

export function PantallaMedidas() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = frame - D;

  const hoja = hojaMedidas(frame, fps);
  const hojaY = interpolate(hoja, [0, 1], [760, 0]);
  const calc = spring({ frame: m - M.calculadora, fps, config: { damping: 15 } });
  const nuevaFila = spring({ frame: m - M.guardar - 22, fps, config: { damping: 14 } });

  const activo = (desde: number, hasta: number) => m >= desde && m < hasta;

  return (
    <div className="absolute inset-0 bg-lino">
      <div className="absolute left-[22px] top-[66px]">
        <p className="kicker text-tinta-suave">Tu taller</p>
        <p className="titulo text-[34px] leading-tight">Costura</p>
      </div>

      {/* botón */}
      <div className={`absolute left-[18px] right-[18px] top-[150px] flex h-[56px] items-center justify-center gap-2 rounded-2xl font-extrabold text-white shadow-[0_10px_24px_rgba(236,25,104,.35)] ${m >= M.nueva && m < M.nueva + 8 ? 'bg-rosa-oscuro' : 'bg-rosa'}`}>
        <Plus size={20} strokeWidth={2.6} /> Nueva clienta
      </div>

      {/* lista de clientas (la nueva entra arriba después de guardar) */}
      <div className="absolute left-[18px] right-[18px] top-[222px] space-y-2.5">
        {m > M.guardar + 20 && (
          <div className="flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-rosa bg-white px-4"
            style={{ height: 66 * Math.min(1, nuevaFila), transform: `scale(${0.9 + 0.1 * nuevaFila})`, opacity: nuevaFila }}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-rosa text-sm font-extrabold text-white">SG</span>
            <span className="flex-1"><b className="block text-[15px]">Sofía Gómez</b><span className="text-xs text-tinta-suave">Nueva · 3 medidas</span></span>
            <Check size={18} className="text-emerald-600" />
          </div>
        )}
        {CLIENTAS.map(c => (
          <div key={c.n} className="flex h-[66px] items-center gap-3 rounded-2xl border border-linea bg-papel px-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-rosa-claro text-sm font-extrabold text-rosa-oscuro">{c.n.split(' ').map(p => p[0]).join('')}</span>
            <span><b className="block text-[15px]">{c.n}</b><span className="text-xs text-tinta-suave">{c.d}</span></span>
          </div>
        ))}
      </div>

      {/* velo + hoja «Nueva clienta» */}
      <div className="absolute inset-0 z-[35] bg-tinta" style={{ opacity: hoja * 0.35 }} />
      <div className="absolute inset-x-0 bottom-0 z-[36] rounded-t-[28px] border border-linea bg-papel px-[18px]"
        style={{ top: HOJA_TOP, transform: `translateY(${hojaY}px)` }}>
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-linea" />
        <p className="titulo mt-2 text-[26px]">Nueva clienta</p>

        {/* nombre · centro en y=217 de pantalla */}
        <div className={`absolute left-[18px] right-[18px] flex h-[54px] items-center rounded-2xl border-2 bg-lino px-4 text-[16px] font-bold ${activo(M.nombre, M.busto) ? 'border-rosa' : 'border-linea'}`}
          style={{ top: 217 - HOJA_TOP - 27 }}>
          <span className="w-20 text-xs font-semibold text-tinta-suave">Nombre</span>
          {tipear('Sofía Gómez', m, M.nombre + 6, 3)}{activo(M.nombre, M.busto) && caret(frame)}
        </div>

        {/* medidas en una fila · centro en y=327 */}
        <p className="kicker absolute left-[18px] text-tinta-suave" style={{ top: 262 - HOJA_TOP }}>Medidas en cm</p>
        <div className="absolute left-[18px] right-[18px] flex gap-2" style={{ top: FILA_Y - HOJA_TOP - 37 }}>
          {MEDIDAS.map((md, i) => {
            const sig = i < 2 ? M[MEDIDAS[i + 1].id] : M.calculadora;
            const on = activo(M[md.id], sig);
            return (
              <div key={md.id} className={`flex h-[74px] flex-1 flex-col justify-center rounded-2xl border-2 bg-lino px-3 ${on ? 'border-rosa' : 'border-linea'}`}>
                <span className="text-[11px] font-semibold text-tinta-suave">{md.l}</span>
                <span className="font-mono text-[22px] font-bold">{tipear(md.v, m, M[md.id] + 6, 6) || (on ? '' : '—')}{on && caret(frame)}</span>
              </div>
            );
          })}
        </div>

        {/* calculadora de patrón */}
        <div className="absolute left-[18px] right-[18px] rounded-3xl bg-tinta p-4 text-papel"
          style={{ top: 392 - HOJA_TOP, opacity: calc, transform: `translateY(${interpolate(calc, [0, 1], [24, 0])}px)` }}>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-rosa-claro"><Calculator size={14} /> Calculadora de patrón</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {MEDIDAS.map((md, i) => {
              const v = +md.v / 4 * tramo(m, M.calculadora + 8 + i * 6, M.calculadora + 40 + i * 6);
              return (
                <div key={md.id} className="rounded-2xl bg-white/10 px-2.5 py-2">
                  <span className="block text-[10px] text-white/60">{md.l} ÷4</span>
                  <span className="font-mono text-[19px] font-bold">{v.toFixed(1).replace('.', ',')}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] text-white/70">Molde delantero: <b className="text-white">{(92 / 2 * tramo(m, M.calculadora + 30, M.calculadora + 60)).toFixed(0)} cm</b> de ancho (busto ÷2)</p>
        </div>

        {/* guardar · centro en y=627 */}
        <div className={`absolute left-[18px] right-[18px] grid h-[54px] place-items-center rounded-full font-extrabold text-white ${m >= M.guardar && m < M.guardar + 8 ? 'bg-rosa-oscuro' : 'bg-rosa'}`}
          style={{ top: 627 - HOJA_TOP - 27, opacity: interpolate(m, [M.calculadora + 40, M.calculadora + 60], [0.4, 1], clamp) }}>
          Guardar clienta
        </div>
      </div>
    </div>
  );
}
