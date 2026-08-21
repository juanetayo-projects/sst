-- Agrega el campo "Observaciones" a las 36 categorías que aún no lo tenían.
insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria, activa)
select c.tipo_inspeccion_id, c.id, 'Observaciones', 'texto',
  coalesce((select max(p.orden) from preguntas p where p.categoria_id = c.id), 0) + 1,
  false, true
from categorias_pregunta c
join tipos_inspeccion t on t.id = c.tipo_inspeccion_id
where (t.codigo = 'emergencias' and c.nombre = 'G8.- Señalización de Emergencias y Seguridad')
   or (t.codigo = 'orden_aseo' and c.nombre in ('G4.- Baños','G5.- Cocina','G6.- Salas de Espera','G7.- Pisos y Pasillos','G8.- Señalización de Emergencias y Seguridad','G9.- Áreas/Oficinas'))
   or (t.codigo = 'sustancias_quimicas' and c.nombre in ('Etiquetado y Marcado','Hojas de Seguridad','Almacenamiento','Eliminación'))
   or (t.codigo = 'vehiculos_preoperacional')
   or (t.codigo in ('alturas_verificacion','alturas_preoperacional','escalera','andamios'));
