-- Inventario de extintores (solo extintores por ahora; botiquines/camillas quedan para cuando haya datos).
-- Sembrado desde docs/Matriz_Control_Extintores-v2.xlsx, hoja "Control de Extintores" (62 registros).
create table inventario_extintores (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  empresa text,
  sede text,
  piso text,
  ubicacion text,
  agente_extintor text,
  tipo text,
  capacidad text,
  fecha_vencimiento date,
  prueba_hidrostatica date,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table inventario_extintores enable row level security;

create policy "inventario extintores lectura" on inventario_extintores
  for select using (auth.role() = 'authenticated');

create policy "inventario extintores escritura admin" on inventario_extintores
  for all using (is_admin()) with check (is_admin());

create trigger trg_inventario_extintores_updated_at
  before update on inventario_extintores
  for each row execute function set_updated_at();

insert into inventario_extintores (codigo, empresa, sede, piso, ubicacion, agente_extintor, tipo, capacidad, fecha_vencimiento, prueba_hidrostatica) values
('TOR-1-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '1', 'Planta eléctrica', 'CO2', 'BC', '55 LB', '2027-02-28', null),
('TOR-1-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '1', 'Recepción vehicular', 'PQS', 'ABC', '10 LB', '2027-04-30', null),
('TOR-1-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '1', 'Bodega farmacia', 'CO2', 'BC', '10 LB', '2026-10-31', null),
('TOR-1-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '1', 'Mantenimiento', 'CO2', 'BC', '5 LB', null, null),
('TOR-1-05', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '1', 'Imágenes diagnosticas', 'CO2', 'BC', '5 LB', '2027-02-28', null),
('TOR-1-06', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '1', 'Recepción 1', 'PQS', 'ABC', '10 LB', '2027-02-28', null),
('TOR-2-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '2', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', '2027-02-28', null),
('TOR-2-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '2', 'Pasillo hospitalización', 'CO2', 'BC', '5 LB', '2027-05-31', null),
('TOR-2-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '2', 'Pasillo baño hospitalización', 'PQS', 'ABC', '10 LB', '2027-02-28', null),
('TOR-2-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '2', 'Cafetín', 'PQS', 'ABC', '10 LB', '2026-08-31', null),
('TOR-5-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '5', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', '2027-06-30', null),
('TOR-5-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '5', 'UCIN', 'CO2', 'BC', '10 LB', '2027-07-31', null),
('TOR-5-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '5', 'UCI', 'CO2', 'BC', '5 LB', '2027-02-28', null),
('TOR-5-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '5', 'Recepción 5', 'PQS', 'ABC', '10 LB', '2027-05-31', null),
('TOR-5-05', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '5', 'Gabinete de emergencias', 'PQS', 'ABC', '10 LB', '2027-02-28', null),
('TOR-6-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '6', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', '2027-06-30', null),
('TOR-6-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '6', 'Quirofano 2', 'CO2', 'BC', '5 LB', '2027-05-31', null),
('TOR-6-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '6', 'Estación de enfermería-sala recuperación', 'CO2', 'BC', '10 LB', '2027-07-31', null),
('TOR-6-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '6', 'Recepción 6', 'PQS', 'ABC', '10 LB', '2027-02-28', null),
('TOR-6-05', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '6', 'Gabinete de emergencias', 'PQS', 'ABC', '10 LB', '2027-05-31', null),
('TOR-7-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '7', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', '2027-06-30', null),
('TOR-7-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '7', 'Estación de enfermería', 'PQS', 'ABC', '10 LB', '2027-02-28', null),
('TOR-7-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '7', 'Recepción 7', 'PQS', 'ABC', '10 LB', '2027-02-28', null),
('TOR-7-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '7', 'Gabinete de emergencias', 'PQS', 'ABC', '10 LB', '2027-05-31', null),
('TOR-8-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '8', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', '2027-07-31', null),
('TOR-8-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '8', 'Estación de enfermería', 'PQS', 'ABC', '10 LB', '2027-07-31', null),
('TOR-8-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '8', 'Recepción 8', 'PQS', 'ABC', '10 LB', '2027-07-31', null),
('TOR-8-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '8', 'Gabinete de emergencias', 'PQS', 'ABC', '10 LB', '2027-05-31', null),
('TOR-9-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '9', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', '2027-07-31', null),
('TOR-9-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '9', 'Central de esterilización', 'PQS', 'ABC', '10 LB', '2027-01-31', null),
('TOR-9-03', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '9', 'Sala de recuperación hemodinamia', 'PQS', 'ABC', '10 LB', '2027-07-31', null),
('TOR-9-04', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '9', 'Angiografía', 'CO2', 'BC', '10 LB', '2027-07-31', null),
('TOR-9-05', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '9', 'Sala de espera HD', 'CO2', 'BC', '10 LB', '2027-07-31', null),
('TOR-9-06', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', '9', 'Gabinete de emergencias', 'PQS', 'ABC', '10 LB', '2027-05-31', null),
('TOR-ADM-01', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', 'ADMON', 'Oficina financiera', 'CO2', 'BC', '5 LB', '2027-01-31', null),
('TOR-ADM-02', 'CAC Santa Barbara', 'CAC Santa Barbara Torre', 'ADMON', 'Sala de juntas', 'PQS', 'ABC', '10 LB', null, null),
('URG-1-01', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Entrada funcionarios', 'CO2', 'BC', '10 LB', null, null),
('URG-1-02', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Pasillo entrada funcionarios', 'CO2', 'BC', '5 LB', null, null),
('URG-1-03', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Gabinete de emergencias (Funcionarios)', 'PQS', 'ABC', '10 LB', null, null),
('URG-1-04', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Sala de espera', 'CO2', 'BC', '5 LB', null, null),
('URG-1-05', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Gabinete de emergencias (Reanima)', 'PQS', 'ABC', '10 LB', null, null),
('URG-1-06', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Estación de enfermería 1', 'CO2', 'BC', '5 LB', null, null),
('URG-1-07', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Estación de enfermería 3', 'CO2', 'BC', '5 LB', null, null),
('URG-1-08', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Gabinete de emergencias (Observa)', 'PQS', 'ABC', '10 LB', null, null),
('URG-1-09', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Estación de enfermería 4', 'CO2', 'BC', '5 LB', null, null),
('URG-1-10', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Gabinete de emergencias (Consultorio pediatria)', 'PQS', 'ABC', '10 LB', null, null),
('URG-1-11', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Pediatria', 'PQS', 'ABC', '10 LB', null, null),
('URG-1-12', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Cuartos de aislamiento', 'CO2', 'BC', '5 LB', null, null),
('URG-1-13', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '1', 'Gabinete de emergencias (UTR)', 'PQS', 'ABC', '10 LB', null, null),
('URG-MZN-1', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '-', 'Mezanine', 'CO2', 'BC', '10 LB', null, null),
('URG-ADM-01', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '2', 'Admon', 'CO2', 'BC', '5 LB', null, null),
('URG-ADM-02', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', '2', 'Gabinete de emergencias (Cafetín)', 'PQS', 'ABC', '10 LB', null, null),
('URG-E-1', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', 'Expanción', 'Expanción', 'CO2', 'BC', '10 LB', null, null),
('URG-E-2', 'CAC Santa Barbara', 'CAC Santa Barbara Urgencias', 'Expanción', 'Expanción', 'CO2', 'BC', '10 LB', null, null),
('CE-1-01', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '1', 'Sala de espera', 'PQS', 'ABC', '10 LB', null, null),
('CE-1-02', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '1', 'Pasillo consultorios', 'PQS', 'ABC', '10 LB', null, null),
('CE-1-03', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '1', 'Cuarto eléctrico', 'CO2', 'BC', '10 LB', null, null),
('CE-2-01', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '2', 'Sala de espera', 'PQS', 'ABC', '10 LB', null, null),
('CE-2-02', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '2', 'Pasillo consultorios', 'PQS', 'ABC', '10 LB', null, null),
('CE-2-03', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '2', 'Ascensor', 'CO2', 'BC', '10 LB', null, null),
('CE-3-01', 'CAC Santa Barbara', 'CAC Santa Barbara Centro de especialistas', '3', 'Cafetín', 'PQS', 'ABC', '10 LB', null, null),
('AMB-01', 'CAC Santa Barbara', 'CAC Santa Barbara Ambulancia', '-', 'Ambulancia FVQ841', 'PQS', 'ABC', '10 LB', null, null);
