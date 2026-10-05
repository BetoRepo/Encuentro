alter table public.pagos add column if not exists validado_por text;
alter table public.participantes add column if not exists aplica_pronto_pago boolean not null default false;
alter table public.participantes add column if not exists monto_cuota numeric(10, 2);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.pagos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%estado%'
  loop
    execute format('alter table public.pagos drop constraint %I', constraint_row.conname);
  end loop;
end $$;

update public.pagos set estado = 'validado' where estado = 'aprobado';

alter table public.pagos
  add constraint pagos_estado_check check (estado in ('pendiente', 'validado', 'rechazado'));

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public."user"'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public."user" drop constraint %I', constraint_row.conname);
  end loop;
end $$;

alter table public."user"
  add constraint user_role_check check (role in ('participant', 'staff', 'programa', 'admin'));

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%rol%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_row.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_rol_check check (rol in ('participant', 'staff', 'programa', 'admin'));