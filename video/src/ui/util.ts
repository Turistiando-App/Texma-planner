import { interpolate } from 'remotion';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/* texto que se tipea: devuelve lo escrito hasta este frame */
export function tipear(texto: string, frame: number, desde: number, framesPorLetra = 4) {
  const n = Math.floor((frame - desde) / framesPorLetra) + 1;
  return frame < desde ? '' : texto.slice(0, Math.max(0, n));
}

/* caret que titila mientras el campo está activo */
export const caret = (frame: number) => (Math.floor(frame / 15) % 2 === 0 ? '|' : ' ');

/* 0 → 1 entre dos frames (lineal, clampeado) */
export const tramo = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

const NF = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
export const plata = (n: number) => `$ ${NF.format(Math.round(n))}`;
