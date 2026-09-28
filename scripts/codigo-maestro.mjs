/* ============================================================
   TEXMA · código maestro (la puerta de atrás nuestra)
   ------------------------------------------------------------
   Genera el SHA-256 de la frase que le pases (normalizada), para
   agregar a la lista `LIC_MASTER_SHAS` de TEXMA.html.

     node scripts/codigo-maestro.mjs "MI FRASE NUEVA"

   Se guarda el HASH y no la frase para que el código no se lea de
   un vistazo abriendo el archivo. OJO: esto NO es seguridad de
   verdad — quien sepa programar puede sacar el muro igual. Es solo
   para que no salte a la vista.
============================================================ */
import { createHash } from 'node:crypto';

/* igual que normMaestro() de TEXMA.html: mayúsculas y sin guiones, espacios
   ni signos. «TEXMA-MASTER-2026» y «texma master 2026» dan el mismo hash. */
const frase = process.argv.slice(2).join(' ').toUpperCase().replace(/[^A-Z0-9]/g, '');
if (!frase) {
  console.error('Uso: node scripts/codigo-maestro.mjs "MI FRASE NUEVA"');
  process.exit(1);
}
const hash = createHash('sha256').update(frase, 'utf8').digest('hex');
console.log('');
console.log('  Código maestro : ' + frase);
console.log('  Pegá esto en TEXMA.html (y en index.html):');
console.log('');
console.log(`  '${hash}',   // agregalo a LIC_MASTER_SHAS`);
console.log('');
console.log('  Acordate de sincronizar index.html: npm run build:web');
console.log('');
