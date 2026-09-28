/* ============================================================
   TEXMA · genera el sonido de ALARMA (alarma_texma.wav)
   ------------------------------------------------------------
   El aviso normal (notif_texma.mp3) dura 1 segundo: para una cita
   importante eso se pierde. La alarma tiene que ser larga e
   insistente, como el despertador del celu.

   Se genera por código y no se baja de ningún lado a propósito:
   así no hay licencias raras adentro del APK y el archivo se puede
   volver a armar en cualquier máquina.

   Correr:  node scripts/hacer-alarma.mjs
   Deja el .wav en la raíz Y en android/app/src/main/res/raw/.
   Ojo con res/raw: minúsculas, guión BAJO, y nada más ahí adentro.
============================================================ */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const SR = 22050;        // Hz · alcanza y sobra para un pitido
const DUR = 15;          // segundos
const total = SR * DUR;
const pcm = new Int16Array(total);

/* Patrón: bip-bip agudo, pausa, y vuelta a empezar cada 1,4 s.
   Dos tonos alternados (no uno solo) porque el cerebro los ignora
   mucho menos: es el truco de los despertadores de verdad. */
const CICLO = 1.4;
const BIPS = [
  { t: 0.00, dur: 0.18, f: 1046 },  // do agudo
  { t: 0.22, dur: 0.18, f: 1318 },  // mi agudo
  { t: 0.44, dur: 0.26, f: 880 },   // la, más largo
];

for (let i = 0; i < total; i++) {
  const t = i / SR;
  const fase = t % CICLO;
  let v = 0;
  for (const b of BIPS) {
    if (fase < b.t || fase >= b.t + b.dur) continue;
    const d = fase - b.t;
    /* rampa de entrada/salida de 8 ms: sin esto suena un «click» feo */
    const env = Math.min(1, d / 0.008, (b.dur - d) / 0.008);
    /* onda cuadrada suavizada = más penetrante que una senoidal pura */
    const s = Math.sin(2 * Math.PI * b.f * d);
    v += env * (0.55 * s + 0.25 * Math.sign(s) * Math.abs(s) ** 3);
  }
  pcm[i] = Math.max(-32767, Math.min(32767, Math.round(v * 26000)));
}

/* --- cabecera WAV PCM 16 bits mono --- */
const datos = Buffer.from(pcm.buffer);
const head = Buffer.alloc(44);
head.write('RIFF', 0);
head.writeUInt32LE(36 + datos.length, 4);
head.write('WAVE', 8);
head.write('fmt ', 12);
head.writeUInt32LE(16, 16);          // tamaño del bloque fmt
head.writeUInt16LE(1, 20);           // 1 = PCM
head.writeUInt16LE(1, 22);           // mono
head.writeUInt32LE(SR, 24);
head.writeUInt32LE(SR * 2, 28);      // bytes por segundo
head.writeUInt16LE(2, 32);           // bytes por muestra
head.writeUInt16LE(16, 34);          // bits
head.write('data', 36);
head.writeUInt32LE(datos.length, 40);
const wav = Buffer.concat([head, datos]);

const destinos = [
  join(raiz, 'alarma_texma.wav'),
  join(raiz, 'android', 'app', 'src', 'main', 'res', 'raw', 'alarma_texma.wav'),
];
for (const d of destinos) {
  await mkdir(dirname(d), { recursive: true });
  await writeFile(d, wav);
  console.log(`✓ ${d} · ${(wav.length / 1024).toFixed(0)} KB`);
}
console.log('→ ahora: npm run sync && npm run apk:debug');
