-- Esquema ENJ: autenticacion propia mediante public."user".
-- Ejecutar en una base nueva o despues de respaldar los datos existentes.

drop table if exists public.alertas_emergencia cascade;
drop table if exists public.pagos cascade;
drop table if exists public.participantes cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.profiles cascade;
drop table if exists public."user" cascade;

create table public."user" (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  name text not null default '',
  role text not null default 'participant' check (role in ('participant', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id text primary key references public."user"(id) on delete cascade,
  nombre text,
  apellido text,
  correo text,
  telefono text,
  grupo_scout text,
  distrito text,
  rol text not null default 'participant' check (rol in ('participant', 'staff', 'admin')),
  birth_date date,
  selected_region text,
  selected_district text,
  rama_scout text,
  descripcion text,
  instagram text,
  gustos_evento jsonb not null default '[]'::jsonb,
  foto text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
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

create table public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index password_reset_expires_idx on public.password_reset_tokens (expires_at);

-- El backend usa la service role key y valida token y rol.
-- No se habilita RLS porque la aplicacion usa autenticacion propia, no auth.uid().
create index pagos_cedula_idx on public.pagos (cedula_participante);
create index participantes_usuario_idx on public.participantes (id_usuario);
create index alertas_estado_idx on public.alertas_emergencia (estado);

-- Migrar cuentas existentes de Supabase Auth. encrypted_password es bcrypt;
-- el backend lo acepta y lo convierte a scrypt cuando el usuario cambie su clave.
-- Ejecutar despues de crear public."user":
-- insert into public."user" (id, email, name, password_hash, role)
-- select id::text, email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''), encrypted_password, 'participant'
-- from auth.users
-- on conflict (id) do nothing;

-- Promover una cuenta ya registrada:
-- update public."user" set role = 'admin' where email = 'admin@enj.org';