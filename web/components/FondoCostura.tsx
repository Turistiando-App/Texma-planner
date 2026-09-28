'use client';
/* ============================================================
   Fondo de toda la página: carretes, agujas y botones flotando.
   Capa fija detrás del contenido. Cada pieza se mueve a su propia
   velocidad con el scroll de la página (parallax) y gira un poco,
   así se siente profundidad. Sin movimiento si el sistema lo pide.
============================================================ */
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Aguja, Boton, Carrete } from './dibujos';

const PIEZAS = [
  { tipo: 'carrete', color: '#F2803C', x: '62%', y: '20%', w: 64, vel: -260, giro: 40, op: 0.22, soloDesktop: true },
  { tipo: 'aguja', x: '88%', y: '12%', w: 22, vel: -420, giro: 25, op: 0.3 },
  { tipo: 'boton', color: '#FBD9E6', x: '80%', y: '48%', w: 54, vel: -180, giro: 180, op: 0.35 },
  { tipo: 'carrete', color: '#8FA88A', x: '14%', y: '70%', w: 52, vel: -340, giro: -30, op: 0.2 },
  { tipo: 'aguja', x: '4%', y: '44%', w: 18, vel: -520, giro: -20, op: 0.25 },
  { tipo: 'boton', color: '#F1EADF', x: '92%', y: '82%', w: 44, vel: -240, giro: -160, op: 0.4 },
  { tipo: 'carrete', color: '#EC1968', x: '70%', y: '96%', w: 46, vel: -380, giro: 60, op: 0.16 },
] as const;
type PiezaT = { tipo: string; color?: string; x: string; y: string; w: number; vel: number; giro: number; op: number; soloDesktop?: boolean };
/* en pantallas angostas algunas piezas caerían encima del título */
const cls = (pz: PiezaT) => `absolute ${pz.soloDesktop ? 'hidden md:block' : ''}`;

function Pieza({ pz, progreso }: { pz: PiezaT; progreso: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const y = useTransform(progreso, [0, 1], [0, pz.vel]);
  const rotate = useTransform(progreso, [0, 1], [0, pz.giro]);
  return (
    <motion.div className={cls(pz)} style={{ left: pz.x, top: pz.y, width: pz.w, opacity: pz.op, y, rotate }}>
      {pz.tipo === 'carrete' && <Carrete color={pz.color} className="w-full" />}
      {pz.tipo === 'aguja' && <Aguja className="w-full" />}
      {pz.tipo === 'boton' && <Boton color={pz.color} className="w-full" />}
    </motion.div>
  );
}

export default function FondoCostura() {
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {PIEZAS.map((pz, i) =>
        quieto ? (
          <div key={i} className={cls(pz)} style={{ left: pz.x, top: pz.y, width: pz.w, opacity: pz.op }}>
            {pz.tipo === 'carrete' && <Carrete color={pz.color} className="w-full" />}
            {pz.tipo === 'aguja' && <Aguja className="w-full" />}
            {pz.tipo === 'boton' && <Boton color={pz.color} className="w-full" />}
          </div>
        ) : (
          <Pieza key={i} pz={pz} progreso={scrollYProgress} />
        ),
      )}
    </div>
  );
}
