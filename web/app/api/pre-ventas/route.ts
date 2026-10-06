/* POST /api/pre-ventas {nombre, apellido, email, celular}
   Lo llama /checkout antes de abrir el WhatsApp de María: el lead queda
   en la tabla `pre_ventas` (supabase/pre_ventas.sql) para atarle después
   el código que se genera en /admin. Público: solo inserta, con datos
   validados y largos acotados. Si la base falla responde 500, pero el
   cliente sigue igual a WhatsApp (la venta no se tiene que trabar). */
import { dbAdmin, json } from '@/lib/admin-server';

export const dynamic = 'force-dynamic';

const corto = (v: unknown, n: number) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, n);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.web) return json({ ok: true }, 201);               // honeypot: los bots completan todo
  const fila = {
    nombre: corto(b.nombre, 60),
    apellido: corto(b.apellido, 60),
    email: corto(b.email, 120).toLowerCase(),
    celular: corto(b.celular, 30),
  };
  const digitos = fila.celular.replace(/\D/g, '');
  if (!fila.nombre || !fila.apellido) return json({ error: 'Completá nombre y apellido.' }, 400);
  if (!EMAIL.test(fila.email)) return json({ error: 'Revisá el email.' }, 400);
  if (digitos.length < 8 || digitos.length > 15) return json({ error: 'Revisá el celular (con código de área).' }, 400);

  try {
    const { error } = await dbAdmin().from('pre_ventas').insert(fila);
    if (error) throw error;
  } catch (e) {
    console.error('pre-ventas', e);
    return json({ error: 'No pudimos guardar tus datos' }, 500);
  }
  return json({ ok: true }, 201);
}
