-- ============================================================
-- TEXMA · auditoría del dispositivo de cada licencia
-- /api/activate guarda la IP y el navegador del canje. Son para
-- revisar casos (tickets), NO bloquean: la IP del celular cambia sola.
-- El bloqueo real es por dispositivo (columna device, que ya existía).
-- Pegar en Supabase → SQL Editor → Run. Idempotente.
-- ============================================================
alter table public.licenses add column if not exists last_ip text;
alter table public.licenses add column if not exists user_agent text;
