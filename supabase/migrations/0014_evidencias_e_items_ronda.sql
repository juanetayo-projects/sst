-- Evidencia general por inspección, y dos tablas de ítems editables por ronda
-- (elementos a solicitar a compras, y compromisos con fecha/responsable).
alter table inspecciones add column evidencia_urls text[] not null default '{}';

create table solicitudes_compra_item (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id uuid not null references inspecciones(id) on delete cascade,
  fecha date not null default current_date,
  tipo_elemento text not null,
  cantidad numeric not null default 1,
  observacion text,
  estado text not null default 'pendiente' check (estado = any (array['pendiente','solicitado','recibido'])),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table solicitudes_compra_item enable row level security;

create policy "solicitudes lectura" on solicitudes_compra_item
  for select using (auth.role() = 'authenticated');

create policy "solicitudes insercion propia" on solicitudes_compra_item
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

create policy "solicitudes edicion propia o admin" on solicitudes_compra_item
  for update using (is_admin() or created_by = auth.uid());

create policy "solicitudes borrado propio o admin" on solicitudes_compra_item
  for delete using (is_admin() or created_by = auth.uid());

create table compromisos_ronda (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id uuid not null references inspecciones(id) on delete cascade,
  descripcion text not null,
  responsable text,
  fecha_compromiso date not null,
  estado text not null default 'pendiente' check (estado = any (array['pendiente','cumplido'])),
  fecha_cumplido date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table compromisos_ronda enable row level security;

create policy "compromisos lectura" on compromisos_ronda
  for select using (auth.role() = 'authenticated');

create policy "compromisos insercion propia" on compromisos_ronda
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

create policy "compromisos edicion propia o admin" on compromisos_ronda
  for update using (is_admin() or created_by = auth.uid());

create policy "compromisos borrado propio o admin" on compromisos_ronda
  for delete using (is_admin() or created_by = auth.uid());

create index idx_solicitudes_inspeccion on solicitudes_compra_item (inspeccion_id);
create index idx_compromisos_inspeccion on compromisos_ronda (inspeccion_id);
