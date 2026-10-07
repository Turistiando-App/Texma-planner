/* POST /api/pre-ventas
   Dos formas:
     · Formulario completo (sin sesión): {nombre, apellido, email, celular}
     · Con sesión de Google (Authorization: Bearer …): {celular} y nada más.
       Nombre y mail salen de la cuenta de Google VERIFICADA en el servidor
       (no de lo que mande el navegador). Si ese mail ya tiene una
       pre-venta, se actualiza el celular en vez de duplicarla.
   Lo llama /checkout antes de abrir el WhatsApp de María: el lead queda
   en `pre_ventas` (supabase/pre_ventas.sql) para atarle después el código
   que se genera en /admin. Si la base falla responde 500, pero el cliente
   sigue igual a WhatsApp (la venta no se tiene que trabar). */
import { dbAdmin, json, verificarSesion } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';

const corto = (v: unknown, n: number) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, n);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* «María José González» → nombre «María», apellido «José González» */
function partirNombre(completo: string, email: string) {
  const p = corto(completo, 120).split(' ').filter(Boolean);
  if (!p.length) return { nombre: email.split('@')[0].slice(0, 60), apellido: '—' };
  return { nombre: p[0].slice(0, 60), apellido: (p.slice(1).join(' ') || '—').slice(0, 60) };
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.web) return json({ ok: true }, 201);               // honeypot: los bots completan todo
  const celular = corto(b.celular, 30);
  const digitos = celular.replace(/\D/g, '');
  if (digitos.length < 8 || digitos.length > 15) return json({ error: 'Revisá el número de WhatsApp (con código de área).' }, 400);

  let fila: { nombre: string; apellido: string; email: string; celular: string };
  const conGoogle = !!req.headers.get('authorization');
  if (conGoogle) {
    const s = await verificarSesion(req);
    if (s instanceof Response) return s;
    const email = s.email.toLowerCase();
    fila = { ...partirNombre(s.nombre, email), email, celular };
  } else {
    fila = {
      nombre: corto(b.nombre, 60),
      apellido: corto(b.apellido, 60),
      email: corto(b.email, 120).toLowerCase(),
      celular,
    };
    if (!fila.nombre || !fila.apellido) return json({ error: 'Completá nombre y apellido.' }, 400);
    if (!EMAIL.test(fila.email)) return json({ error: 'Revisá el email.' }, 400);
  }

  try {
    const db = dbAdmin();
    if (conGoogle) {
      const { data: ya, error: e1 } = await db.from('pre_ventas').select('id').eq('email', fila.email).limit(1);
      if (e1) throw e1;
      if (ya?.length) {
        const { error } = await db.from('pre_ventas').update({ celular: fila.celular }).eq('id', ya[0].id);
        if (error) throw error;
        return json({ ok: true, ...fila }, 200);
      }
    }
    const { error } = await db.from('pre_ventas').insert(fila);
    if (error) throw error;
  } catch (e) {
    console.error('pre-ventas', e);
    return json({ error: 'No pudimos guardar tus datos', ...fila }, 500);
  }
  return json({ ok: true, ...fila }, 201);
}
