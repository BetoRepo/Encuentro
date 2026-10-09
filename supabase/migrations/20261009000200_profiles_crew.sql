-- Crew elegido por cada participante en el ENJ 2026 (aplicada el 2026-10-09).
alter table public.profiles add column if not exists crew text;
alter table public.profiles drop constraint if exists profiles_crew_check;
alter table public.profiles add constraint profiles_crew_check
  check (crew is null or crew in ('Bolibomba', 'Samba', 'Chao', 'Pirulin', 'Cricri', 'Reinitas', 'Savoy'));
comment on column public.profiles.crew is 'Crew elegido por el participante en el ENJ 2026';
