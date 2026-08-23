-- Catalogo administrable de elementos de botiquin (antes una lista fija en el codigo) — el admin
-- puede agregar/quitar elementos desde Administracion -> Catalogos, y el checklist de cada botiquin
-- se arma dinamicamente desde aqui.
create table catalogo_elementos_botiquin (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cantidad text,
  forma text not null default 'caja' check (forma in ('caja', 'paquete', 'frasco', 'rollo')),
  orden integer not null default 0,
  activo boolean not null default true
);

alter table catalogo_elementos_botiquin enable row level security;

create policy "catalogo elementos botiquin lectura" on catalogo_elementos_botiquin
  for select using (auth.role() = 'authenticated');

create policy "catalogo elementos botiquin escritura admin" on catalogo_elementos_botiquin
  for all using (is_admin()) with check (is_admin());

-- Semilla: el contenido minimo Tipo A (Resolucion 705 de 2007) que antes vivia hardcodeado en
-- src/lib/botiquines.ts. IDs fijos (no aleatorios) para poder remapear los datos de prueba abajo.
insert into catalogo_elementos_botiquin (id, nombre, cantidad, forma, orden) values
('00000000-0000-0000-0000-000000000001', 'Gasas limpias', '1 paquete x20', 'paquete', 1),
('00000000-0000-0000-0000-000000000002', 'Esparadrapo de tela 4"', '1 rollo', 'rollo', 2),
('00000000-0000-0000-0000-000000000003', 'Bajalenguas', '1 paquete x20', 'paquete', 3),
('00000000-0000-0000-0000-000000000004', 'Guantes de látex', '1 caja x100', 'caja', 4),
('00000000-0000-0000-0000-000000000005', 'Vendas elásticas (2", 3", 5")', '1 c/u', 'rollo', 5),
('00000000-0000-0000-0000-000000000006', 'Vendas de algodón (3"x5yda)', '2', 'rollo', 6),
('00000000-0000-0000-0000-000000000007', 'Yodopovidona', '1 frasco x120ml', 'frasco', 7),
('00000000-0000-0000-0000-000000000008', 'Solución salina', '2 x 250-500cc', 'frasco', 8),
('00000000-0000-0000-0000-000000000009', 'Termómetro digital', '1', 'caja', 9),
('00000000-0000-0000-0000-000000000010', 'Alcohol antiséptico', '1 frasco x275ml', 'frasco', 10);

-- Remapea los elementos_faltantes de los botiquines de prueba (migracion 0020) del slug viejo al id nuevo.
update inventario_equipos
set atributos = jsonb_set(
  atributos,
  '{elementos_faltantes}',
  (
    select coalesce(jsonb_agg(
      case elem
        when 'gasas' then '00000000-0000-0000-0000-000000000001'
        when 'esparadrapo' then '00000000-0000-0000-0000-000000000002'
        when 'bajalenguas' then '00000000-0000-0000-0000-000000000003'
        when 'guantes' then '00000000-0000-0000-0000-000000000004'
        when 'venda_elastica' then '00000000-0000-0000-0000-000000000005'
        when 'venda_algodon' then '00000000-0000-0000-0000-000000000006'
        when 'yodopovidona' then '00000000-0000-0000-0000-000000000007'
        when 'solucion_salina' then '00000000-0000-0000-0000-000000000008'
        when 'termometro' then '00000000-0000-0000-0000-000000000009'
        when 'alcohol' then '00000000-0000-0000-0000-000000000010'
        else elem
      end
    ), '[]'::jsonb)
    from jsonb_array_elements_text(atributos -> 'elementos_faltantes') as elem
  )
)
where tipo_equipo = 'botiquin';
