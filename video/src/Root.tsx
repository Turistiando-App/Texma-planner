import { Composition, Folder } from 'remotion';
import './estilos.css';
import './tema';
import { Mockup } from './Mockup';
import { VideoTexma } from './VideoTexma';
import { PANTALLA_H, PANTALLA_W } from './ui/IPhone';
import { ALTO, ANCHO, FPS, TOTAL } from './tiempos';

/* las pantallas leen el frame GLOBAL del video: los mockups duran lo mismo
   y se sacan en el frame donde cada escena queda completa (npm run mockups) */
const MOCKUPS = ['medidas', 'agenda', 'finanzas'] as const;

export const Root = () => (
  <>
    <Composition
      id="VideoTexma"
      component={VideoTexma}
      durationInFrames={TOTAL}
      fps={FPS}
      width={ANCHO}
      height={ALTO}
    />
    <Folder name="Mockups">
      {MOCKUPS.map(p => (
        <Composition
          key={p}
          id={`Mockup-${p}`}
          component={Mockup}
          defaultProps={{ pantalla: p }}
          durationInFrames={TOTAL}
          fps={FPS}
          width={PANTALLA_W}
          height={PANTALLA_H}
        />
      ))}
    </Folder>
  </>
);
