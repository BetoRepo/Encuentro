-- Migration segura: no elimina ni modifica la informacion existente.
-- Ejecutar en Supabase SQL Editor sobre la base actual.
alter table public.profiles
  add column if not exists rol_evento text not null default 'Joven Participante';
