-- ============================================================================
-- ENJ 2026 · Seguridad, PARTE 2 de 2: activa Row Level Security.
--
-- NO APLICAR hasta que:
--   1. Vercel tenga SUPABASE_JWT_SECRET y SUPABASE_SERVICE_ROLE_KEY.
--   2. Esté desplegado el código que envía el dbToken y se haya probado el login.
--   3. Se haya aplicado la parte 1.
-- Si se aplica antes, el sitio actual (que usa la clave anon) deja de poder leer
-- y guardar inscripciones, pagos y perfiles.
--
-- No borra datos: solo crea/reemplaza políticas con estos nombres y cambia permisos.
-- Revertir: alter table <tabla> disable row level security;
-- Se ejecuta completa o no se ejecuta (begin/commit).
-- ============================================================================
begin;

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
              rol_evento, descripcion, instagram, gustos_evento, foto, apretones_count)
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
  for select to authenticated using (public.es_programa());

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
-- PENDIENTE: ocultar la columna "codigo" (los códigos QR) a los participantes con
-- revoke select + grant select (columnas) cuando se confirmen las columnas reales.

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

drop policy if exists enj_storage_update on storage.objects;
create policy enj_storage_update on storage.objects
  for update to authenticated
  using (bucket_id in ('documentos-enj', 'evidencias_insignias') and (owner_id = public.app_uid() or public.es_admin()));

commit;
