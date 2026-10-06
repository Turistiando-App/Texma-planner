-- ============================================================
-- TEXMA · tickets de soporte (consultas del formulario de /contacto)
-- Pegar en Supabase → SQL Editor → Run. Se puede correr dos veces.
-- ============================================================

create table if not exists public.tickets (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null default '',
  contacto    text not null default '',
  motivo      text not null default '',
  mensaje     text not null default '',
  estado      text not null default 'pendiente'
              check (estado in ('pendiente', 'resuelto')),
  created_at  timestamptz not null default now(),
  resuelto_at timestamptz
);

create index if not exists tickets_estado_fecha on public.tickets (estado, created_at desc);

-- Cerrada igual que licenses: RLS prendido y SIN políticas.
-- Solo escriben/leen las rutas /api del sitio con la service_role key.
alter table public.tickets enable row level security;
