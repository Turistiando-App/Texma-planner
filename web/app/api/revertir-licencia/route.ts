/* ============================================================
   POST /api/revertir-licencia  {code, device}
   La PWA lo llama cuando el servidor le devolvió una licencia que ella
   NO pudo validar (firma inválida: claves desincronizadas o app vieja en
   caché). El código ya había quedado «Activa» con ese dispositivo: acá
   vuelve a «Sin activar» y se suelta el dispositivo, así el panel de
   admin refleja la realidad y se puede reintentar.
   Solo revierte si el dispositivo que lo pide es EL MISMO que quedó
   atado (quien tiene solo el código no puede liberar una licencia ajena).
============================================================ */
import { dbAdmin } from '@/lib/admin-server';
import { jsonCors, preflight } from '@/lib/licencias-server';

export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

const DEVICE = /^[a-f0-9]{16,64}$/i;

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const c = String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const code = c.length === 12 ? c.match(/.{4}/g)!.join('-') : '';
    const device = String(b.device || '').trim();
    if (!code || !DEVICE.test(device)) return jsonCors({ error: 'Faltan datos' }, 400);

    const { data, error } = await dbAdmin().from('licenses')
      .update({ device: null, status: 'pending' })
      .eq('code', code).eq('device', device).eq('status', 'active')
      .select('code');
    if (error) throw error;
    console.warn('revertir-licencia', { code, revertida: !!data?.length });
    return jsonCors({ ok: true, revertida: !!data?.length });
  } catch (e) {
    console.error('revertir-licencia', e);
    return jsonCors({ error: 'No pude revertir la licencia' }, 500);
  }
}
