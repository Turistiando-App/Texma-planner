/* ============================================================
   COMPOSICIONES REMOTION · animaciones en bucle de la mercería
   ------------------------------------------------------------
   Figuras geométricas en trazo blanco sobre fondo transparente,
   pensadas para ir encima de los banners de color de cada rubro.
   Todo se mueve con senos de `t` (una vuelta completa = DURACION),
   así el último cuadro empalma con el primero y el loop no salta.
   Se reproducen con @remotion/player (ver components/MerceriaAnim).
============================================================ */
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const LADO = 200;        // lienzo cuadrado, en px de composición
export const FPS = 30;
export const DURACION = 90;     // 3 s por vuelta

const B = '#FFFFFF';
const vuelta = (f: number) => (f / DURACION) * Math.PI * 2;

/* ---- HILOS · carrete que gira y un hilo que rebota hasta la aguja ---- */
export function HiloLoop() {
  const t = vuelta(useCurrentFrame());
  const rebote = Math.abs(Math.sin(t)) * 26;
  const giro = Math.sin(t) * 8;
  const ay = 150 - rebote;            // punta de la aguja
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${LADO} ${LADO}`} width="100%" height="100%" fill="none" stroke={B} strokeLinecap="round" strokeLinejoin="round">
        <g transform={`rotate(${giro} 62 92)`} strokeWidth={5}>
          <rect x={36} y={52} width={52} height={10} rx={4} />
          <rect x={36} y={122} width={52} height={10} rx={4} />
          <rect x={44} y={62} width={36} height={60} fill="rgba(255,255,255,.18)" />
          {[74, 86, 98, 110].map(y => <line key={y} x1={46} y1={y} x2={78} y2={y + 4} strokeWidth={3} opacity={0.8} />)}
        </g>
        <path d={`M80 ${96} C 118 ${70 + rebote}, 128 ${150 - rebote}, 150 ${ay - 34}`} strokeWidth={3.5} />
        <g transform={`translate(150 ${ay}) rotate(${12 + Math.sin(t * 2) * 6})`} strokeWidth={4}>
          <line x1={0} y1={-46} x2={0} y2={8} />
          <ellipse cx={0} cy={-38} rx={3} ry={6} strokeWidth={2.5} />
        </g>
      </svg>
    </AbsoluteFill>
  );
}

/* ---- BOTONES · botón de 4 agujeros que rebota y se aplasta al tocar el piso ---- */
export function BotonLoop() {
  const f = useCurrentFrame();
  const t = vuelta(f);
  const alto = Math.abs(Math.sin(t * 1.5));            // 0 = en el piso
  const y = 130 - alto * 70;
  const aplaste = Math.max(0, 1 - alto * 6);           // solo cerca del piso
  const sx = 1 + aplaste * 0.18, sy = 1 - aplaste * 0.18;
  const giro = (f / DURACION) * 360;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${LADO} ${LADO}`} width="100%" height="100%" fill="none" stroke={B} strokeLinecap="round">
        <ellipse cx={100} cy={170} rx={34 - alto * 16} ry={5} fill="rgba(255,255,255,.25)" stroke="none" />
        <g transform={`translate(100 ${y}) scale(${sx} ${sy}) rotate(${giro})`}>
          <circle r={38} strokeWidth={5} fill="rgba(255,255,255,.16)" />
          <circle r={28} strokeWidth={2.5} opacity={0.7} />
          {[[-9, -9], [9, -9], [-9, 9], [9, 9]].map(([cx, cy]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={4.5} fill={B} stroke="none" />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
}

/* ---- CIERRES · el carro sube y baja: arriba los dientes cerrados, abajo se abren en V ---- */
export function CierreLoop() {
  const t = vuelta(useCurrentFrame());
  const s = (1 - Math.cos(t)) / 2;                     // 0 → 1 → 0
  const arriba = 30, abajo = 176;
  const carro = arriba + 8 + s * (abajo - arriba - 30);
  const dientes = Array.from({ length: 14 }, (_, i) => arriba + 6 + i * 10);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${LADO} ${LADO}`} width="100%" height="100%" fill="none" stroke={B} strokeLinecap="round" strokeLinejoin="round">
        {dientes.map((y, i) => {
          const abre = y > carro ? (y - carro) * 0.38 : 0;
          const lado = i % 2 ? 1 : -1;
          const x = 100 + lado * (5 + abre);
          return (
            <g key={y}>
              <rect x={x - 8} y={y - 3} width={16} height={6} rx={2} fill={B} stroke="none" opacity={0.95} />
              <line x1={100 + lado * (26 + abre)} y1={y - 5} x2={100 + lado * (26 + abre)} y2={y + 5} strokeWidth={6} opacity={0.35} />
            </g>
          );
        })}
        <g transform={`translate(100 ${carro})`}>
          <path d="M-15 -10 L15 -10 L11 14 L-11 14 Z" fill="rgba(255,255,255,.95)" stroke="none" />
          <rect x={-6} y={14} width={12} height={26} rx={6} strokeWidth={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
}

/* ---- ELÁSTICOS · una banda en zigzag que se estira y vuelve ---- */
export function ElasticoLoop() {
  const t = vuelta(useCurrentFrame());
  const e = (1 - Math.cos(t)) / 2;                     // 0 suelto → 1 estirado
  const ancho = 90 + e * 70;
  const x0 = 100 - ancho / 2;
  const picos = 8;
  const amp = 22 - e * 14;                             // estirado = zigzag más plano
  const zig = Array.from({ length: picos * 2 + 1 }, (_, i) =>
    `${i ? 'L' : 'M'}${x0 + (ancho * i) / (picos * 2)} ${100 + (i % 2 ? -amp : amp) / 2}`).join(' ');
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${LADO} ${LADO}`} width="100%" height="100%" fill="none" stroke={B} strokeLinecap="round" strokeLinejoin="round">
        <rect x={x0} y={72} width={ancho} height={56} rx={10} strokeWidth={5} fill="rgba(255,255,255,.16)" />
        <path d={zig} strokeWidth={3.5} />
        <line x1={x0 + 6} y1={84} x2={x0 + ancho - 6} y2={84} strokeWidth={2} opacity={0.6} strokeDasharray="4 6" />
        <line x1={x0 + 6} y1={116} x2={x0 + ancho - 6} y2={116} strokeWidth={2} opacity={0.6} strokeDasharray="4 6" />
        <path d={`M${x0 - 6} 100 l-14 -10 m14 10 l-14 10`} strokeWidth={4} opacity={0.4 + e * 0.6} />
        <path d={`M${x0 + ancho + 6} 100 l14 -10 m-14 10 l14 10`} strokeWidth={4} opacity={0.4 + e * 0.6} />
      </svg>
    </AbsoluteFill>
  );
}

export const LOOPS = { Hilos: HiloLoop, Botones: BotonLoop, Cierres: CierreLoop, Elásticos: ElasticoLoop } as const;
