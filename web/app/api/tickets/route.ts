/* POST /api/tickets {nombre, contacto, motivo, mensaje}
   Lo llama el formulario de /contacto antes de abrir WhatsApp, para que
   la consulta quede registrada en el panel. Público: solo inserta,
   con largos acotados. Si Supabase no está, responde ok igual (el
   WhatsApp es el canal principal y no se tiene que trabar). */
import { dbAdmin, json } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';

const corto = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const fila = {
    nombre: corto(b.nombre, 80),
    contacto: corto(b.contacto, 80),
    motivo: corto(b.motivo, 60),
    mensaje: corto(b.mensaje, 2000),
  };
  if (!fila.nombre || !fila.mensaje) return json({ error: 'Faltan datos' }, 400);
  try {
    const { error } = await dbAdmin().from('tickets').insert(fila);
    if (error) throw error;
  } catch (e) {
    console.error('tickets', e);
  }
  return json({ ok: true }, 201);
}
