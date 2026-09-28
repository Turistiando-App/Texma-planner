/* Genera un par de claves de firma de licencias.
   Uso:  node server/keygen.mjs
   - La PÚBLICA se AGREGA a la lista LIC_PUBS de TEXMA.html (no reemplaces
     la vieja: las licencias ya activadas están firmadas con ella).
   - La PRIVADA va como variable LIC_PRIV (en .env y en Vercel). NUNCA se publica.
   Si todavía tenés la privada vieja, NO hace falta correr esto: usá esa. */
import { webcrypto as crypto } from 'node:crypto';

const kp = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']
);
const pub = await crypto.subtle.exportKey('jwk', kp.publicKey);
const priv = await crypto.subtle.exportKey('jwk', kp.privateKey);

console.log('\n=== AGREGAR EN TEXMA.html, a la lista LIC_PUBS ===');
console.log(`{kty:'EC',crv:'P-256',x:'${pub.x}',y:'${pub.y}'}`);
console.log('   ej.: const LIC_PUBS=[LIC_PUB,{kty:\'EC\',...la de arriba...}];');
console.log('\n=== LIC_PRIV — no compartir. Va en .env y en Vercel (Environment Variables) ===');
console.log(`LIC_PRIV='${JSON.stringify({ kty: priv.kty, crv: priv.crv, x: priv.x, y: priv.y, d: priv.d })}'`);
console.log('\nDespués: npm run build:web (copia TEXMA.html → index.html) y volvé a desplegar.\n');
