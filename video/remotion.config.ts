import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(20);
Config.setOverwriteOutput(true);
/* Tailwind v4 para las clases de la UI simulada (src/estilos.css) */
Config.overrideWebpackConfig(c => enableTailwind(c));
