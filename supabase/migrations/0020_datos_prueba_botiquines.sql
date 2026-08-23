-- Registros de prueba para el modulo de Botiquines (pedidos explicitamente por el usuario para
-- probar el CRUD/estadisticas/export mientras llegan los datos reales de ubicaciones).
insert into inventario_equipos (tipo_equipo, codigo, empresa, sede, piso, ubicacion, fecha_vencimiento, atributos) values
('botiquin', 'BOT-TOR-1-01', 'CACSB', 'CAC Santa Barbara Torre', '1', 'Recepción vehicular', '2026-09-10', '{"tipo_botiquin":"A","elementos_faltantes":["alcohol"]}'),
('botiquin', 'BOT-TOR-2-01', 'CACSB', 'CAC Santa Barbara Torre', '2', 'Pasillo hospitalización', '2026-07-15', '{"tipo_botiquin":"A","elementos_faltantes":["gasas","guantes"]}'),
('botiquin', 'BOT-TOR-5-01', 'CACSB', 'CAC Santa Barbara Torre', '5', 'UCI', '2027-06-30', '{"tipo_botiquin":"A","elementos_faltantes":[]}'),
('botiquin', 'BOT-URG-1-01', 'CACSB', 'CAC Santa Barbara Urgencias', '1', 'Sala de espera', '2027-03-31', '{"tipo_botiquin":"A","elementos_faltantes":[]}'),
('botiquin', 'BOT-URG-1-02', 'CACSB', 'CAC Santa Barbara Urgencias', '1', 'Estación de enfermería 1', '2027-01-31', '{"tipo_botiquin":"B","elementos_faltantes":["termometro"]}'),
('botiquin', 'BOT-CE-1-01', 'CACSB', 'CAC Santa Barbara Centro de especialistas', '1', 'Sala de espera', null, '{"tipo_botiquin":"A","elementos_faltantes":[]}');
