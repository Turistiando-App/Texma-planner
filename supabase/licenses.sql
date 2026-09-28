-- ============================================================
-- TEXMA · licencias en Supabase (reemplaza el KV de Cloudflare)
-- Pegar tal cual en Supabase → SQL Editor → Run. Se puede correr
-- dos veces sin romper nada.
-- ============================================================

create table if not exists public.licenses (
  code              text primary key,                 -- XXXX-XXXX-XXXX (lo que pega la clienta)
  app_id            text not null default 'texma',
  status            text not null default 'pending'
                    check (status in ('pending', 'active', 'revoked')),

  -- la venta
  nombre            text not null default '',
  contacto          text not null default '',
  precio            integer not null default 30000,
  vendedor          text not null default '',

  -- el celular al que quedó atada
  device            text,                             -- null = libre
  activated_at      timestamptz,
  last_seen_at      timestamptz,
  opens             integer not null default 0,

  -- el link de entrega /d/<claim_token>
  claim_token       text unique,
  claim_expires_at  timestamptz,
  claimed_at        timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists licenses_app_created on public.licenses (app_id, created_at desc);

-- updated_at solo
create or replace function public.licenses_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists licenses_touch on public.licenses;
create trigger licenses_touch before update on public.licenses
  for each row execute function public.licenses_touch();

-- Cerrada: RLS prendido y SIN políticas. Solo entran las funciones de
-- Vercel con la service_role key. La anon key no ve ni una fila.
alter table public.licenses enable row level security;
