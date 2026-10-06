/* ============================================================
   VIDEO TEXMA · 1920×1080 · 30 fps · 3000 frames (1m40s)
   ------------------------------------------------------------
     0–450     Intro     gancho → el iPhone sube al centro
     450–1050  Medidas   zoom al celu, nueva clienta, calculadora
     1050–1650 Agenda    translateX a Agenda, «En proceso» → «Terminado»
     1650–2250 Finanzas  balance y barra de ingresos del 10 % al 85 %
     2250–2700 Offline   zoom out, compu + tablet, switch Modo Offline
     2700–3000 Cierre    logo + «Comprar App» con latido
   El iPhone es UNO solo durante todo el video: su posición y escala
   dependen del frame global (telefono()). Las pantallas viven en una
   tira horizontal que se desliza con translateX al cambiar de pestaña.
   Los textos de afuera van en <Sequence> (frames relativos).
============================================================ */
import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Cierre } from './escenas/Cierre';
import { Offline } from './escenas/Offline';
import { PantallaAgenda, TOQUES_AGENDA } from './escenas/PantallaAgenda';
import { PantallaFinanzas, TOQUES_FINANZAS } from './escenas/PantallaFinanzas';
import { hojaMedidas, PantallaMedidas, TOQUES_MEDIDAS } from './escenas/PantallaMedidas';
import { Gancho, Leyenda } from './escenas/Textos';
import { CAMBIO_TAB, ESCENA as E } from './tiempos';
import { BarraNav, NAV, navX } from './ui/BarraNav';
import { Cursor, type Toque } from './ui/Cursor';
import { IPhone, PANTALLA_W } from './ui/IPhone';
import { clamp } from './ui/util';

const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };

/* todos los clics del cursor, en orden (frames globales) */
const TOQUES: Toque[] = [
  ...TOQUES_MEDIDAS,
  { f: E.agenda.desde - 12, x: navX('agenda'), y: NAV.y },
  ...TOQUES_AGENDA,
  { f: E.finanzas.desde - 12, x: navX('finanzas'), y: NAV.y },
  ...TOQUES_FINANZAS,
];

/* dónde está el iPhone en cada frame */
function telefono(f: number, fps: number) {
  const sube = spring({ frame: f - 240, fps, config: { damping: 18, mass: 1.1 } });
  const zoomIn = [E.medidas.desde, E.medidas.desde + 50];
  const zoomOut = [E.offline.desde, E.offline.desde + 60];
  const fin = [E.cierre.desde, E.cierre.desde + 30];

  const x = interpolate(f, [...zoomIn, ...zoomOut], [960, 1240, 1240, 960], suave);
  const y = 540 + interpolate(sube, [0, 1], [1150, 0]) + interpolate(f, zoomOut, [0, -10], suave);
  const escala = interpolate(f, [...zoomIn, ...zoomOut, ...fin], [0.88, 1.1, 1.1, 0.6, 0.6, 0.52], suave);
  const opacidad = interpolate(f, fin, [1, 0], clamp);
  const giro = interpolate(sube, [0, 1], [8, 0]);
  return { x, y, escala, opacidad, giro };
}

export function VideoTexma() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = telefono(frame, fps);

  /* pestaña: 0 = Medidas, 1 = Agenda, 2 = Finanzas (continua durante el pasaje) */
  const tab = interpolate(
    frame,
    [E.agenda.desde, E.agenda.desde + CAMBIO_TAB, E.finanzas.desde, E.finanzas.desde + CAMBIO_TAB],
    [0, 1, 1, 2],
    suave,
  );
  const flota = Math.sin(frame / fps * 1.3) * 6;

  return (
    <AbsoluteFill className="overflow-hidden bg-[#0A0A0A] font-sans">
      {/* resplandor de fondo */}
      <AbsoluteFill style={{
        background: `radial-gradient(45% 55% at ${(t.x / 1920) * 100}% 50%, rgba(236,25,104,.20), transparent 70%),
                     radial-gradient(35% 40% at 8% 100%, rgba(166,16,72,.16), transparent 70%)`,
      }} />

      {/* ---- textos de afuera ---- */}
      <Sequence from={E.intro.desde} durationInFrames={E.intro.dura} name="Intro · gancho">
        <Gancho />
      </Sequence>
      <Sequence from={E.medidas.desde + 20} durationInFrames={E.medidas.dura - 20} name="Medidas · leyenda">
        <Leyenda n="01" kicker="Medidas" titulo="Cada clienta, con sus medidas." bajada="Tipeás y la calculadora de patrón hace el resto." dura={E.medidas.dura - 20} />
      </Sequence>
      <Sequence from={E.agenda.desde + 10} durationInFrames={E.agenda.dura - 10} name="Agenda · leyenda">
        <Leyenda n="02" kicker="Agenda" titulo="Cada pedido, con su estado." bajada="De «en proceso» a «terminado» en un toque." dura={E.agenda.dura - 10} />
      </Sequence>
      <Sequence from={E.finanzas.desde + 10} durationInFrames={E.finanzas.dura - 10} name="Finanzas · leyenda">
        <Leyenda n="03" kicker="Finanzas" titulo="Tu plata, clara." bajada="Balance, ingresos y metas del mes, sin planillas." dura={E.finanzas.dura - 10} />
      </Sequence>
      <Sequence from={E.offline.desde} durationInFrames={E.offline.dura + 40} name="Offline">
        <Offline />
      </Sequence>
      <Sequence from={E.cierre.desde} durationInFrames={E.cierre.dura} name="Cierre">
        <Cierre />
      </Sequence>

      {/* ---- el iPhone (uno solo para todo el video) ---- */}
      {t.opacidad > 0 && (
        <div className="absolute left-0 top-0" style={{
          transform: `translate(${t.x}px, ${t.y + flota}px) translate(-50%, -50%) scale(${t.escala}) rotate(${t.giro}deg)`,
          opacity: t.opacidad,
        }}>
          <IPhone>
            {/* tira de pantallas: se desliza con translateX al cambiar de pestaña */}
            <div className="absolute inset-y-0 left-0 flex" style={{ width: PANTALLA_W * 3, transform: `translateX(${-tab * PANTALLA_W}px)` }}>
              {[PantallaMedidas, PantallaAgenda, PantallaFinanzas].map((P, i) => (
                <div key={i} className="relative h-full shrink-0" style={{ width: PANTALLA_W }}><P /></div>
              ))}
            </div>
            <BarraNav posicion={tab} oculta={Math.min(1, Math.max(0, hojaMedidas(frame, fps)))} />
            <Cursor toques={TOQUES} aparece={E.medidas.desde + 20} desaparece={E.offline.desde - 15} />
          </IPhone>
        </div>
      )}
    </AbsoluteFill>
  );
}
