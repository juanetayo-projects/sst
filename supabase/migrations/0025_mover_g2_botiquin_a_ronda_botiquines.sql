-- El grupo "G2.- Botiquín de Primeros Auxilios" (ronda de Emergencias) se traslada a la ronda de
-- Botiquines, reemplazando a "G1.- Contenido del botiquín" (0 respuestas registradas, se elimina).
-- El catálogo de elementos de botiquín se actualiza al contenido de G2, y se limpian las marcas de
-- "faltantes" existentes porque referenciaban el catálogo anterior.

delete from preguntas where categoria_id = '2b18cde2-11e6-4102-a898-7c253664b416';
delete from categorias_pregunta where id = '2b18cde2-11e6-4102-a898-7c253664b416';

update categorias_pregunta
set tipo_inspeccion_id = (select id from tipos_inspeccion where codigo = 'botiquines'), orden = 1
where id = '8319e7a5-4ddb-4e25-b66a-fdfd621c7947';

update preguntas
set tipo_inspeccion_id = (select id from tipos_inspeccion where codigo = 'botiquines')
where categoria_id = '8319e7a5-4ddb-4e25-b66a-fdfd621c7947';

delete from catalogo_elementos_botiquin;

insert into catalogo_elementos_botiquin (nombre, cantidad, forma, orden) values
('Guantes quirúrgicos', '3 pares', 'caja', 1),
('Tapabocas', '3 unidades', 'paquete', 2),
('Copitos de algodón', '1 paquete', 'paquete', 3),
('Curas', '10 curas', 'caja', 4),
('Esparadrapo o Micropore', '1 unidad c/u', 'rollo', 5),
('Gasa', '8 paquetes', 'paquete', 6),
('Yodopavinona Espuma', '1 unidad', 'frasco', 7),
('Isodine solución', '1 unidad', 'frasco', 8),
('Bajalenguas', '1 paquete x 10', 'paquete', 9),
('Vendas elásticas', '4 unidades', 'rollo', 10),
('Tijeras', '1 unidad', 'caja', 11),
('Termómetro', '1 unidad', 'caja', 12),
('Linterna', '1 unidad', 'caja', 13),
('Pito', '1 unidad', 'caja', 14),
('Solución salina', '100 ml', 'frasco', 15),
('Alcohol', null, 'frasco', 16),
('Algodón', null, 'paquete', 17),
('Jabón antibacterial', null, 'frasco', 18),
('Parche estéril para ojos', '3 unidades', 'paquete', 19),
('Jeringa 10 ml', '2 unidades', 'caja', 20),
('Maletín- Maleta- Estuche guarda elementos', null, 'caja', 21);

update inventario_equipos
set atributos = atributos || jsonb_build_object('elementos_faltantes', '[]'::jsonb)
where tipo_equipo = 'botiquin';
