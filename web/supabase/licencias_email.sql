-- ============================================================
-- TEXMA · mail de Google en cada licencia
-- /login (en PC) exige sesión de Google antes del código; al verificar,
-- /api/licencia/verificar guarda ese mail en la licencia (solo la
-- primera vez). Pegar en Supabase → SQL Editor → Run. Idempotente.
-- ============================================================
alter table public.licenses add column if not exists email text;
create index if not exists licenses_email on public.licenses (lower(email));
