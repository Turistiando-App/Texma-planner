/* fuentes de la marca (las mismas de la PWA). Se cargan una vez al importar. */
import { loadFont as cargarManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as cargarCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as cargarMono } from '@remotion/google-fonts/JetBrainsMono';

cargarManrope('normal', { weights: ['500', '700', '800'], subsets: ['latin'] });
cargarCormorant('italic', { weights: ['700'], subsets: ['latin'] });
cargarMono('normal', { weights: ['400', '700'], subsets: ['latin'] });
