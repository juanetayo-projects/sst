-- El modulo de Inventario deja de ser exclusivo de Administracion: el inspector tambien lo gestiona.
drop policy "inventario equipos escritura admin" on inventario_equipos;
create policy "inventario equipos escritura" on inventario_equipos
  for all using (is_admin() or is_inspector()) with check (is_admin() or is_inspector());

-- Permisos de acceso a modulos/opciones de la app (analogo a permisos_ronda_categoria).
-- Sin filas para un profile_id = ve todos los modulos (no rompe usuarios existentes).
create table permisos_modulo (
  profile_id uuid not null references profiles(id) on delete cascade,
  modulo text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, modulo)
);

alter table permisos_modulo enable row level security;

create policy "permisos modulo escritura admin" on permisos_modulo
  for all using (is_admin()) with check (is_admin());

create policy "permisos modulo lectura" on permisos_modulo
  for select using (auth.uid() = profile_id or is_admin());
