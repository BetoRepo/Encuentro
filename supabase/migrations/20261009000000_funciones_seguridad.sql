-- ============================================================================
-- ENJ 2026 · Seguridad, PARTE 1 de 2: funciones y tabla de apretones.
--
-- Segura de aplicar en cualquier momento: no toca datos existentes ni cambia
-- permisos de tablas. El sitio actual sigue funcionando igual.
-- Se ejecuta completa o no se ejecuta (begin/commit).
-- ============================================================================
begin;

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

commit;
