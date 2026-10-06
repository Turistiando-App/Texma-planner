/* iPhone de mentira. Todo lo de adentro usa coordenadas de la PANTALLA
   (402×852, 0,0 arriba a la izquierda): así los clics del cursor caen
   exactos sobre los botones de la UI simulada. */
import type { ReactNode } from 'react';

export const PANTALLA_W = 402;
export const PANTALLA_H = 852;
export const BORDE = 14;
export const TELEFONO_W = PANTALLA_W + BORDE * 2;
export const TELEFONO_H = PANTALLA_H + BORDE * 2;

export function IPhone({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-[64px] shadow-[0_80px_160px_-40px_rgba(236,25,104,.45),0_40px_80px_-20px_rgba(0,0,0,.9)]"
      style={{ width: TELEFONO_W, height: TELEFONO_H, padding: BORDE, background: 'linear-gradient(160deg,#3a3a3c,#111 40%,#2a2a2c)', boxShadow: 'inset 0 0 0 2px #555' }}>
      <div className="relative overflow-hidden rounded-[50px] bg-lino font-sans text-tinta" style={{ width: PANTALLA_W, height: PANTALLA_H }}>
        {children}
        <BarraEstado />
        <div className="absolute left-1/2 top-3 z-50 h-[34px] w-[118px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

/* hora + señal arriba (la usan el iPhone del video y los mockups) */
export function BarraEstado() {
  return (
    <div className="absolute inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between px-9 pt-1 text-[15px] font-bold">
      <span>9:41</span><span className="tracking-tight">●●● ▮</span>
    </div>
  );
}
