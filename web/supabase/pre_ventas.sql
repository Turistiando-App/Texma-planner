-- ============================================================
-- TEXMA · pre-ventas de la app (formulario de /checkout)
-- Quien toca «Comprar la app» deja nombre, apellido, email y celular
-- antes de pasar al WhatsApp de María. Así el mail y el celular quedan
-- en la base para atarlos al código que se genera en /admin.
-- Pegar en Supabase → SQL Editor → Run. Se puede correr dos veces.
-- ============================================================

create table if not exists public.pre_ventas (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  apellido     text not null,
  email        text not null,
  celular      text not null,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'vendida', 'descartada')),
  license_code text,                 -- código de /admin cuando se concreta la venta
  created_at   timestamptz not null default now()
);

create index if not exists pre_ventas_fecha on public.pre_ventas (created_at desc);
create index if not exists pre_ventas_email on public.pre_ventas (lower(email));

-- Cerrada igual que licenses y tickets: RLS prendido y SIN políticas.
-- Solo escribe la ruta /api/pre-ventas del sitio con la service_role key.
alter table public.pre_ventas enable row level security;
