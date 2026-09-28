-- ============================================================
-- TEXMA · catálogo público de la mercería (sitio web)
-- Supabase → SQL Editor → pegar y Run. Después correr productos_seed.sql
-- para cargar los 50 productos de ejemplo.
-- ============================================================

create table if not exists public.productos (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  titulo        text not null,
  categoria     text not null,              -- Hilos · Botones · Cierres · Elásticos …
  subcategoria  text not null default '',   -- Invisibles, Lycra, 4 agujeros …
  unidad        text not null default 'u' check (unidad in ('u', 'mts', 'pack')),
  precio        numeric(12,2) not null default 0,
  color         text,                        -- hex para el dibujo si no hay foto
  stock         numeric(12,2) not null default 0,
  destacado     boolean not null default false,
  activo        boolean not null default true,
  descripcion   text not null default '',
  imagen_url    text,
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now()
);

create index if not exists productos_cat on public.productos (categoria, subcategoria);

create or replace function public.productos_touch() returns trigger
language plpgsql as $$ begin new.actualizado := now(); return new; end $$;
drop trigger if exists productos_touch on public.productos;
create trigger productos_touch before update on public.productos
  for each row execute function public.productos_touch();

-- Lectura PÚBLICA (la anon key del sitio) solo de lo activo. Escribir: solo
-- la service_role (panel / scripts). Nadie de afuera puede modificar nada.
alter table public.productos enable row level security;
drop policy if exists "productos lectura publica" on public.productos;
create policy "productos lectura publica" on public.productos
  for select to anon, authenticated using (activo);

-- Stock en tiempo real: el sitio escucha los cambios de esta tabla.
do $$ begin
  alter publication supabase_realtime add table public.productos;
exception when duplicate_object then null; end $$;
