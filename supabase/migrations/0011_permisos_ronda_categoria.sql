-- Permisos por ronda (categoría SST) por usuario. Sin filas para un usuario = acceso a todas las rondas.
create table permisos_ronda_categoria (
  profile_id uuid not null references profiles(id) on delete cascade,
  categoria_sst text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, categoria_sst)
);

alter table permisos_ronda_categoria enable row level security;

create policy "permisos escritura admin" on permisos_ronda_categoria
  for all using (is_admin()) with check (is_admin());

create policy "permisos lectura propia" on permisos_ronda_categoria
  for select using (auth.uid() = profile_id or is_admin());
