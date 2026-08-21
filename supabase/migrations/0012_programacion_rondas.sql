-- Programación de rondas: agenda de inspecciones a realizar, con estado y estadísticas de cumplimiento.
create table programaciones_ronda (
  id uuid primary key default gen_random_uuid(),
  tipo_inspeccion_id uuid not null references tipos_inspeccion(id),
  fecha_programada date not null,
  empresa text,
  sede text,
  responsable_id uuid references profiles(id),
  estado text not null default 'pendiente' check (estado = any (array['pendiente','realizada','cancelada'])),
  inspeccion_id uuid references inspecciones(id) on delete set null,
  notas text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_programaciones_fecha on programaciones_ronda (fecha_programada);
create index idx_programaciones_tipo on programaciones_ronda (tipo_inspeccion_id);

alter table programaciones_ronda enable row level security;

create policy "programaciones lectura" on programaciones_ronda
  for select using (auth.role() = 'authenticated');

create policy "programaciones escritura admin" on programaciones_ronda
  for all using (is_admin()) with check (is_admin());

create trigger trg_programaciones_updated_at
  before update on programaciones_ronda
  for each row execute function set_updated_at();
