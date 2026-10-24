-- Inscripciones de los protagonistas a los talleres del ENJ 2026.
-- El catálogo (actividades, horarios y cupos) vive en server/talleres.mjs; aquí solo se guardan las inscripciones.
-- Solo el backend (service role) lee y escribe esta tabla.
create table if not exists public.taller_inscripciones (
  id bigint generated always as identity primary key,
  user_id text not null references public."user"(id) on delete cascade,
  actividad_id text not null,
  sesion_id text not null,
  created_at timestamptz not null default now(),
  -- Una sola sesión por actividad para cada persona
  unique (user_id, actividad_id)
);
create index if not exists taller_inscripciones_sesion_idx on public.taller_inscripciones (sesion_id);

alter table public.taller_inscripciones enable row level security;
revoke all on table public.taller_inscripciones from anon, authenticated;

-- Inscribe respetando el cupo: el bloqueo por sesión evita que dos personas tomen el último puesto a la vez.
create or replace function public.inscribir_taller(p_user_id text, p_actividad_id text, p_sesion_id text, p_cupo integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('taller:' || p_sesion_id));
  if (select count(*) from public.taller_inscripciones where sesion_id = p_sesion_id) >= p_cupo then
    return 'lleno';
  end if;
  insert into public.taller_inscripciones (user_id, actividad_id, sesion_id)
  values (p_user_id, p_actividad_id, p_sesion_id);
  return 'ok';
exception when unique_violation then
  return 'duplicado';
end;
$$;

revoke execute on function public.inscribir_taller(text, text, text, integer) from public, anon, authenticated;
grant execute on function public.inscribir_taller(text, text, text, integer) to service_role;
