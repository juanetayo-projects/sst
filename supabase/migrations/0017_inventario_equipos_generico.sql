-- Generaliza inventario_extintores para admitir más tipos de equipo en el futuro (botiquines, camillas, ...).
-- Las columnas específicas de extintor (agente_extintor/tipo/capacidad/prueba_hidrostatica) se conservan tal cual
-- para no romper nada existente; un futuro tipo de equipo usará "atributos" para sus campos propios.
alter table inventario_extintores rename to inventario_equipos;

alter table inventario_equipos add column tipo_equipo text not null default 'extintor';
alter table inventario_equipos add column atributos jsonb not null default '{}'::jsonb;

alter policy "inventario extintores lectura" on inventario_equipos rename to "inventario equipos lectura";
alter policy "inventario extintores escritura admin" on inventario_equipos rename to "inventario equipos escritura admin";
