-- ============================================================================
-- ENJ 2026 · REVERTIR el script aplicar_seguridad.sql (solo en emergencia).
--
-- Devuelve la base al acceso abierto que tenía antes: el sitio vuelve a
-- funcionar con la clave anon, pero los datos quedan expuestos otra vez.
-- No borra ni modifica registros. Las funciones y la tabla apretones se
-- conservan (no estorban).
-- ============================================================================
begin;

drop trigger if exists proteger_campos_perfil on public.profiles;
drop trigger if exists firmar_validacion_pago on public.pagos;

alter table public."user" disable row level security;
alter table public.profiles disable row level security;
alter table public.participantes disable row level security;
alter table public.pagos disable row level security;
alter table public.documentos_participante disable row level security;
alter table public.alertas_emergencia disable row level security;
alter table public.subscriptions disable row level security;
alter table public.insignias disable row level security;
alter table public.participante_insignias disable row level security;
alter table public.solicitudes_logros disable row level security;
alter table public.user_roles disable row level security;
-- Estas ya tenían RLS antes; se desactiva para que el código antiguo pueda escribir.
alter table public.programa_alarmas disable row level security;
alter table public.muro_social disable row level security;
alter table public.consultas_distritales disable row level security;
alter table public.solicitudes_insignias disable row level security;

-- Permisos por defecto de Supabase.
grant all on public."user", public.profiles, public.insignias, public.subscriptions, public.user_roles to anon, authenticated;
grant all on public.vista_control_pagos, public.vista_gestion_perfiles, public.vista_pagos_interactiva to anon, authenticated;
alter view public.vista_control_pagos set (security_invoker = false);
alter view public.vista_gestion_perfiles set (security_invoker = false);
alter view public.vista_pagos_interactiva set (security_invoker = false);

-- Storage: vuelve a permitir subir y leer documentos sin sesión, como antes.
drop policy if exists enj_storage_insert on storage.objects;
drop policy if exists enj_storage_select on storage.objects;
drop policy if exists enj_storage_update on storage.objects;
drop policy if exists enj_storage_delete on storage.objects;
create policy "Permitir subida publica a documentos-enj" on storage.objects
  for insert to public with check (bucket_id = 'documentos-enj');
create policy "Permitir lectura publica de documentos-enj" on storage.objects
  for select to public using (bucket_id = 'documentos-enj');
create policy "Permitir actualizacion publica en documentos-enj" on storage.objects
  for update to public using (bucket_id = 'documentos-enj') with check (bucket_id = 'documentos-enj');

commit;
