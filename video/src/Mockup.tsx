/* ============================================================
   MOCKUPS · la pantalla del celular SOLA (sin marco), para las
   capturas de la landing (/app → iPhone pegajoso).
   Se renderizan como still en un frame donde la escena ya está
   «completa». Ver npm run mockups.
============================================================ */
import { AbsoluteFill } from 'remotion';
import { PantallaAgenda } from './escenas/PantallaAgenda';
import { PantallaFinanzas } from './escenas/PantallaFinanzas';
import { PantallaMedidas } from './escenas/PantallaMedidas';
import { BarraNav } from './ui/BarraNav';
import { BarraEstado } from './ui/IPhone';

const PANTALLAS = { medidas: PantallaMedidas, agenda: PantallaAgenda, finanzas: PantallaFinanzas };
const POSICION = { medidas: 0, agenda: 1, finanzas: 2 };

export function Mockup({ pantalla }: { pantalla: keyof typeof PANTALLAS }) {
  const P = PANTALLAS[pantalla];
  return (
    <AbsoluteFill className="overflow-hidden bg-lino font-sans text-tinta">
      <P />
      <BarraEstado />
      {/* en Medidas la hoja tapa la barra de abajo, como en la app */}
      {pantalla !== 'medidas' && <BarraNav posicion={POSICION[pantalla]} />}
    </AbsoluteFill>
  );
}
