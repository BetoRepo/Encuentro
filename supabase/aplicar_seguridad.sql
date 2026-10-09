-- ============================================================================
-- ENJ 2026 · SCRIPT COMPLETO DE SEGURIDAD (ejecutar en Supabase → SQL Editor)
--
-- Qué hace:
--   1. Crea las funciones de seguridad (ya aplicadas el 2026-10-09; se re-crean sin efecto).
--   2. Migra solicitudes_insignias.user_id de uuid a texto (tabla vacía; no se pierde nada).
--   3. Quita las políticas antiguas que dejaban tablas y archivos abiertos al público.
--   4. Activa Row Level Security en todas las tablas con sus nuevas políticas.
--
-- NO borra ni modifica registros. Las contraseñas se migran solas cuando cada
-- usuario inicia sesión (no se puede hacer en SQL: requiere la contraseña).
--
-- ORDEN OBLIGATORIO (si se ejecuta antes, el sitio actual deja de funcionar):
--   a. SUPABASE_JWT_SECRET agregado en Vercel.
--   b. Código de la rama seguridad/rls-y-limpieza desplegado y login probado.
--   c. Entonces ejecutar este script.
--
-- Todo va en una transacción: si algo falla, no se aplica nada.
-- Para deshacer: supabase/revertir_seguridad.sql
-- ============================================================================
begin;

-- ======================= PARTE 1: funciones =======================
-- ---------------------------------------------------------------------------
-- Funciones auxiliares
-- ---------------------------------------------------------------------------
create or replace function public.app_uid()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public."user" where id = public.app_uid()
$$;

create or replace function public.es_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.app_role() = 'admin', false)
$$;

create or replace function public.es_programa()
returns boolean
language sql
stable
as $$
  select coalesce(public.app_role() in ('admin', 'programa'), false)
$$;

create or replace function public.es_staff()
returns boolean
language sql
stable
as $$
  select coalesce(public.app_role() in ('admin', 'programa', 'staff'), false)
$$;

-- Permite pagar la cuota de otra persona sin exponer sus datos.
create or replace function public.participante_existe(p_cedula text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.participantes where cedula = p_cedula)
$$;

-- El participante pertenece al usuario actual (por id o por correo, para registros antiguos sin id_usuario).
create or replace function public.es_mi_participante(p_cedula text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.participantes
    where cedula = p_cedula
      and (id_usuario = public.app_uid() or lower(correo) = lower(auth.jwt() ->> 'email'))
  )
$$;

revoke execute on function public.participante_existe(text) from public, anon;
grant execute on function public.participante_existe(text) to authenticated;

-- Un participante no puede cambiarse el rol ni inflar sus apretones.
-- Las funciones security definer (dar_apreton) se ejecutan como el dueño y sí pueden.
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
as $$
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

-- La firma del validador la pone la base de datos con el usuario en sesión; no se puede escribir a mano.
create or replace function public.firmar_validacion_pago()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

-- ---------------------------------------------------------------------------
-- Apretones de manos: uno por pareja, contados en el servidor.
-- ---------------------------------------------------------------------------
create table if not exists public.apretones (
  origen text not null references public."user"(id) on delete cascade,
  destino text not null references public."user"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (origen, destino),
  check (origen <> destino)
);
alter table public.apretones enable row level security;

create or replace function public.dar_apreton(p_destino text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
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

-- ---------------------------------------------------------------------------
-- Insignias por QR
-- ---------------------------------------------------------------------------
create or replace function public.reclamar_insignia(p_codigo text)
returns table (nombre text, ya_la_tenia boolean)
language plpgsql
security definer
set search_path = public
as $$
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

-- ======================= PARTE 2: datos y RLS =======================

-- ---------------------------------------------------------------------------
-- Políticas antiguas que dejaban tablas y archivos abiertos (lectura/escritura
-- pública, o basadas en Supabase Auth, que la app ya no usa).
-- ---------------------------------------------------------------------------
drop policy if exists "Permitir insercion a Administradores y Equipo de Programa" on public.consultas_distritales;
drop policy if exists "Permitir lectura a Administradores y Equipo de Programa" on public.consultas_distritales;
drop policy if exists "Permitir lectura publica consultas" on public.consultas_distritales;
drop policy if exists "Permitir upsert publico consultas" on public.consultas_distritales;
drop policy if exists "Permitir inserción de mensajes" on public.muro_social;
drop policy if exists "Permitir lectura pública del muro" on public.muro_social;
drop policy if exists "Permitir lectura de pagos" on public.pagos;
drop policy if exists "Solo Admins validan pagos" on public.pagos;
drop policy if exists "Gestión alarmas Programa" on public.programa_alarmas;
drop policy if exists "Lectura alarmas publicadas" on public.programa_alarmas;
drop policy if exists "Permitir actualización de alarmas a usuarios autenticados" on public.programa_alarmas;
drop policy if exists "Permitir inserción de alarmas a usuarios autenticados" on public.programa_alarmas;
drop policy if exists "Permitir lectura de alarmas a todos" on public.programa_alarmas;
drop policy if exists "Usuarios crean sus propias solicitudes" on public.solicitudes_insignias;
drop policy if exists "Usuarios ven sus propias solicitudes" on public.solicitudes_insignias;
drop policy if exists "Permitir actualizacion publica en documentos-enj" on storage.objects;
drop policy if exists "Permitir eliminacion en documentos-enj" on storage.objects;
drop policy if exists "Permitir lectura publica de documentos-enj" on storage.objects;
drop policy if exists "Permitir subida publica a documentos-enj" on storage.objects;
drop policy if exists "Permitir subir documentos enj" on storage.objects;
drop policy if exists "Permitir ver documentos enj" on storage.objects;
drop policy if exists "politica insert 9ipihj_0" on storage.objects;

-- Los ids de usuario son texto (usr_...); con uuid (y FK a la tabla de Supabase Auth) las solicitudes
-- de insignia fallaban. La tabla está vacía.
alter table public.solicitudes_insignias drop constraint if exists solicitudes_insignias_user_id_fkey;
alter table public.solicitudes_insignias alter column user_id type text using user_id::text;
alter table public.solicitudes_insignias
  add constraint solicitudes_insignias_user_id_fkey foreign key (user_id) references public."user"(id) on delete cascade;

-- Tabla de roles del sistema anterior (Supabase Auth): nadie debe poder escribirla desde el navegador.
alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;

-- Vistas de pagos y perfiles: respetan RLS de las tablas base y no se pueden modificar desde el navegador.
alter view public.vista_control_pagos set (security_invoker = true);
alter view public.vista_gestion_perfiles set (security_invoker = true);
alter view public.vista_pagos_interactiva set (security_invoker = true);
revoke all on public.vista_control_pagos, public.vista_gestion_perfiles, public.vista_pagos_interactiva from anon, authenticated;
grant select on public.vista_control_pagos, public.vista_gestion_perfiles, public.vista_pagos_interactiva to authenticated;

-- ---------------------------------------------------------------------------
-- public."user": solo el backend (service role) accede. Contiene password_hash.
-- ---------------------------------------------------------------------------
alter table public."user" enable row level security;
revoke all on public."user" from anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles: lectura pública de datos de perfil; cada quien edita el suyo.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = public.app_uid() or public.es_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = public.app_uid() or public.es_admin())
  with check (id = public.app_uid() or public.es_admin());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated using (public.es_admin());

-- Visitantes sin sesión (perfil público /scout/:id) no ven teléfono, correo ni fecha de nacimiento.
revoke select on public.profiles from anon;
grant select (id, nombre, apellido, grupo_scout, distrito, selected_region, selected_district, rama_scout,
              rol_evento, descripcion, instagram, gustos_evento, foto, apretones_count, crew)
  on public.profiles to anon;

-- Un participante no puede cambiarse el rol ni inflar sus apretones (función creada en la parte 1).
drop trigger if exists proteger_campos_perfil on public.profiles;
create trigger proteger_campos_perfil
  before insert or update on public.profiles
  for each row execute function public.proteger_campos_perfil();

-- ---------------------------------------------------------------------------
-- participantes: datos personales y médicos. Solo el dueño y admin.
-- ---------------------------------------------------------------------------
alter table public.participantes enable row level security;

drop policy if exists participantes_select on public.participantes;
create policy participantes_select on public.participantes
  for select to authenticated
  using (id_usuario = public.app_uid() or lower(correo) = lower(auth.jwt() ->> 'email') or public.es_admin());

drop policy if exists participantes_insert on public.participantes;
create policy participantes_insert on public.participantes
  for insert to authenticated with check (id_usuario = public.app_uid() or public.es_admin());

drop policy if exists participantes_update on public.participantes;
create policy participantes_update on public.participantes
  for update to authenticated
  using (id_usuario = public.app_uid() or lower(correo) = lower(auth.jwt() ->> 'email') or public.es_admin())
  with check (id_usuario = public.app_uid() or public.es_admin());

drop policy if exists participantes_delete on public.participantes;
create policy participantes_delete on public.participantes
  for delete to authenticated using (public.es_admin());

-- ---------------------------------------------------------------------------
-- pagos: cualquiera con sesión reporta un pago pendiente; solo admin valida.
-- ---------------------------------------------------------------------------
alter table public.pagos enable row level security;

drop policy if exists pagos_select on public.pagos;
create policy pagos_select on public.pagos
  for select to authenticated
  using (public.es_admin() or public.es_mi_participante(cedula_participante));

drop policy if exists pagos_insert on public.pagos;
create policy pagos_insert on public.pagos
  for insert to authenticated
  with check (estado = 'pendiente' and validado_por is null and public.participante_existe(cedula_participante));

drop policy if exists pagos_update on public.pagos;
create policy pagos_update on public.pagos
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

-- La firma del validador la pone la base de datos con el usuario en sesión (función creada en la parte 1).
drop trigger if exists firmar_validacion_pago on public.pagos;
create trigger firmar_validacion_pago
  before update on public.pagos
  for each row execute function public.firmar_validacion_pago();

drop policy if exists pagos_delete on public.pagos;
create policy pagos_delete on public.pagos
  for delete to authenticated using (public.es_admin());

-- ---------------------------------------------------------------------------
-- documentos_participante
-- ---------------------------------------------------------------------------
alter table public.documentos_participante enable row level security;

drop policy if exists documentos_select on public.documentos_participante;
create policy documentos_select on public.documentos_participante
  for select to authenticated
  using (public.es_admin() or public.es_mi_participante(cedula_participante));

drop policy if exists documentos_insert on public.documentos_participante;
create policy documentos_insert on public.documentos_participante
  for insert to authenticated with check (public.participante_existe(cedula_participante));

drop policy if exists documentos_modify on public.documentos_participante;
create policy documentos_modify on public.documentos_participante
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

drop policy if exists documentos_delete on public.documentos_participante;
create policy documentos_delete on public.documentos_participante
  for delete to authenticated using (public.es_admin());

-- ---------------------------------------------------------------------------
-- alertas_emergencia: cualquiera con sesión crea la suya; staff las ve y resuelve.
-- ---------------------------------------------------------------------------
alter table public.alertas_emergencia enable row level security;

drop policy if exists alertas_insert on public.alertas_emergencia;
create policy alertas_insert on public.alertas_emergencia
  for insert to authenticated with check (user_id = public.app_uid());

drop policy if exists alertas_select on public.alertas_emergencia;
create policy alertas_select on public.alertas_emergencia
  for select to authenticated using (public.es_staff() or user_id = public.app_uid());

drop policy if exists alertas_update on public.alertas_emergencia;
create policy alertas_update on public.alertas_emergencia
  for update to authenticated using (public.es_staff()) with check (public.es_staff());

-- ---------------------------------------------------------------------------
-- subscriptions y programa_alarmas: escritura solo vía backend (service role).
-- programa_alarmas se lee en vivo desde el Panel de Programa.
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from anon, authenticated;

alter table public.programa_alarmas enable row level security;
drop policy if exists programa_alarmas_select on public.programa_alarmas;
create policy programa_alarmas_select on public.programa_alarmas
  for select to authenticated using (estado = 'publicada' or public.es_programa());

-- ---------------------------------------------------------------------------
-- Insignias
-- ---------------------------------------------------------------------------
alter table public.insignias enable row level security;
drop policy if exists insignias_select on public.insignias;
create policy insignias_select on public.insignias
  for select to anon, authenticated using (true);
drop policy if exists insignias_write on public.insignias;
create policy insignias_write on public.insignias
  for all to authenticated using (public.es_programa()) with check (public.es_programa());
-- Los códigos QR ("codigo") no se pueden leer desde el navegador; se validan con reclamar_insignia().
revoke select on public.insignias from anon, authenticated;
grant select (id, nombre, descripcion, imagen_url, tipo, puntos, created_at) on public.insignias to anon, authenticated;

alter table public.participante_insignias enable row level security;
drop policy if exists participante_insignias_select on public.participante_insignias;
create policy participante_insignias_select on public.participante_insignias
  for select to anon, authenticated using (true);
drop policy if exists participante_insignias_write on public.participante_insignias;
create policy participante_insignias_write on public.participante_insignias
  for all to authenticated using (public.es_programa()) with check (public.es_programa());

alter table public.solicitudes_insignias enable row level security;
drop policy if exists solicitudes_insignias_select on public.solicitudes_insignias;
create policy solicitudes_insignias_select on public.solicitudes_insignias
  for select to authenticated using (user_id = public.app_uid() or public.es_programa());
drop policy if exists solicitudes_insignias_insert on public.solicitudes_insignias;
create policy solicitudes_insignias_insert on public.solicitudes_insignias
  for insert to authenticated with check (user_id = public.app_uid() and estado = 'pendiente');
drop policy if exists solicitudes_insignias_update on public.solicitudes_insignias;
create policy solicitudes_insignias_update on public.solicitudes_insignias
  for update to authenticated using (public.es_programa()) with check (public.es_programa());

alter table public.solicitudes_logros enable row level security;
drop policy if exists solicitudes_logros_select on public.solicitudes_logros;
create policy solicitudes_logros_select on public.solicitudes_logros
  for select to authenticated using (user_id = public.app_uid() or public.es_programa());
drop policy if exists solicitudes_logros_insert on public.solicitudes_logros;
create policy solicitudes_logros_insert on public.solicitudes_logros
  for insert to authenticated with check (user_id = public.app_uid());
drop policy if exists solicitudes_logros_update on public.solicitudes_logros;
create policy solicitudes_logros_update on public.solicitudes_logros
  for update to authenticated using (public.es_programa()) with check (public.es_programa());

-- ---------------------------------------------------------------------------
-- muro_social: lectura pública; cada quien publica con su propio id.
-- ---------------------------------------------------------------------------
alter table public.muro_social enable row level security;
drop policy if exists muro_select on public.muro_social;
create policy muro_select on public.muro_social
  for select to anon, authenticated using (true);
drop policy if exists muro_insert on public.muro_social;
create policy muro_insert on public.muro_social
  for insert to authenticated with check (autor_id = public.app_uid());
drop policy if exists muro_delete on public.muro_social;
create policy muro_delete on public.muro_social
  for delete to authenticated using (autor_id = public.app_uid() or public.es_admin());

-- ---------------------------------------------------------------------------
-- consultas_distritales: los responsables distritales con sesión envían reportes.
-- ---------------------------------------------------------------------------
alter table public.consultas_distritales enable row level security;
drop policy if exists consultas_select on public.consultas_distritales;
create policy consultas_select on public.consultas_distritales
  for select to authenticated using (true);
drop policy if exists consultas_insert on public.consultas_distritales;
create policy consultas_insert on public.consultas_distritales
  for insert to authenticated with check (true);
drop policy if exists consultas_update on public.consultas_distritales;
create policy consultas_update on public.consultas_distritales
  for update to authenticated using (true) with check (true);
drop policy if exists consultas_delete on public.consultas_distritales;
create policy consultas_delete on public.consultas_distritales
  for delete to authenticated using (public.es_programa());

-- ---------------------------------------------------------------------------
-- Storage: solo usuarios con sesión suben archivos.
-- PENDIENTE: volver privado el bucket documentos-enj (fichas médicas, cédulas)
-- y servir los archivos con URLs firmadas desde el Dashboard.
-- ---------------------------------------------------------------------------
drop policy if exists enj_storage_insert on storage.objects;
create policy enj_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id in ('documentos-enj', 'evidencias_insignias'));

-- Los buckets son públicos: los archivos se ven por su URL. Estas políticas solo controlan
-- listar, sobrescribir y borrar mediante la API (antes cualquiera podía borrar documentos).
drop policy if exists enj_storage_select on storage.objects;
create policy enj_storage_select on storage.objects
  for select to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and (owner_id = public.app_uid() or public.es_admin()));

drop policy if exists enj_storage_update on storage.objects;
create policy enj_storage_update on storage.objects
  for update to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and (owner_id = public.app_uid() or public.es_admin()));

drop policy if exists enj_storage_delete on storage.objects;
create policy enj_storage_delete on storage.objects
  for delete to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and public.es_admin());

commit;

-- ======================= VERIFICACIÓN (solo lectura) =======================
-- Todas las tablas deben mostrar rls = true.
select c.relname as tabla, c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as politicas
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;