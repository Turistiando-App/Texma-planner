/* ============================================================
   TIEMPOS · en FRAMES a 30 fps (30 frames = 1 segundo)
   ------------------------------------------------------------
   Cada escena arranca donde termina la anterior. Los momentos de
   adentro de cada escena (clics, tipeo, etc.) están en su archivo
   de src/escenas, relativos al inicio de la escena.
============================================================ */
export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

export const ESCENA = {
  intro: { desde: 0, dura: 450 },
  medidas: { desde: 450, dura: 600 },
  agenda: { desde: 1050, dura: 600 },
  finanzas: { desde: 1650, dura: 600 },
  offline: { desde: 2250, dura: 450 },
  cierre: { desde: 2700, dura: 300 },
};

export const TOTAL = ESCENA.cierre.desde + ESCENA.cierre.dura; // 3000

/* pasaje entre pestañas del celular (translateX) */
export const CAMBIO_TAB = 30;
