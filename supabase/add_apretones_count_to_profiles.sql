alter table public.profiles
  add column if not exists apretones_count integer not null default 0;
