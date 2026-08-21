-- Catálogo de unidades de medida (administrable) para la tabla de solicitudes de compra.
create table unidades_medida (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  orden integer not null default 0,
  activo boolean not null default true
);

alter table unidades_medida enable row level security;

create policy "unidades lectura" on unidades_medida
  for select using (auth.role() = 'authenticated');

create policy "unidades escritura admin" on unidades_medida
  for all using (is_admin()) with check (is_admin());

insert into unidades_medida (nombre, orden) values
('Unidad', 1),
('Par', 2),
('Caja', 3),
('Paquete', 4),
('Rollo', 5),
('Bolsa', 6),
('Frasco', 7),
('Galón', 8),
('Litro', 9),
('Kilogramo', 10),
('Gramo', 11),
('Metro', 12),
('Kit', 13),
('Docena', 14);

alter table solicitudes_compra_item add column unidad_medida text;
