/* La píldora de abajo de la PWA: Hoy · Agenda · Finanzas · Costura.
   `posicion` es continua (0 = Costura/Medidas, 1 = Agenda, 2 = Finanzas)
   para que la marca rosa viaje junto con el deslizamiento. */
import { CalendarDays, CircleDollarSign, House, Scissors } from 'lucide-react';
import { interpolate } from 'remotion';
import { PANTALLA_W } from './IPhone';

export const NAV = { ancho: 300, alto: 64, y: 796 };
const ITEMS = [
  { id: 'hoy', I: House },
  { id: 'agenda', I: CalendarDays },
  { id: 'finanzas', I: CircleDollarSign },
  { id: 'costura', I: Scissors },
] as const;
export type ItemNav = (typeof ITEMS)[number]['id'];

const SLOT = NAV.ancho / ITEMS.length;
const IZQ = (PANTALLA_W - NAV.ancho) / 2;
export const navX = (id: ItemNav) => IZQ + SLOT * ITEMS.findIndex(i => i.id === id) + SLOT / 2;

/* posición de pantalla → índice del ítem del nav */
const ITEM_DE_POSICION = [3, 1, 2];

export function BarraNav({ posicion, oculta = 0 }: { posicion: number; oculta?: number }) {
  const marca = interpolate(posicion, [0, 1, 2], ITEM_DE_POSICION, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const activo = ITEM_DE_POSICION[Math.round(Math.min(2, Math.max(0, posicion)))];
  return (
    <div className="absolute z-30 flex rounded-full border border-linea bg-papel/95 shadow-[0_12px_30px_rgba(43,38,34,.14)]"
      style={{ left: IZQ, top: NAV.y - NAV.alto / 2, width: NAV.ancho, height: NAV.alto, opacity: 1 - oculta, transform: `translateY(${oculta * 120}px)` }}>
      <div className="absolute top-[9px] h-[46px] w-[46px] rounded-2xl bg-rosa-claro" style={{ left: marca * SLOT + (SLOT - 46) / 2 }} />
      {ITEMS.map((it, i) => (
        <div key={it.id} className={`relative grid flex-1 place-items-center ${i === activo ? 'text-rosa' : 'text-tinta-suave'}`}>
          <it.I size={23} strokeWidth={1.8} />
        </div>
      ))}
    </div>
  );
}
