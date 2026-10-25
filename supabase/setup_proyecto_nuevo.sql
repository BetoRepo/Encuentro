-- ============================================================================
-- ENJ 2026 · Esquema completo para un proyecto Supabase NUEVO (vacío).
-- Reúne schema.sql + migraciones + tablas que faltaban en el repositorio
-- (insignias, muro_social, consultas_distritales, programa_alarmas, ...),
-- buckets de Storage, RLS y Realtime.
-- Se ejecuta completo o no se ejecuta (begin/commit).
-- ============================================================================
begin;

-- ---------------------------------------------------------------------------
-- Tablas base
-- ---------------------------------------------------------------------------
create table public."user" (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  name text not null default '',
  role text not null default 'participant',
  created_at timestamptz not null default now(),
  constraint user_role_check check (role in ('participant', 'staff', 'programa', 'admin'))
);

create table public.profiles (
  id text primary key references public."user"(id) on delete cascade,
  nombre text,
  apellido text,
  correo text,
  telefono text,
  grupo_scout text,
  distrito text,
  rol text not null default 'participant',
  rol_evento text not null default 'Joven Participante',
  birth_date date,
  selected_region text,
  selected_district text,
  rama_scout text,
  descripcion text,
  instagram text,
  gustos_evento jsonb not null default '[]'::jsonb,
  foto text,
  apretones_count integer not null default 0 check (apretones_count >= 0),
  crew text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_rol_check check (rol in ('participant', 'staff', 'programa', 'admin')),
  constraint profiles_crew_check check (crew is null or crew in ('Bolibomba', 'Samba', 'Chao', 'Pirulin', 'Cricri', 'Reinitas', 'Savoy'))
);
comment on column public.profiles.crew is 'Crew elegido por el participante en el ENJ 2026';
comment on column public.profiles.foto is 'URL pública de la foto en Storage (no base64)';

create table public.participantes (
  cedula text primary key,
  nombre text not null,
  apellido text not null,
  fecha_nacimiento date,
  talla_uniforme text,
  direccion text,
  correo text,
  telefono text,
  tipo_sangre text,
  alergias text,
  enfermedades text,
  medicamentos text,
  contacto_emergencia text,
  region text,
  distrito text,
  grupo_scout text,
  rama text,
  tipo_participante text,
  aplica_pronto_pago boolean not null default false,
  monto_cuota numeric(10, 2),
  drive_folder_id text,
  id_usuario text references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  cedula_participante text not null references public.participantes(cedula) on delete cascade,
  numero_cuota text not null,
  monto_bs numeric(12, 2) not null default 0,
  referencia text,
  fecha_pago date not null default current_date,
  tasa_cambio numeric(12, 4) not null default 1,
  estado text not null default 'pendiente',
  validado_por text,
  created_at timestamptz not null default now(),
  constraint pagos_estado_check check (estado in ('pendiente', 'validado', 'rechazado'))
);

create table public.documentos_participante (
  id uuid primary key default gen_random_uuid(),
  cedula_participante text not null references public.participantes(cedula) on delete cascade,
  tipo_documento text not null,
  nombre_archivo text not null,
  path_archivo text,
  url_archivo text,
  mime_type text,
  peso_bytes bigint default 0,
  archivo_base64 text,
  created_at timestamptz not null default now()
);

create table public.alertas_emergencia (
  id uuid primary key default gen_random_uuid(),
  user_id text references public."user"(id) on delete set null,
  nombre_usuario text,
  telefono text,
  tipo_emergencia text not null default 'General',
  latitud double precision,
  longitud double precision,
  estado text not null default 'activa',
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

create table public.apretones (
  origen text not null references public."user"(id) on delete cascade,
  destino text not null references public."user"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (origen, destino),
  check (origen <> destino)
);

-- ---------------------------------------------------------------------------
-- Tablas que no estaban en el repositorio (reconstruidas a partir del código)
-- ---------------------------------------------------------------------------
create table public.insignias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  imagen_url text,
  tipo text,
  puntos integer not null default 0,
  codigo text unique,
  created_at timestamptz not null default now()
);

create table public.participante_insignias (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  insignia_id uuid not null references public.insignias(id) on delete cascade,
  otorgado_por text,
  created_at timestamptz not null default now(),
  unique (user_id, insignia_id)
);

create table public.solicitudes_insignias (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  insignia_id uuid references public.insignias(id) on delete cascade,
  descripcion_evidencia text,
  foto_url text,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table public.solicitudes_logros (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  insignia_id uuid references public.insignias(id) on delete cascade,
  estado text not null default 'pendiente',
  detalles text,
  fecha_solicitud timestamptz not null default now()
);

create table public.muro_social (
  id uuid primary key default gen_random_uuid(),
  autor text,
  autor_id text references public."user"(id) on delete set null,
  mensaje text not null,
  fecha timestamptz not null default now()
);

create table public.consultas_distritales (
  id uuid primary key default gen_random_uuid(),
  region text,
  distrito text not null unique,
  responsable_id uuid,
  responsable_nombre text,
  respuestas jsonb not null default '{}'::jsonb,
  estatus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programa_alarmas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  prioridad text not null default 'informativa',
  audiencia text not null default 'todos',
  estado text not null default 'pendiente',
  creado_por text,
  created_at timestamptz not null default now()
);

create table public.taller_inscripciones (
  id bigint generated always as identity primary key,
  user_id text not null references public."user"(id) on delete cascade,
  actividad_id text not null,
  sesion_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, actividad_id)
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------
create index pagos_cedula_idx on public.pagos (cedula_participante);
create index documentos_cedula_idx on public.documentos_participante (cedula_participante);
create index participantes_usuario_idx on public.participantes (id_usuario);
create index participantes_correo_idx on public.participantes (lower(correo));
create index profiles_correo_idx on public.profiles (correo);
create index alertas_estado_idx on public.alertas_emergencia (estado);
create index muro_fecha_idx on public.muro_social (fecha desc);
create index participante_insignias_user_idx on public.participante_insignias (user_id);
create index solicitudes_logros_estado_idx on public.solicitudes_logros (estado);
create index taller_inscripciones_sesion_idx on public.taller_inscripciones (sesion_id);

-- ---------------------------------------------------------------------------
-- Permisos de la Data API (RLS limita después lo que cada rol ve)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Funciones auxiliares (migración 20261009000000)
-- ---------------------------------------------------------------------------
create or replace function public.app_uid()
returns text language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

create or replace function public.app_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public."user" where id = public.app_uid()
$$;

create or replace function public.es_admin()
returns boolean language sql stable as $$
  select coalesce(public.app_role() = 'admin', false)
$$;

create or replace function public.es_programa()
returns boolean language sql stable as $$
  select coalesce(public.app_role() in ('admin', 'programa'), false)
$$;

create or replace function public.es_staff()
returns boolean language sql stable as $$
  select coalesce(public.app_role() in ('admin', 'programa', 'staff'), false)
$$;

create or replace function public.participante_existe(p_cedula text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.participantes where cedula = p_cedula)
$$;

create or replace function public.es_mi_participante(p_cedula text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.participantes
    where cedula = p_cedula
      and (id_usuario = public.app_uid() or lower(correo) = lower(auth.jwt() ->> 'email'))
  )
$$;

revoke execute on function public.participante_existe(text) from public, anon;
grant execute on function public.participante_existe(text) to authenticated;

create or replace function public.proteger_campos_perfil()
returns trigger language plpgsql as $$
begin
  if current_user in ('anon', 'authenticated') and not public.es_admin() then
    if tg_op = 'INSERT' then
      new.rol := 'participant';
      new.apretones_count := 0;
    else
      new.rol := old.rol;
      new.apretones_count := old.apretones_count;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.firmar_validacion_pago()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.app_uid() is not null and new.estado is distinct from old.estado then
    new.validado_por := case
      when new.estado = 'validado' then (select coalesce(nullif(u.name, ''), u.email) from public."user" u where u.id = public.app_uid())
      else null
    end;
  end if;
  return new;
end;
$$;

create or replace function public.dar_apreton(p_destino text)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_origen text := public.app_uid();
  v_total integer;
begin
  if v_origen is null then
    raise exception 'Debes iniciar sesión para dar un apretón de manos.' using errcode = '28000';
  end if;
  if v_origen = p_destino then
    raise exception 'No puedes darte un apretón de manos a ti mismo.';
  end if;
  insert into public.apretones (origen, destino) values (v_origen, p_destino) on conflict do nothing;
  if found then
    update public.profiles set apretones_count = apretones_count + 1 where id = p_destino;
  end if;
  select apretones_count into v_total from public.profiles where id = p_destino;
  return coalesce(v_total, 0);
end;
$$;
revoke execute on function public.dar_apreton(text) from public, anon;
grant execute on function public.dar_apreton(text) to authenticated;

create or replace function public.reclamar_insignia(p_codigo text)
returns table (nombre text, ya_la_tenia boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_uid text := public.app_uid();
  v_id public.insignias.id%type;
  v_nombre text;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para reclamar una insignia.' using errcode = '28000';
  end if;
  select i.id, i.nombre into v_id, v_nombre from public.insignias i where i.codigo = p_codigo;
  if v_id is null then
    return;
  end if;
  insert into public.participante_insignias (user_id, insignia_id, otorgado_por)
  values (v_uid, v_id, 'QR_POSTA')
  on conflict do nothing;
  return query select v_nombre, not found;
end;
$$;
revoke execute on function public.reclamar_insignia(text) from public, anon;
grant execute on function public.reclamar_insignia(text) to authenticated;

create or replace function public.inscribir_taller(p_user_id text, p_actividad_id text, p_sesion_id text, p_cupo integer)
returns text language plpgsql security definer set search_path = public as $$
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

-- ---------------------------------------------------------------------------
-- Row Level Security (migración 20261009000100)
-- ---------------------------------------------------------------------------
alter table public."user" enable row level security;
revoke all on public."user" from anon, authenticated;

alter table public.apretones enable row level security;

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select to anon, authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = public.app_uid() or public.es_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = public.app_uid() or public.es_admin()) with check (id = public.app_uid() or public.es_admin());
create policy profiles_delete on public.profiles for delete to authenticated using (public.es_admin());
revoke select on public.profiles from anon;
grant select (id, nombre, apellido, grupo_scout, distrito, selected_region, selected_district, rama_scout,
              rol_evento, descripcion, instagram, gustos_evento, foto, apretones_count, crew)
  on public.profiles to anon;
create trigger proteger_campos_perfil before insert or update on public.profiles
  for each row execute function public.proteger_campos_perfil();

alter table public.participantes enable row level security;
create policy participantes_select on public.participantes for select to authenticated
  using (id_usuario = public.app_uid() or lower(correo) = lower(auth.jwt() ->> 'email') or public.es_admin());
create policy participantes_insert on public.participantes for insert to authenticated
  with check (id_usuario = public.app_uid() or public.es_admin());
create policy participantes_update on public.participantes for update to authenticated
  using (id_usuario = public.app_uid() or lower(correo) = lower(auth.jwt() ->> 'email') or public.es_admin())
  with check (id_usuario = public.app_uid() or public.es_admin());
create policy participantes_delete on public.participantes for delete to authenticated using (public.es_admin());

alter table public.pagos enable row level security;
create policy pagos_select on public.pagos for select to authenticated
  using (public.es_admin() or public.es_mi_participante(cedula_participante));
create policy pagos_insert on public.pagos for insert to authenticated
  with check (estado = 'pendiente' and validado_por is null and public.participante_existe(cedula_participante));
create policy pagos_update on public.pagos for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy pagos_delete on public.pagos for delete to authenticated using (public.es_admin());
create trigger firmar_validacion_pago before update on public.pagos
  for each row execute function public.firmar_validacion_pago();

alter table public.documentos_participante enable row level security;
create policy documentos_select on public.documentos_participante for select to authenticated
  using (public.es_admin() or public.es_mi_participante(cedula_participante));
create policy documentos_insert on public.documentos_participante for insert to authenticated
  with check (public.participante_existe(cedula_participante));
create policy documentos_modify on public.documentos_participante for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy documentos_delete on public.documentos_participante for delete to authenticated using (public.es_admin());

alter table public.alertas_emergencia enable row level security;
create policy alertas_insert on public.alertas_emergencia for insert to authenticated with check (user_id = public.app_uid());
create policy alertas_select on public.alertas_emergencia for select to authenticated using (public.es_staff() or user_id = public.app_uid());
create policy alertas_update on public.alertas_emergencia for update to authenticated using (public.es_staff()) with check (public.es_staff());

alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from anon, authenticated;

alter table public.programa_alarmas enable row level security;
create policy programa_alarmas_select on public.programa_alarmas for select to authenticated
  using (estado = 'publicada' or public.es_programa());

alter table public.insignias enable row level security;
create policy insignias_select on public.insignias for select to anon, authenticated using (true);
create policy insignias_write on public.insignias for all to authenticated using (public.es_programa()) with check (public.es_programa());
revoke select on public.insignias from anon, authenticated;
grant select (id, nombre, descripcion, imagen_url, tipo, puntos, created_at) on public.insignias to anon, authenticated;

alter table public.participante_insignias enable row level security;
create policy participante_insignias_select on public.participante_insignias for select to anon, authenticated using (true);
create policy participante_insignias_write on public.participante_insignias for all to authenticated
  using (public.es_programa()) with check (public.es_programa());

alter table public.solicitudes_insignias enable row level security;
create policy solicitudes_insignias_select on public.solicitudes_insignias for select to authenticated
  using (user_id = public.app_uid() or public.es_programa());
create policy solicitudes_insignias_insert on public.solicitudes_insignias for insert to authenticated
  with check (user_id = public.app_uid() and estado = 'pendiente');
create policy solicitudes_insignias_update on public.solicitudes_insignias for update to authenticated
  using (public.es_programa()) with check (public.es_programa());

alter table public.solicitudes_logros enable row level security;
create policy solicitudes_logros_select on public.solicitudes_logros for select to authenticated
  using (user_id = public.app_uid() or public.es_programa());
create policy solicitudes_logros_insert on public.solicitudes_logros for insert to authenticated
  with check (user_id = public.app_uid());
create policy solicitudes_logros_update on public.solicitudes_logros for update to authenticated
  using (public.es_programa()) with check (public.es_programa());

alter table public.muro_social enable row level security;
create policy muro_select on public.muro_social for select to anon, authenticated using (true);
create policy muro_insert on public.muro_social for insert to authenticated with check (autor_id = public.app_uid());
create policy muro_delete on public.muro_social for delete to authenticated using (autor_id = public.app_uid() or public.es_admin());

alter table public.consultas_distritales enable row level security;
create policy consultas_select on public.consultas_distritales for select to authenticated using (true);
create policy consultas_insert on public.consultas_distritales for insert to authenticated with check (true);
create policy consultas_update on public.consultas_distritales for update to authenticated using (true) with check (true);
create policy consultas_delete on public.consultas_distritales for delete to authenticated using (public.es_programa());

alter table public.taller_inscripciones enable row level security;
revoke all on table public.taller_inscripciones from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: buckets públicos (los archivos se ven por URL) con límite de tamaño
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('documentos-enj', 'documentos-enj', true, 10485760),
       ('evidencias_insignias', 'evidencias_insignias', true, 10485760)
on conflict (id) do nothing;

create policy enj_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('documentos-enj', 'evidencias_insignias'));
create policy enj_storage_select on storage.objects for select to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and (owner_id = public.app_uid() or public.es_admin()));
create policy enj_storage_update on storage.objects for update to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and (owner_id = public.app_uid() or public.es_admin()));
create policy enj_storage_delete on storage.objects for delete to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and public.es_admin());

-- ---------------------------------------------------------------------------
-- Realtime (tablas que la app escucha en vivo)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table
  public.muro_social, public.alertas_emergencia, public.programa_alarmas, public.solicitudes_logros;

commit;
