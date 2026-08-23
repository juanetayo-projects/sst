-- Registros de prueba para el modulo de Botiquines (pedidos explicitamente por el usuario para
-- probar el CRUD/estadisticas/export mientras llegan los datos reales de ubicaciones).
-- sede/empresa usan la misma convencion ya normalizada para extintores (catalogos "sedes"/"empresas":
-- nombres cortos "Torre"/"Urgencias"/"Centro de Especialistas", empresa "CACSB").
insert into inventario_equipos (tipo_equipo, codigo, empresa, sede, piso, ubicacion, fecha_vencimiento, atributos) values
('botiquin', 'BOT-TOR-1-01', 'CACSB', 'Torre', '1', 'Recepción vehicular', '2026-09-10', '{"tipo_botiquin":"A","elementos_faltantes":["alcohol"]}'),
('botiquin', 'BOT-TOR-2-01', 'CACSB', 'Torre', '2', 'Pasillo hospitalización', '2026-07-15', '{"tipo_botiquin":"A","elementos_faltantes":["gasas","guantes"]}'),
('botiquin', 'BOT-TOR-5-01', 'CACSB', 'Torre', '5', 'UCI', '2027-06-30', '{"tipo_botiquin":"A","elementos_faltantes":[]}'),
('botiquin', 'BOT-URG-1-01', 'CACSB', 'Urgencias', '1', 'Sala de espera', '2027-03-31', '{"tipo_botiquin":"A","elementos_faltantes":[]}'),
('botiquin', 'BOT-URG-1-02', 'CACSB', 'Urgencias', '1', 'Estación de enfermería 1', '2027-01-31', '{"tipo_botiquin":"B","elementos_faltantes":["termometro"]}'),
('botiquin', 'BOT-CE-1-01', 'CACSB', 'Centro de Especialistas', '1', 'Sala de espera', null, '{"tipo_botiquin":"A","elementos_faltantes":[]}');
