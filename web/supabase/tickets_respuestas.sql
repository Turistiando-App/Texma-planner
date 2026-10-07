-- ============================================================
-- TEXMA · tickets con mail del cliente y respuesta del equipo
-- Desde 2026-10: para escribir a soporte hay que tener sesión de Google;
-- el ticket guarda ese mail, y la respuesta del panel se le manda por
-- correo y queda registrada acá. Pegar en Supabase → SQL Editor → Run.
-- Idempotente (se puede correr dos veces).
-- ============================================================
alter table public.tickets add column if not exists email         text;
alter table public.tickets add column if not exists respuesta     text;
alter table public.tickets add column if not exists respondido_at timestamptz;
create index if not exists tickets_email on public.tickets (lower(email));
