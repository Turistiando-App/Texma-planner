#!/usr/bin/env node
/* ============================================================
   COPIAR PWA · mete la PWA (TEXMA.html de la raíz) dentro de la web
   ------------------------------------------------------------
   Un solo dominio: la PWA se sirve en /app de este mismo proyecto
   de Next (next.config.ts reescribe /app → /app/index.html).
   TEXMA.html de la raíz sigue siendo LA fuente: esto genera
   web/public/app/ a partir de ella. La carpeta generada se commitea,
   así el build de Vercel no depende de archivos fuera de web/.

   Ajustes al copiar (la fuente no se toca):
     · <base href="/app/">: la página vive en /app (sin barra final),
       y sin esto 'sw.js', 'onb1.jpg', etc. se buscarían en la raíz.
     · el service worker se registra con scope '/app' (next.config
       manda el header Service-Worker-Allowed para permitirlo).
     · sw.js sin './' en el precache: /app/ redirige a /app y un
       redirect no se puede usar para navegar offline.
     · manifest con start_url/scope/id = /app.

   Corre solo en `npm run dev` / `npm run build` (predev/prebuild)
   cuando encuentra ../TEXMA.html. A mano: npm run pwa
============================================================ */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const raiz = join(web, '..');
const destino = join(web, 'public', 'app');
const fuente = join(raiz, 'TEXMA.html');

const indice = join(destino, 'index.html');
const hayFuente = existsSync(fuente);
if (!hayFuente && !existsSync(indice)) throw new Error('[pwa] no hay ../TEXMA.html ni public/app/index.html');

const ARCHIVOS = [
  'favicon.png', 'icon-192.png', 'icon-512.png', 'icon-mask.png', 'icon.svg',
  'maniqui.png', 'figurin.png', 'logo-texma.png', 'onb1.jpg', 'onb2.jpg', 'onb3.jpg', 'splash-gym.jpg', 'img_welcome.jpg',
  'notif_texma.mp3', 'alarma_texma.wav', 'gsap.min.js', 'fonts',
];

/* reemplazo que tiene que existir: si la fuente cambió y no está, cortar */
function cambiar(txt, de, a, que) {
  if (!txt.includes(de)) throw new Error(`[pwa] no encontré ${que} en la fuente: revisá scripts/copiar-pwa.mjs`);
  return txt.split(de).join(a);
}

let html;
if (hayFuente) {
  await rm(destino, { recursive: true, force: true });
  await mkdir(destino, { recursive: true });
  for (const a of ARCHIVOS) {
    const de = join(raiz, a);
    if (existsSync(de)) await cp(de, join(destino, a), { recursive: true });
    else console.warn(`[pwa] falta ${a} (sigo sin él)`);
  }

  /* index.html */
  html = await readFile(fuente, 'utf8');
  html = cambiar(html, '<head>', '<head>\n<base href="/app/">', '<head>');
  html = cambiar(html, "navigator.serviceWorker.register('sw.js')", "navigator.serviceWorker.register('sw.js',{scope:'/app'})", 'el register del SW');

  /* sw.js */
  let sw = await readFile(join(raiz, 'sw.js'), 'utf8');
  const RAIZ_PRECACHE = /^\s*'\.\/',\r?\n/m;
  if (!RAIZ_PRECACHE.test(sw)) throw new Error("[pwa] no encontré './' en el PRECACHE de sw.js");
  sw = sw.replace(RAIZ_PRECACHE, '');
  await writeFile(join(destino, 'sw.js'), sw);

  /* manifest.json */
  const man = JSON.parse(await readFile(join(raiz, 'manifest.json'), 'utf8'));
  Object.assign(man, { id: '/app', start_url: '/app', scope: '/app' });
  await writeFile(join(destino, 'manifest.json'), JSON.stringify(man, null, 2) + '\n');
} else {
  console.log('[pwa] no encontré ../TEXMA.html: uso la copia commiteada en public/app');
  html = await readFile(indice, 'utf8');
}

/* ============================================================
   UNA sola clave, siempre emparejada
   Si el entorno tiene LIC_PRIV (en Vercel, durante el build), la clave
   pública de la app se DERIVA de ella: la parte pública (x, y) viene
   dentro del JWK privado. Así la app y el servidor no se pueden
   desincronizar aunque la LIC_PRIV de Vercel cambie.
============================================================ */
const RE_PUB = /const LIC_PUB=\{kty:'EC',crv:'P-256',x:'[^']+',y:'[^']+'\};/;
if (!RE_PUB.test(html)) throw new Error('[pwa] no encontré «const LIC_PUB={...};» en la app');
const crudo = String(process.env.LIC_PRIV || '').replace(/^\uFEFF/, '').trim().replace(/^'|'$/g, '');
if (crudo) {
  let jwk;
  try { jwk = JSON.parse(crudo); } catch { throw new Error('[pwa] LIC_PRIV del entorno no es un JSON válido'); }
  if (!jwk.x || !jwk.y || !jwk.d) throw new Error('[pwa] LIC_PRIV del entorno no es una clave privada EC completa (faltan x, y o d)');
  html = html.replace(RE_PUB, `const LIC_PUB={kty:'EC',crv:'P-256',x:'${jwk.x}',y:'${jwk.y}'};`);
  console.log('[pwa] LIC_PUB derivada de la LIC_PRIV del entorno');
}
await writeFile(indice, html);

/* la clave pública de la app → lib/lic-pubs.json. /api/activate verifica su
   propia firma contra ella ANTES de tocar la base: si LIC_PRIV no es pareja,
   corta ahí y el código no queda «Activo» a medias. */
const pubs = [...html.matchAll(/const LIC_PUB=\{kty:'EC',crv:'P-256',x:'([^']+)',y:'([^']+)'\}/g)]
  .map(m => ({ kty: 'EC', crv: 'P-256', x: m[1], y: m[2] }));
await writeFile(join(web, 'lib', 'lic-pubs.json'), JSON.stringify(pubs, null, 2) + '\n');

console.log(`[pwa] PWA lista en public/app · clave pública ${pubs[0].x.slice(0, 8)}… en lib/lic-pubs.json`);
