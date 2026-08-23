-- Ronda de Botiquines: nuevo tipo_inspeccion (11), autocompletado de codigo/tipo/ubicacion desde
-- inventario_equipos (mismo patron que extintores), checklist sembrado desde catalogo_elementos_botiquin.
insert into tipos_inspeccion (codigo, nombre, descripcion, tipo_respuesta, requiere_trabajo, tiene_hallazgos, orden)
values ('botiquines', 'Inspección a botiquines', 'Verificación del contenido y vencimientos del botiquín de primeros auxilios, según la Resolución 705 de 2007.', 'cumple_no_cumple_na', false, true, 11);

-- Encabezado: codigo (selector) + tipo/ubicacion autocompletados (solo lectura en el formulario)
insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria)
select id, null::uuid, 'Código del botiquín', 'texto', 1, true from tipos_inspeccion where codigo = 'botiquines'
union all
select id, null::uuid, 'Tipo de botiquín', 'texto', 2, true from tipos_inspeccion where codigo = 'botiquines'
union all
select id, null::uuid, 'Ubicación del botiquín', 'texto', 3, true from tipos_inspeccion where codigo = 'botiquines';

-- Categoria unica: contenido del botiquin
insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden)
select id, 'G1.- Contenido del botiquín', 'verde', 1 from tipos_inspeccion where codigo = 'botiquines';

-- Checklist: un item por elemento activo del catalogo, en el mismo orden del catalogo
insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria)
select
  ti.id,
  cp.id,
  format('1.%s.- %s%s', lpad(ceb.orden::text, 2, '0'), ceb.nombre, case when ceb.cantidad is not null then format(' (%s)', ceb.cantidad) else '' end),
  'opcion',
  ceb.orden,
  true
from catalogo_elementos_botiquin ceb,
     (select id from tipos_inspeccion where codigo = 'botiquines') ti,
     (select cp.id from categorias_pregunta cp join tipos_inspeccion t on t.id = cp.tipo_inspeccion_id where t.codigo = 'botiquines' and cp.nombre = 'G1.- Contenido del botiquín') cp
where ceb.activo = true
order by ceb.orden;

-- Observaciones (al final del checklist)
insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria)
select ti.id, cp.id, 'Observaciones', 'texto', 99, false
from (select id from tipos_inspeccion where codigo = 'botiquines') ti,
     (select cp.id from categorias_pregunta cp join tipos_inspeccion t on t.id = cp.tipo_inspeccion_id where t.codigo = 'botiquines' and cp.nombre = 'G1.- Contenido del botiquín') cp;

-- Cierre estandar (mismos textos que las demas rondas para que mapearCierreAColumnas() funcione igual)
insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria)
select id, null::uuid, 'A1.- FORTALEZAS', 'texto', 901, false from tipos_inspeccion where codigo = 'botiquines'
union all
select id, null::uuid, 'A2.- HALLAZGOS (Compromisos)', 'texto', 902, false from tipos_inspeccion where codigo = 'botiquines'
union all
select id, null::uuid, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 903, false from tipos_inspeccion where codigo = 'botiquines'
union all
select id, null::uuid, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 904, false from tipos_inspeccion where codigo = 'botiquines';
