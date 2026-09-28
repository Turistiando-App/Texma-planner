#!/usr/bin/env node
/* ============================================================
   migrar-kv.mjs · pasa las licencias del KV de Cloudflare a Supabase
   ------------------------------------------------------------
   Se corre UNA vez, antes de borrar el Worker en Cloudflare:

     npx wrangler login                 (si no estás logueado)
     node scripts/migrar-kv.mjs          (o --dry para ver sin escribir)

   Lee todas las claves lic:* (y el dl:* de su link) con wrangler y hace
   un upsert en la tabla `licenses`. Se puede correr dos veces: pisa por
   código. Las cuentas del panel viejo (user:*) no se migran: el panel
   nuevo entra con ADMIN_PASS.
   Necesita SUPABASE_URL y SUPABASE_SERVICE_ROLE en el .env.
============================================================ */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KV_ID = process.env.KV_ID || '0e86a364edee4b5192fa52e3f9b29331';   // el binding LIC del Worker
const DRY = process.argv.includes('--dry');
const morir = m => { console.error('✗ ' + m); process.exit(1); };

for (const l of existsSync(resolve(RAIZ, '.env')) ? readFileSync(resolve(RAIZ, '.env'), 'utf8').split('\n') : []) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const URL_SB = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE;
if (!URL_SB || !KEY) morir('faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE en el .env');

const wr = args => execSync(`npx wrangler kv ${args} --namespace-id ${KV_ID} --remote`,
  { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
const leer = k => { try { return JSON.parse(wr(`key get "${k}" --text`)); } catch (e) { return null; } };
const iso = ms => (ms ? new Date(ms).toISOString() : null);

console.log('→ listando el KV…');
const claves = JSON.parse(wr('key list --prefix "lic:"')).map(k => k.name);
console.log(`  ${claves.length} licencias`);

const filas = [];
for (const k of claves) {
  const l = leer(k);
  if (!l || !l.code) { console.log(`  ⚠ ${k} ilegible, la salteo`); continue; }
  const dl = l.token ? leer('dl:' + l.token) : null;
  filas.push({
    code: l.code,
    app_id: process.env.APP_ID || 'texma',
    status: l.revoked ? 'revoked' : l.device ? 'active' : 'pending',
    nombre: l.nombre || '',
    contacto: l.contacto || '',
    precio: Math.round(+l.precio) || 30000,
    vendedor: l.vendedor || '',
    device: l.device || null,
    activated_at: iso(l.activatedAt),
    last_seen_at: iso(l.lastSeen),
    opens: l.opens || 0,
    claim_token: l.token || null,
    claim_expires_at: dl ? iso(dl.exp) : null,
    claimed_at: dl ? iso(dl.claimedAt) : iso(l.activatedAt),
    created_at: iso(l.createdAt) || new Date().toISOString(),
  });
  process.stdout.write('.');
}
console.log(`\n→ ${filas.length} filas listas`);
if (DRY) { console.log(JSON.stringify(filas.slice(0, 3), null, 2)); console.log('(--dry: no escribí nada)'); process.exit(0); }
if (!filas.length) process.exit(0);

const headers = {
  apikey: KEY, 'content-type': 'application/json',
  prefer: 'resolution=merge-duplicates,return=minimal',
  ...(KEY.startsWith('eyJ') ? { authorization: 'Bearer ' + KEY } : {}),
};
const r = await fetch(`${URL_SB}/rest/v1/licenses?on_conflict=code`, { method: 'POST', headers, body: JSON.stringify(filas) });
if (!r.ok) morir(`Supabase respondió ${r.status}: ${await r.text()}`);
console.log(`✓ ${filas.length} licencias en Supabase`);
