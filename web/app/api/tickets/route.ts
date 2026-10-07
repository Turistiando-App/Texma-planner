/* POST /api/tickets {motivo, mensaje} + Authorization: Bearer <sesión de Google>
   Lo llama /contacto. La sesión de Google es OBLIGATORIA: el nombre y el
   mail del ticket salen de la cuenta verificada en el servidor (no de lo
   que mande el navegador), así la respuesta del panel llega al mail real.
   Guarda el ticket en `tickets` y le avisa por mail al negocio. Si el aviso
   por mail falla, el ticket queda guardado igual (se ve en /admin → Soporte). */
import { dbAdmin, json, verificarSesion } from '@/lib/admin-server';
import { avisarTicketNuevo, mailConfigurado } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const corto = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
const MOTIVOS = ['Pedido de mercería', 'Comprar la app TEXMA', 'Ayuda con la app', 'Problema con mi licencia', 'Otra consulta'];

export async function POST(req: Request) {
  const s = await verificarSesion(req);
  if (s instanceof Response) return s;

  const b = await req.json().catch(() => ({}));
  const motivo = MOTIVOS.includes(b.motivo) ? b.motivo : 'Otra consulta';
  const mensaje = corto(b.mensaje, 4000);
  if (mensaje.length < 5) return json({ error: 'Contanos un poco más en el mensaje.' }, 400);

  const fila = {
    nombre: corto(s.nombre, 80) || s.email.split('@')[0],
    email: s.email.toLowerCase(),
    contacto: s.email.toLowerCase(),
    motivo,
    mensaje,
  };
  try {
    const { error } = await dbAdmin().from('tickets').insert(fila);
    if (error) throw error;
  } catch (e) {
    console.error('tickets', e);
    return json({ error: 'No pudimos guardar tu consulta. Probá de nuevo en un rato.' }, 500);
  }

  /* aviso al negocio: si falla, no frena (el ticket ya está en el panel) */
  let avisado = false;
  if (mailConfigurado()) {
    try { await avisarTicketNuevo(fila); avisado = true; }
    catch (e) { console.error('tickets: no pude mandar el aviso por mail', e); }
  } else console.warn('tickets: SMTP sin configurar, no mando el aviso');

  return json({ ok: true, avisado }, 201);
}
