
-- === emergencias ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'emergencias';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, 'Tipo de equipo inspeccionado', 'select', '["Gabinete de red contraincendios","Botiquín de primeros auxilios","Camilla","Lámparas de emergencia","Señalización"]'::jsonb, 1, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Gabinete de Red Contraincendios', 'azul', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Señalizacion', 'opcion', 1, true),
    (v_tipo, v_cat, 'Cerradura', 'opcion', 2, true),
    (v_tipo, v_cat, 'Vidrio', 'opcion', 3, true),
    (v_tipo, v_cat, 'Pintura', 'opcion', 4, true),
    (v_tipo, v_cat, 'Limpieza', 'opcion', 5, true),
    (v_tipo, v_cat, 'Puerta', 'opcion', 6, true),
    (v_tipo, v_cat, 'Soporte Manguera', 'opcion', 7, true),
    (v_tipo, v_cat, 'Manguera', 'opcion', 8, true),
    (v_tipo, v_cat, 'Valvula', 'opcion', 9, true),
    (v_tipo, v_cat, 'Llave Spanner', 'opcion', 10, true),
    (v_tipo, v_cat, 'Boquilla', 'opcion', 11, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 12, false);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G8.- Señalización de Emergencias y Seguridad', 'verde', 2, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '8.01.- Están ubicadas en lugares visibles', 'opcion', 1, true),
    (v_tipo, v_cat, '8.02.- Existen avisos y señales en las áreas requeridas', 'opcion', 2, true),
    (v_tipo, v_cat, '8.03.- Se encuentran en buen estado', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G2.- Botiquín de Primeros Auxilios', 'ambar', 3, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '2.01.- Guantes quirúrgicos (3 pares)', 'opcion', 1, true),
    (v_tipo, v_cat, '2.02.- Tapabocas (3 unidades)', 'opcion', 2, true),
    (v_tipo, v_cat, '2.03.- Copitos de algodón (1 paquete)', 'opcion', 3, true),
    (v_tipo, v_cat, '2.04.- Curas (10 curas)', 'opcion', 4, true),
    (v_tipo, v_cat, '2.05.- Esparadrapo o Micropore (1 unidad c/u)', 'opcion', 5, true),
    (v_tipo, v_cat, '2.06.- Gasa (8 paquetes)', 'opcion', 6, true),
    (v_tipo, v_cat, '2.07.- Yodopavinona Espuma (1 unidad)', 'opcion', 7, true),
    (v_tipo, v_cat, '2.08.- Isodine solución (1 unidad)', 'opcion', 8, true),
    (v_tipo, v_cat, '2.09.- Bajalenguas (1 paquete x 10)', 'opcion', 9, true),
    (v_tipo, v_cat, '2.10.- Vendas elásticas (4 unidades)', 'opcion', 10, true),
    (v_tipo, v_cat, '2.11.- Tijeras (1 unidad)', 'opcion', 11, true),
    (v_tipo, v_cat, '2.12.- Termómetro (1 unidad)', 'opcion', 12, true),
    (v_tipo, v_cat, '2.13.- Linterna (1 unidad)', 'opcion', 13, true),
    (v_tipo, v_cat, '2.14.- Pito (1 unidad)', 'opcion', 14, true),
    (v_tipo, v_cat, '2.15.- Solución salina 100 ml', 'opcion', 15, true),
    (v_tipo, v_cat, '2.16.- Alcohol', 'opcion', 16, true),
    (v_tipo, v_cat, '2.17.- Algodón', 'opcion', 17, true),
    (v_tipo, v_cat, '2.18.- Jabón antibacterial', 'opcion', 18, true),
    (v_tipo, v_cat, '2.19.- Parche esteril para ojos (3 unidades)', 'opcion', 19, true),
    (v_tipo, v_cat, '2.20.- Jeringa 10 ml (2 unidades)', 'opcion', 20, true),
    (v_tipo, v_cat, '2.21.- Maletín- Maleta- Estuche guarda elementos', 'opcion', 21, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 22, false);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G3.- Camilla', 'violeta', 4, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '3.01.- Instalación', 'opcion', 1, true),
    (v_tipo, v_cat, '3.02.- Señalización', 'opcion', 2, true),
    (v_tipo, v_cat, '3.03.- Estado de la tabla', 'opcion', 3, true),
    (v_tipo, v_cat, '3.04.- Correas de seguridad', 'opcion', 4, true),
    (v_tipo, v_cat, '3.05.- Sujetadores para cargue', 'opcion', 5, true),
    (v_tipo, v_cat, '3.06.- Cuello ortopédico', 'opcion', 6, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 7, false);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Lámparas de Emergencia', 'teal', 5, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'La lampara se encuentra limpia', 'opcion', 1, true),
    (v_tipo, v_cat, 'La lampara cuenta con sus partes integras', 'opcion', 2, true),
    (v_tipo, v_cat, 'La lampara al momento de testear enciende', 'opcion', 3, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 4, false);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 901, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 902, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 903, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 904, false);
end $$;

-- === extintores ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'extintores';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, 'Tipo de Extintor', 'texto', null, 1, true),
    (v_tipo, null, 'Capacidad del extintor', 'texto', null, 2, true),
    (v_tipo, null, 'Código del Extintor', 'texto', null, 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G1.- Extintores', 'azul', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '1.01.- La base del extintor está al menos 10 cm de la altura sobre nivel del suelo', 'opcion', 1, true),
    (v_tipo, v_cat, '1.02.- Estado de pintura', 'opcion', 2, true),
    (v_tipo, v_cat, '1.03.- Se encuentran libres de golpes', 'opcion', 3, true),
    (v_tipo, v_cat, '1.04.- Cuenta con autoadhesivo Fecha / Tipo', 'opcion', 4, true),
    (v_tipo, v_cat, '1.05.- Estado de la manijas de transporte', 'opcion', 5, true),
    (v_tipo, v_cat, '1.06.- Estado de la manijas de disparo/accionamiento', 'opcion', 6, true),
    (v_tipo, v_cat, '1.07.- Presión', 'opcion', 7, true),
    (v_tipo, v_cat, '1.08.- Manómetros se encuentra cargados', 'opcion', 8, true),
    (v_tipo, v_cat, '1.09.- Boquillas se encuentra en buen estado', 'opcion', 9, true),
    (v_tipo, v_cat, '1.10.- Mangueras se encuentra en buen estado', 'opcion', 10, true),
    (v_tipo, v_cat, '1.11.- Se encuentran con Ring o aro de seguridad', 'opcion', 11, true),
    (v_tipo, v_cat, '1.12.- Corneta', 'opcion', 12, true),
    (v_tipo, v_cat, '1.13.- Se encuentra señalizados', 'opcion', 13, true),
    (v_tipo, v_cat, '1.14.- Cuentan con los respectivos soportes (colgar/piso)', 'opcion', 14, true),
    (v_tipo, v_cat, '1.15.- Fecha de vencimiento', 'opcion', 15, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 16, false);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 901, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 902, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 903, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 904, false);
end $$;

-- === orden_aseo ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'orden_aseo';

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G4.- Baños', 'verde', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '4.01.- Se encuentran visualmente aseados', 'opcion', 1, true),
    (v_tipo, v_cat, '4.02.- Se perciben con aroma a limpieza', 'opcion', 2, true),
    (v_tipo, v_cat, '4.03.- Hay dotación de papel higiénico y dispensador de jabón', 'opcion', 3, true),
    (v_tipo, v_cat, '4.04.- Cuenta con caneca para la disposición de residuos solidos', 'opcion', 4, true),
    (v_tipo, v_cat, '4.05.- Estructura en buen estado (piso, techo, paredes)', 'opcion', 5, true),
    (v_tipo, v_cat, '4.06.- Los artefactos sanitarios se encuentran en buen estado', 'opcion', 6, true),
    (v_tipo, v_cat, '4.07.- Cuenta con Ventilacion e iluminacion natural o artificial', 'opcion', 7, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G5.- Cocina', 'ambar', 2, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '5.01.- Los utensilios de cocina permanecen limpios', 'opcion', 1, true),
    (v_tipo, v_cat, '5.02.- Los mesones permanecen libres de residuos de alimentos', 'opcion', 2, true),
    (v_tipo, v_cat, '5.03.- Estructura en buen estado (piso, techo, paredes)', 'opcion', 3, true),
    (v_tipo, v_cat, '5.04.- Cuenta con Ventilacion e iluminacion natural o artificial', 'opcion', 4, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G6.- Salas de Espera', 'violeta', 3, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '6.01.- Las sillas están limpias y en buen estado', 'opcion', 1, true),
    (v_tipo, v_cat, '6.02.- La barra (recepción) esta ordenada, limpia y libre de objetos innecesarios', 'opcion', 2, true),
    (v_tipo, v_cat, '6.03.- Cuenta con caneca para la disposición de residuos solidos', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G7.- Pisos y Pasillos', 'teal', 4, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '7.01.- Las áreas de circulación común se encuentran demarcadas claramente y libres de obstáculos y objetos innecesarios', 'opcion', 1, true),
    (v_tipo, v_cat, '7.02.- Los pisos están limpios, secos, sin desperdicios', 'opcion', 2, true),
    (v_tipo, v_cat, '7.03.- Los pasillos y entradas a las oficinas están libres de obstrucción', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G8.- Señalización de Emergencias y Seguridad', 'azul', 5, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '8.01.- Están ubicadas en lugares visibles', 'opcion', 1, true),
    (v_tipo, v_cat, '8.02.- Existen avisos y señales en las áreas requeridas', 'opcion', 2, true),
    (v_tipo, v_cat, '8.03.- Se encuentran en buen estado', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G9.- Áreas/Oficinas', 'verde', 6, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '9.01.- Las ventanas y paredes se encuentran en buen estado, están limpias y libres de objetos innecesarios y en buen estado', 'opcion', 1, true),
    (v_tipo, v_cat, '9.02.- Los techos están libres de goteras y los cielorrasos razonablemente limpios', 'opcion', 2, true),
    (v_tipo, v_cat, '9.03.- Las puertas de salida están libres de obstáculos', 'opcion', 3, true),
    (v_tipo, v_cat, '9.04.- Se encuentra señalada la ruta de evacuación', 'opcion', 4, true),
    (v_tipo, v_cat, '9.05.- Sobre los escritorios solamente se encuentran los elementos requeridos para trabajar (cosedoras, perforadoras, sacaganchos, cuaderno para notas…etc)', 'opcion', 5, true),
    (v_tipo, v_cat, '9.06.- Los documentos son archivados oportunamente en el lugar correspondiente', 'opcion', 6, true),
    (v_tipo, v_cat, '9.07.- El papel reciclado se encuentra almacenado en el lugar destinado para ello', 'opcion', 7, true),
    (v_tipo, v_cat, '9.08.- El área se encuentra limpia y libre de obstáculos', 'opcion', 8, true),
    (v_tipo, v_cat, '9.09.- Los drenajes y alcantarillas se encuentran protegidos y en buen estado', 'opcion', 9, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G10.- Instalaciones Eléctricas', 'ambar', 7, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '10.01.- Toma electricos, interruptores en buen estado', 'opcion', 1, true),
    (v_tipo, v_cat, '10.02.- Canaletas, estabilizadores o UPS en buen estado', 'opcion', 2, true),
    (v_tipo, v_cat, '10.03.- Extensiones completas o con uniones aisladas y en buen estado', 'opcion', 3, true),
    (v_tipo, v_cat, '10.04.- Luminarias y Estructuras en buen estado', 'opcion', 4, true),
    (v_tipo, v_cat, '10.05.- Caja y Breakers en buen estado', 'opcion', 5, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 6, false);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 901, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 902, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 903, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 904, false);
end $$;

-- === sustancias_quimicas ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'sustancias_quimicas';

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Etiquetado y Marcado', 'violeta', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se encuentran debidamente rotulados', 'opcion', 1, true),
    (v_tipo, v_cat, 'Rótulos en buen estado', 'opcion', 2, true),
    (v_tipo, v_cat, 'Los frascos de productos químicos cuentan con las etiquetas adecuadas para facilitar su identificación', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Hojas de Seguridad', 'teal', 2, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se cuenta en el área con las hojas de seguridad correspondientes', 'opcion', 1, true),
    (v_tipo, v_cat, 'Hojas de seguridad en buen estado', 'opcion', 2, true),
    (v_tipo, v_cat, 'Hojas de seguridad corresponden a la información presentada en el rótulo del producto', 'opcion', 3, true),
    (v_tipo, v_cat, 'Hojas de seguridad son fácilmente identificables y de fácil acceso', 'opcion', 4, true),
    (v_tipo, v_cat, 'Se encuentran en el idioma adecuado al personal que lo consulta', 'opcion', 5, true),
    (v_tipo, v_cat, 'Existe copia de las hojas de seguridad de los productos', 'opcion', 6, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Almacenamiento', 'azul', 3, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se encuentran las sustancias en recipientes adecuados', 'opcion', 1, true),
    (v_tipo, v_cat, 'Se encuentran los recipientes limpios', 'opcion', 2, true),
    (v_tipo, v_cat, 'Se encuentran los recipientes bien cerrados', 'opcion', 3, true),
    (v_tipo, v_cat, 'El piso del almacén donde se almacena es Impermeable', 'opcion', 4, true),
    (v_tipo, v_cat, 'Existe almacenamiento de material combustible y/o inflamable cerca de fuentes generadoras de calor', 'opcion', 5, true),
    (v_tipo, v_cat, 'El almacén tiene buena ventilación que evite la acumulación de vapores tóxicos o inflamables', 'opcion', 6, true),
    (v_tipo, v_cat, 'Se encuentran organizados los productos químicos de acuerdo con su incompatibilidad', 'opcion', 7, true),
    (v_tipo, v_cat, 'El almacén cuenta con material absorbente para manejo de derrames', 'opcion', 8, true),
    (v_tipo, v_cat, 'Existe salida de emergencia en el almacén', 'opcion', 9, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Eliminación', 'verde', 4, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se realiza la dosificación adecuada a los productos', 'opcion', 1, true),
    (v_tipo, v_cat, 'Se hace la reutilización de la sustancia y/o producto', 'opcion', 2, true),
    (v_tipo, v_cat, 'Se hace eliminación adecuada de las sustancias y/o producto', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Entrenamiento', 'ambar', 5, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se le informa al personal los riesgos a los que está expuesto por el manejo de sustancias químicas', 'opcion', 1, true),
    (v_tipo, v_cat, 'Se encuentran los registros relacionados de divulgaciones', 'opcion', 2, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 3, false);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'FORTALEZAS', 'texto', 901, false),
    (v_tipo, null, 'HALLAZGOS (Compromisos)', 'texto', 902, false),
    (v_tipo, null, 'URGENTE Y/O REITERATIVO', 'booleano', 903, false),
    (v_tipo, null, 'NOMBRE COLABORADOR QUE SUPERVISA', 'texto', 904, false),
    (v_tipo, null, 'NOMBRE COLABORADOR(ES) SUPERVISADO(S)', 'texto', 905, false);
end $$;

-- === epp ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'epp';

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G15.- Elementos de Protección Personal', 'violeta', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '15.01.- Gorro quirúrgico', 'opcion', 1, true),
    (v_tipo, v_cat, '15.02.- Bata desechable / Bata no desechable / Delantal antifluido', 'opcion', 2, true),
    (v_tipo, v_cat, '15.03.- Monogafas de seguridad', 'opcion', 3, true),
    (v_tipo, v_cat, '15.04.- Careta de seguridad', 'opcion', 4, true),
    (v_tipo, v_cat, '15.05.- Tapabocas quirúrgico / Respirador N95', 'opcion', 5, true),
    (v_tipo, v_cat, '15.06.- Guantes protección moto, casco y chaleco', 'opcion', 6, true),
    (v_tipo, v_cat, '15.07.- Overol anti fluido', 'opcion', 7, true),
    (v_tipo, v_cat, '15.08.- Polainas', 'opcion', 8, true),
    (v_tipo, v_cat, '15.09.- Uniforme', 'opcion', 9, true),
    (v_tipo, v_cat, '15.10.- Zapatos cerrados', 'opcion', 10, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 11, false);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'G16.- Higiene de Manos', 'teal', 2, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '16.01.- Realiza los cinco momentos de lavado de manos', 'opcion', 1, true),
    (v_tipo, v_cat, '16.02.- Realiza el lavado de manos y aplica los 12 pasos de lavado de manos', 'opcion', 2, true),
    (v_tipo, v_cat, '16.03.- Realiza desinfección de manos según lo estipulado en la organización', 'opcion', 3, true),
    (v_tipo, v_cat, 'Observaciones', 'texto', 4, false);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 901, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 902, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 903, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 904, false),
    (v_tipo, null, 'A5.- NOMBRE COLABORADOR(ES) SUPERVISADO(S)', 'texto', 905, false);
end $$;

-- === vehiculos_preoperacional ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'vehiculos_preoperacional';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, '¿Estás en condiciones de salud y descanso para usar el vehículo (sin malestar, mareos, fiebre, sueño u otros síntomas)?', 'booleano', null, 1, true),
    (v_tipo, null, 'Número de Cédula', 'texto', null, 2, true),
    (v_tipo, null, 'Nombre del Conductor', 'texto', null, 3, true),
    (v_tipo, null, 'Vehículo a conducir', 'select', '["Automóvil","Motocicleta","Ambulancia"]'::jsonb, 4, true),
    (v_tipo, null, 'Placa / Marca / Modelo', 'texto', null, 5, true),
    (v_tipo, null, 'Fecha de vencimiento del SOAT', 'fecha', null, 6, true),
    (v_tipo, null, 'Fecha de vencimiento de Revisión Tecnomecánica', 'fecha', null, 7, true),
    (v_tipo, null, 'Fecha de próxima recarga extintor', 'fecha', null, 8, true),
    (v_tipo, null, 'Fecha de revisión Botiquín', 'fecha', null, 9, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Automóvil', 'azul', 1, 'Vehículo a conducir', 'Automóvil') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Adecuados niveles de fluidos (aceite de motor y direccion hidraulica liquido de frenos, refrigerante)', 'opcion', 1, true),
    (v_tipo, v_cat, 'Nivel Liquido de frenos y/o embrague (nivel max)', 'opcion', 2, true),
    (v_tipo, v_cat, 'Nivel de refrigerante de motor (nivel maximo)', 'opcion', 3, true),
    (v_tipo, v_cat, 'Nivel de aceite Dirección Hidráulica', 'opcion', 4, true),
    (v_tipo, v_cat, 'Cuenta con agua deposito limpia parabrisas', 'opcion', 5, true),
    (v_tipo, v_cat, 'Revisión visual de fugas de fluidos (aceites, refrigerantes, agua, liquido frenos, etc.)', 'opcion', 6, true),
    (v_tipo, v_cat, 'Estado general de las llantas: Desgaste y presión de inflado (incluir llanta repuesto)', 'opcion', 7, true),
    (v_tipo, v_cat, 'Verificar estado general de cabina, puertas y carrocería (golpes, rayones, espejos retrovisores, limpieza general, gato, cruceta)', 'opcion', 8, true),
    (v_tipo, v_cat, 'Verificar funcionamiento luces en general (direccionales, stop, pito, plumillas, luces de advertencia, etc.)', 'opcion', 9, true),
    (v_tipo, v_cat, 'Verificar funcionamiento de indicadores tablero de instrumentos', 'opcion', 10, true),
    (v_tipo, v_cat, 'Verificar ruidos anormales de algún componente del vehiculo', 'opcion', 11, true),
    (v_tipo, v_cat, 'Verificar el estado de cinturones de seguridad', 'opcion', 12, true),
    (v_tipo, v_cat, 'Verificar el estado de vidrios, parabrisas y laterales', 'opcion', 13, true),
    (v_tipo, v_cat, 'Verificar el estado del motor limpio, libre de derrames de grasa, combustible, cables descubiertos o sueltos', 'opcion', 14, true),
    (v_tipo, v_cat, 'Verificar Kit de carretera', 'opcion', 15, true),
    (v_tipo, v_cat, 'Verificación de KIT de Herramientas (llaves, destornilladores, alicate, etc.)', 'opcion', 16, true),
    (v_tipo, v_cat, 'Verificar llanta de repuesto', 'opcion', 17, true),
    (v_tipo, v_cat, 'Verificar estado Baterías: ajuste de bornes y sulfatación', 'opcion', 18, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Motocicleta', 'verde', 2, 'Vehículo a conducir', 'Motocicleta') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Fugas y niveles de fluidos: revisar los niveles de los fluidos de la motocicleta (lubricante, combustible, refrigerante, líquidos de frenos)', 'opcion', 1, true),
    (v_tipo, v_cat, 'Espejos: revisar que los espejos no estén opacos y permitan una buena visualización; verificar que los espejos permiten graduarlos', 'opcion', 2, true),
    (v_tipo, v_cat, 'Bocina: hacer sonar la bocina para verificar su correcto funcionamiento', 'opcion', 3, true),
    (v_tipo, v_cat, 'Adecuado funcionamiento de luces de freno, direccionales, luces altas y bajas', 'opcion', 4, true),
    (v_tipo, v_cat, 'Direccionales: verificar que las luces enciendan correctamente y que se hagan los cambios; verificar que los acrílicos no tengan fracturas', 'opcion', 5, true),
    (v_tipo, v_cat, 'Luces altas, bajas: verificar que todas las luces enciendan y que se hagan los cambios; verificar que los acrílicos no tengan fracturas', 'opcion', 6, true),
    (v_tipo, v_cat, 'Llantas: verificar que las llantas tengan la presión recomendada por el fabricante; verificar que el labrado tenga profundidad correspondiente', 'opcion', 7, true),
    (v_tipo, v_cat, 'Estado general de las llantas: Desgaste y presión de inflado', 'opcion', 8, true),
    (v_tipo, v_cat, 'Estado Baterías: ajuste de bornes y sulfatación', 'opcion', 9, true),
    (v_tipo, v_cat, 'Estado del KIT de arrastre y tensión de la cadena', 'opcion', 10, true),
    (v_tipo, v_cat, 'Verificar estado general (golpes, rayones, espejos retrovisores, limpieza)', 'opcion', 11, true),
    (v_tipo, v_cat, 'Verificación de KIT de lluvia y Elementos de protección personal EPP (casco, chaleco, guantes, traje para lluvia, gafas, etc.)', 'opcion', 12, true),
    (v_tipo, v_cat, 'Verificación de KIT de Herramientas (llave bujía, destornilladores, alicate, etc.)', 'opcion', 13, true),
    (v_tipo, v_cat, 'Verificar ruidos anormales de algún componente del vehículo', 'opcion', 14, true),
    (v_tipo, v_cat, 'Cuenta con el chaleco reflectivo después de las 6 pm', 'opcion', 15, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Ambulancia - Revisión mecánica (antes de iniciar el motor)', 'ambar', 3, 'Vehículo a conducir', 'Ambulancia') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Nivel de aceite del motor', 'opcion', 1, true),
    (v_tipo, v_cat, 'Aceite dirección hidráulica', 'opcion', 2, true),
    (v_tipo, v_cat, 'Nivel de agua de batería', 'opcion', 3, true),
    (v_tipo, v_cat, 'Nivel agua de radiador', 'opcion', 4, true),
    (v_tipo, v_cat, 'Nivel líquido de frenos', 'opcion', 5, true),
    (v_tipo, v_cat, 'Nivel líquido de parabrisas', 'opcion', 6, true),
    (v_tipo, v_cat, 'Luces de emergencia', 'opcion', 7, true),
    (v_tipo, v_cat, 'Luces externas (altas, stop, direccionales, estacionarias y plataforma)', 'opcion', 8, true),
    (v_tipo, v_cat, 'Luces internas', 'opcion', 9, true),
    (v_tipo, v_cat, 'Presión inflado de llantas', 'opcion', 10, true),
    (v_tipo, v_cat, 'Tensión correas de ventilador', 'opcion', 11, true),
    (v_tipo, v_cat, 'Aire acondicionado', 'opcion', 12, true),
    (v_tipo, v_cat, 'Llanta de repuesto', 'opcion', 13, true),
    (v_tipo, v_cat, 'Asientos compartimiento paciente y cinturones de seguridad tipo anclaje', 'opcion', 14, true),
    (v_tipo, v_cat, 'Retrovisores', 'opcion', 15, true),
    (v_tipo, v_cat, 'Estado puertas de la cabina: bloqueo, ejes, material', 'opcion', 16, true),
    (v_tipo, v_cat, 'Señalización "No fume", "Use cinturón de seguridad"', 'opcion', 17, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Ambulancia - Revisión mecánica (con motor encendido)', 'violeta', 4, 'Vehículo a conducir', 'Ambulancia') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Observe operación de instrumentos', 'opcion', 1, true),
    (v_tipo, v_cat, 'Sistema de limpia brisas (plumillas)', 'opcion', 2, true),
    (v_tipo, v_cat, 'Pruebe la Sirena', 'opcion', 3, true),
    (v_tipo, v_cat, 'Encienda las luces de emergencia', 'opcion', 4, true),
    (v_tipo, v_cat, 'Encienda las luces internas', 'opcion', 5, true),
    (v_tipo, v_cat, 'Sistemas radio comunicación', 'opcion', 6, true),
    (v_tipo, v_cat, 'Sistema de frenos', 'opcion', 7, true),
    (v_tipo, v_cat, 'Aire acondicionado', 'opcion', 8, true),
    (v_tipo, v_cat, 'Equipo de perifoneo', 'opcion', 9, true),
    (v_tipo, v_cat, 'Verificar Funcionamiento del indicador (aguja) de ACPM / Gasolina', 'opcion', 10, true),
    (v_tipo, v_cat, 'Verificar funcionamiento del indicador (aguja) de presión de aceite', 'opcion', 11, true),
    (v_tipo, v_cat, 'Pito', 'opcion', 12, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Revisión de Herramientas', 'teal', 5, 'Vehículo a conducir', 'Ambulancia') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Extintor para fuegos ABC de 2.26 Kg compartimiento del conductor', 'opcion', 1, true),
    (v_tipo, v_cat, 'Alicate', 'opcion', 2, true),
    (v_tipo, v_cat, 'Destornilladores: Pala/estría', 'opcion', 3, true),
    (v_tipo, v_cat, 'Llave expansión', 'opcion', 4, true),
    (v_tipo, v_cat, 'Llaves fijas', 'opcion', 5, true),
    (v_tipo, v_cat, 'Rueda de repuesto', 'opcion', 6, true),
    (v_tipo, v_cat, 'Señales reflectivas de emergencia', 'opcion', 7, true),
    (v_tipo, v_cat, 'Linterna con pilas, la cual puede ser utilizada como lámpara desmontable', 'opcion', 8, true),
    (v_tipo, v_cat, 'Caja de fusibles surtidos de los usados por vehículo', 'opcion', 9, true),
    (v_tipo, v_cat, 'Gato y equipo para sustitución de ruedas', 'opcion', 10, true),
    (v_tipo, v_cat, 'Palanca patecabra', 'opcion', 11, true),
    (v_tipo, v_cat, 'Tacos de madera para bloqueo de llantas', 'opcion', 12, true),
    (v_tipo, v_cat, 'Cuerda estática de 20m, diámetro mínimo 12.5 y sus ganchos para tracción', 'opcion', 13, true),
    (v_tipo, v_cat, 'Juego de cables de iniciación eléctrica para la batería', 'opcion', 14, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Identificación Exterior', 'azul', 6, 'Vehículo a conducir', 'Ambulancia') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Leyenda AMBULANCIA en mayúscula, fija, reflectiva, a los costados, puerta posterior y techo', 'opcion', 1, true),
    (v_tipo, v_cat, 'Número de identificación reflectivo, en costados, frente y parte posterior', 'opcion', 2, true),
    (v_tipo, v_cat, 'Cruz de vida', 'opcion', 3, true),
    (v_tipo, v_cat, 'Sigla ámbito de servicio: TAM/TAB', 'opcion', 4, true),
    (v_tipo, v_cat, 'Nombre logotipo de la entidad', 'opcion', 5, true),
    (v_tipo, v_cat, 'Leyenda CONSERVE SU DISTANCIA, en material reflectivo', 'opcion', 6, true),
    (v_tipo, v_cat, 'Número de Teléfono, en la parte baja del vehículo y en la parte posterior', 'opcion', 7, true),
    (v_tipo, v_cat, 'Nombre la ciudad sede', 'opcion', 8, true);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'Reporte de novedades: indique en qué parte se evidencia deterioro, daños o fallas', 'texto', 901, false),
    (v_tipo, null, 'Kilometraje de Inicio', 'texto', 902, false),
    (v_tipo, null, 'Kilometraje al final', 'texto', 903, false),
    (v_tipo, null, 'Porta los documentos del conductor y vehículo vigente: licencia de tránsito, SOAT, revisión técnico-mecánica, licencia de conducción y cédula de ciudadanía', 'booleano', 904, false);
end $$;

-- === alturas_verificacion ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'alturas_verificacion';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, 'Tipos de trabajos en alturas a realizar', 'texto', null, 1, true),
    (v_tipo, null, 'Altura aproximada a la cual se va a desarrollar la actividad (mts)', 'texto', null, 2, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Planeación de la Labor', 'verde', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se cuenta con procedimiento especifico y claro para la labor a desarrollar', 'opcion', 1, true),
    (v_tipo, v_cat, 'Se dispone de los equipos y elementos necesarios para trabajar en alturas', 'opcion', 2, true),
    (v_tipo, v_cat, 'Personal cuenta con la certificado como persona autorizada para desarrollar trabajos en altura', 'opcion', 3, true),
    (v_tipo, v_cat, '¿Se cuenta con formato de permiso de trabajo en alturas con sus respectivas firmas de autorización ajustado a los requerimientos mínimos de la resolución 4272 del 2021 en su art 15?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿Se evidencia registro de inspeccion pre-operacional de los sistemas de acceso?', 'opcion', 5, true),
    (v_tipo, v_cat, '¿Se evidencia registro de inspeccion pre-uso de los sistemas de proteccion para trabajos en alturas?', 'opcion', 6, true),
    (v_tipo, v_cat, '¿Se evidencia análisis de peligros por actividad donde se hayan identificado los peligros y evaluado todos los riesgos asociados a la tarea realizada en alturas y se toman acciones para el control de los mismos?', 'opcion', 7, true),
    (v_tipo, v_cat, '¿Se evidencia registro de reporte de condiciones de salud por parte de los colaboradores y manifiesta estar en buenas condiciones de salud antes de iniciar la labor?', 'opcion', 8, true),
    (v_tipo, v_cat, '¿Se evidencia registrado nombre y firma de la persona responsable de activar el plan de emergencias en el permiso de trabajo en alturas?', 'opcion', 9, true),
    (v_tipo, v_cat, 'El empleador o contratista asigna ayudante de seguridad para labor a ejecutar', 'opcion', 10, true),
    (v_tipo, v_cat, '¿Se cuenta con coordinador de trabajo en alturas de la empresa o contratista?', 'opcion', 11, true),
    (v_tipo, v_cat, '¿Se realiza control de energías peligrosas (bloqueo y etiquetado) para la tarea a realizar en alturas, para el caso de líneas energizadas cercanas o equipos en movimiento (si aplica)?', 'opcion', 12, true),
    (v_tipo, v_cat, 'Los sistemas de acceso utilizados son certificados y compatibles entre sí, en tamaño, figura, materiales, forma, diámetro, cumpliendo con los criterios mínimos de auto estabilidad y auto soportabilidad', 'opcion', 13, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Área de Trabajo', 'ambar', 2, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'El área de ejecución de la labor se encuentra limpia, ordenada y es óptima para la ejecución de la tarea', 'opcion', 1, true),
    (v_tipo, v_cat, '¿Se manejan controles de acceso de personal para la tarea a realizar?', 'opcion', 2, true),
    (v_tipo, v_cat, 'Se señalizó y delimitó el área de trabajo, teniendo en cuenta la trayectoria de caída de objetos', 'opcion', 3, true),
    (v_tipo, v_cat, '¿Se demarcan, señalizan y/o cubren orificios (huecos o aberturas) que se encuentran en la superficie donde se trabaja o camina?', 'opcion', 4, true),
    (v_tipo, v_cat, 'Los colaboradores disponen de elementos necesarios que permitan portar, transportar y asegurar herramientas, materiales, equipos y objetos que puedan caer desde alturas', 'opcion', 5, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'EPP y Verificación de Sistema de Protección contra Caídas', 'violeta', 3, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '¿El personal usa casco con barbuquejo, mínimo tres puntos de apoyo según peligros identificados?', 'opcion', 1, true),
    (v_tipo, v_cat, '¿El personal usa guantes de seguridad según peligros identificados?', 'opcion', 2, true),
    (v_tipo, v_cat, '¿El personal usa botas de seguridad según peligros identificados?', 'opcion', 3, true),
    (v_tipo, v_cat, '¿El personal usa gafas de seguridad según peligros identificados?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿El personal usa protección auditiva según peligros identificados?', 'opcion', 5, true),
    (v_tipo, v_cat, '¿El personal se encuentra entrenado y capacitado en el uso de los EPP utilizados en la labor?', 'opcion', 6, true),
    (v_tipo, v_cat, '¿Los equipos de protección contra caídas se seleccionan y se usan según las necesidades determinadas para el trabajador, las condiciones, tipo de tarea y los sistemas de acceso a utilizar?', 'opcion', 7, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Verificación de Puntos de Anclaje y Conectores', 'teal', 4, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Si el trabajo requiere el uso de una línea de vida o dispositivo fijo, está debidamente certificada', 'opcion', 1, true),
    (v_tipo, v_cat, 'Existen puntos de anclajes seguros (certificados, estructurales, autorizados)', 'opcion', 2, true),
    (v_tipo, v_cat, 'Se tienen adaptadores de anclaje certificados y en buen estado', 'opcion', 3, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Plan de Rescate', 'azul', 5, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se conoce el plan de respuesta a emergencia del área', 'opcion', 1, true),
    (v_tipo, v_cat, 'Se cuenta con un plan de rescate planificado en caso de emergencia', 'opcion', 2, true);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'Nombre y Apellido Responsable de trabajo', 'texto', 901, false),
    (v_tipo, null, 'Nombre y apellido de la persona que autoriza el trabajo', 'texto', 902, false),
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 903, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 904, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 905, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 906, false);
end $$;

-- === alturas_preoperacional ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'alturas_preoperacional';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, 'Tipo de inspección', 'select', '["Pre inicio de la actividad (se realiza por única vez antes de iniciar labores)","Diaria"]'::jsonb, 1, true),
    (v_tipo, null, 'Ejecutor de la actividad', 'select', '["Equipo interno","Contratista"]'::jsonb, 2, true),
    (v_tipo, null, 'Marca', 'texto', null, 3, true),
    (v_tipo, null, 'Modelo', 'texto', null, 4, true),
    (v_tipo, null, 'Lote/Serial', 'texto', null, 5, true),
    (v_tipo, null, 'Fecha de fabricación', 'fecha', null, 6, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Arnés', 'verde', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Etiqueta - Completa', 'opcion', 1, true),
    (v_tipo, v_cat, 'Etiqueta - Legible', 'opcion', 2, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencian hoyos o agujeros en las correas', 'opcion', 3, true),
    (v_tipo, v_cat, 'Cintas/Correas - Las correas evidencian desgaste o están deshilachadas', 'opcion', 4, true),
    (v_tipo, v_cat, 'Cintas/Correas - Hay presencia de torsión en las correas', 'opcion', 5, true),
    (v_tipo, v_cat, 'Cintas/Correas - El arnés presenta suciedad o deterioro excesivo', 'opcion', 6, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencian quemaduras, contaminación por químicos, etc.', 'opcion', 7, true),
    (v_tipo, v_cat, 'Cintas/Correas - Las correas tienen salpicaduras de pintura u otra sustancia', 'opcion', 8, true),
    (v_tipo, v_cat, 'Cintas/Correas - Están en buen estado los testigos de impacto de las correas', 'opcion', 9, true),
    (v_tipo, v_cat, 'Costuras - Presentan roturas o quemaduras', 'opcion', 10, true),
    (v_tipo, v_cat, 'Costuras - Están reventadas o presentan desgaste excesivo', 'opcion', 11, true),
    (v_tipo, v_cat, 'Anillos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo', 'opcion', 12, true),
    (v_tipo, v_cat, 'Hebillas - El arnés tiene completas y en buen estado las hebillas', 'opcion', 13, true),
    (v_tipo, v_cat, 'Hebillas - El arnés presenta deformación en las hebillas', 'opcion', 14, true),
    (v_tipo, v_cat, 'Hebillas - Se evidencian fisuras, golpes, hundimientos, etc.', 'opcion', 15, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Eslinga de Posicionamiento', 'ambar', 2, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Etiqueta - Completa', 'opcion', 1, true),
    (v_tipo, v_cat, 'Etiqueta - Legible', 'opcion', 2, true),
    (v_tipo, v_cat, 'Ganchos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo', 'opcion', 3, true),
    (v_tipo, v_cat, 'Ganchos - Cuentan con doble seguro de apertura', 'opcion', 4, true),
    (v_tipo, v_cat, 'Ganchos - Se evidencian fallas que impidan la apertura de los ganchos', 'opcion', 5, true),
    (v_tipo, v_cat, 'Ganchos - Se evidencian fisuras, golpes, hundimientos, etc.', 'opcion', 6, true),
    (v_tipo, v_cat, 'Ganchos - La eslinga tiene sus ojetes deformados y/o rotos', 'opcion', 7, true),
    (v_tipo, v_cat, 'Costuras - Presentan roturas o quemaduras', 'opcion', 8, true),
    (v_tipo, v_cat, 'Costuras - Están reventadas o presentan desgaste excesivo', 'opcion', 9, true),
    (v_tipo, v_cat, 'Costuras - Están en buen estado los testigos de impacto de la correa', 'opcion', 10, true),
    (v_tipo, v_cat, 'Cintas/Correas - Tiene hoyos o agujeros en sus correas', 'opcion', 11, true),
    (v_tipo, v_cat, 'Cintas/Correas - Evidencian desgaste o están deshilachadas', 'opcion', 12, true),
    (v_tipo, v_cat, 'Cintas/Correas - Hay presencia de torsión en las correas', 'opcion', 13, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencia salpicadura de pintura y rigidez de las correas', 'opcion', 14, true),
    (v_tipo, v_cat, 'Cintas/Correas - Presentan suciedad o deterioro excesivo', 'opcion', 15, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencian quemaduras por soldadura, chispas, etc.', 'opcion', 16, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Tie Off', 'violeta', 3, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Etiqueta - Completa', 'opcion', 1, true),
    (v_tipo, v_cat, 'Etiqueta - Legible', 'opcion', 2, true),
    (v_tipo, v_cat, 'Cintas/Correas - La riata presenta desgaste o estiramiento excesivo', 'opcion', 3, true),
    (v_tipo, v_cat, 'Cintas/Correas - Fibras externas, cortadas, desgastadas o desgarradas', 'opcion', 4, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencia salpicadura de pintura y rigidez de las correas', 'opcion', 5, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencian quemaduras por soldadura, chispas, etc.', 'opcion', 6, true),
    (v_tipo, v_cat, 'Anillos - El Tie Off tiene completas y en buen estado los anillos', 'opcion', 7, true),
    (v_tipo, v_cat, 'Anillos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo', 'opcion', 8, true),
    (v_tipo, v_cat, 'Anillos - Se evidencian fisuras, golpes, hundimientos, etc.', 'opcion', 9, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Eslinga en Y con Absorbedor de Choque', 'teal', 4, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Etiqueta - Completa', 'opcion', 1, true),
    (v_tipo, v_cat, 'Etiqueta - Legible', 'opcion', 2, true),
    (v_tipo, v_cat, 'Ganchos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo', 'opcion', 3, true),
    (v_tipo, v_cat, 'Ganchos - Cuentan con doble seguro de apertura', 'opcion', 4, true),
    (v_tipo, v_cat, 'Ganchos - Se evidencian fallas que impidan la apertura de los ganchos', 'opcion', 5, true),
    (v_tipo, v_cat, 'Ganchos - Se evidencian fisuras, golpes, hundimientos, etc.', 'opcion', 6, true),
    (v_tipo, v_cat, 'Ganchos - La eslinga tiene sus ojetes deformados y/o rotos', 'opcion', 7, true),
    (v_tipo, v_cat, 'Costuras - Presentan roturas o quemaduras', 'opcion', 8, true),
    (v_tipo, v_cat, 'Costuras - Están reventadas o presentan desgaste excesivo', 'opcion', 9, true),
    (v_tipo, v_cat, 'Costuras - Están en buen estado los testigos de impacto de la correa', 'opcion', 10, true),
    (v_tipo, v_cat, 'Cintas/Correas - Tiene hoyos o agujeros en sus correas', 'opcion', 11, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencian desgaste o están deshilachadas', 'opcion', 12, true),
    (v_tipo, v_cat, 'Cintas/Correas - Hay presencia de torsión en las correas', 'opcion', 13, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencia salpicadura de pintura y rigidez de las correas', 'opcion', 14, true),
    (v_tipo, v_cat, 'Cintas/Correas - Presentan suciedad o deterioro excesivo', 'opcion', 15, true),
    (v_tipo, v_cat, 'Cintas/Correas - Se evidencian quemaduras por soldadura, chispas, etc.', 'opcion', 16, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Casco', 'azul', 5, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Presenta rayones, marcaciones profundas, fisuras, golpes, hundimientos, etc.', 'opcion', 1, true),
    (v_tipo, v_cat, 'Se encuentra posicionada y en buen estado la araña de absorción de impactos', 'opcion', 2, true),
    (v_tipo, v_cat, 'Barbuquejo de tres puntos de agarre, posicionado y en buen estado', 'opcion', 3, true),
    (v_tipo, v_cat, 'Sistema de aseguramiento en buen estado (clic)', 'opcion', 4, true),
    (v_tipo, v_cat, 'Banda de sudoración en buen estado', 'opcion', 5, true),
    (v_tipo, v_cat, 'Puntos de sujeción en buen estado', 'opcion', 6, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Mosquetón', 'verde', 6, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Se identifica corrosión, moho, decoloración o alteraciones de las propiedades externas', 'opcion', 1, true),
    (v_tipo, v_cat, 'Deformaciones, golpes o dobladuras', 'opcion', 2, true),
    (v_tipo, v_cat, 'Presenta fallas en el cierre y apertura; revise gatillo, espiga, seguro, eje', 'opcion', 3, true),
    (v_tipo, v_cat, 'Se identifica zanjas o desgaste excesivo en sus ángulos', 'opcion', 4, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Línea de Vida', 'ambar', 7, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Etiqueta - Completa', 'opcion', 1, true),
    (v_tipo, v_cat, 'Etiqueta - Legible', 'opcion', 2, true),
    (v_tipo, v_cat, 'Cuerda - Estiramiento excesivo, deformación de la cuerda', 'opcion', 3, true),
    (v_tipo, v_cat, 'Cuerda - Quemaduras o fibras derretidas', 'opcion', 4, true),
    (v_tipo, v_cat, 'Cuerda - Ojetes deformados y/o rotos', 'opcion', 5, true),
    (v_tipo, v_cat, 'Cuerda - Cortes, roturas, deshilachamiento del tejido o trenzado de la cuerda', 'opcion', 6, true),
    (v_tipo, v_cat, 'Partes Metálicas - Se evidencian fallas que impidan la apertura del gancho', 'opcion', 7, true),
    (v_tipo, v_cat, 'Partes Metálicas - El gancho cuenta con doble seguro de apertura, funcional', 'opcion', 8, true),
    (v_tipo, v_cat, 'Partes Metálicas - Las ganchos tienen presencia de corrosión u óxido', 'opcion', 9, true),
    (v_tipo, v_cat, 'Partes Metálicas - Se evidencian fisuras, golpes, hundimientos, etc.', 'opcion', 10, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Freno para Cuerda', 'violeta', 8, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Diámetro del arrestador, compatible con la cuerda', 'opcion', 1, true),
    (v_tipo, v_cat, 'Correcto aseguramiento del tornillo de bloqueo', 'opcion', 2, true),
    (v_tipo, v_cat, 'Posicionada y en buen estado guía fija y rodillo inferior', 'opcion', 3, true),
    (v_tipo, v_cat, 'Bisagra en buen estado, cierre y apertura', 'opcion', 4, true),
    (v_tipo, v_cat, 'Las guías o uñas de sujeción presentan desgaste excesivo o dientes partidos', 'opcion', 5, true),
    (v_tipo, v_cat, 'Doble Seguro de apertura funcional', 'opcion', 6, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Línea de Vida Horizontal', 'teal', 9, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Etiqueta - Completa', 'opcion', 1, true),
    (v_tipo, v_cat, 'Etiqueta - Legible', 'opcion', 2, true),
    (v_tipo, v_cat, 'Cuerda - Estiramiento excesivo, deformación de la cuerda', 'opcion', 3, true),
    (v_tipo, v_cat, 'Reata - Tiene hoyos o agujeros en sus correas', 'opcion', 4, true),
    (v_tipo, v_cat, 'Cuerda - Ojetes deformados y/o rotos', 'opcion', 5, true),
    (v_tipo, v_cat, 'Cuerda - Cortes, roturas, deshilachamiento del tejido o trenzado de la cuerda', 'opcion', 6, true),
    (v_tipo, v_cat, 'Partes Metálicas - Se evidencian fallas que impidan la apertura del gancho', 'opcion', 7, true),
    (v_tipo, v_cat, 'Partes Metálicas - El gancho cuenta con doble seguro de apertura, funcional', 'opcion', 8, true),
    (v_tipo, v_cat, 'Partes Metálicas - Las ganchos tienen presencia de corrosión u óxido', 'opcion', 9, true),
    (v_tipo, v_cat, 'Partes Metálicas - Se evidencian fisuras, golpes, hundimientos, etc.', 'opcion', 10, true),
    (v_tipo, v_cat, 'Reata - Las correas evidencian desgaste o están deshilachadas', 'opcion', 11, true),
    (v_tipo, v_cat, 'Reata - Hay presencia de torsión en las correas', 'opcion', 12, true),
    (v_tipo, v_cat, 'Reata - Se evidencia salpicadura de pintura y rigidez de las correas', 'opcion', 13, true),
    (v_tipo, v_cat, 'Reata - Presentan suciedad o deterioro excesivo', 'opcion', 14, true),
    (v_tipo, v_cat, 'Reata - Se evidencian quemaduras por soldadura, chispas, etc.', 'opcion', 15, true);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'Adjunte las fotos donde se evidencien las etiquetas de los equipos inspeccionados', 'texto', 901, false),
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 902, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 903, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 904, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 905, false);
end $$;

-- === escalera ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'escalera';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, 'Actividad a realizar', 'texto', null, 1, true),
    (v_tipo, null, 'Tipo de Escalera', 'select', '["ESCALERA VERTICAL FIJA (TIPO GATO)","ESCALERA VERTICAL PORTÁTIL SENCILLA Y DE EXTENSIÓN","ESCALERA DE TIJERA","ESCALERA DE PLATAFORMA O TIPO AVIÓN"]'::jsonb, 2, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Escalera Vertical Fija (Tipo Gato)', 'azul', 1, 'Tipo de Escalera', 'ESCALERA VERTICAL FIJA (TIPO GATO)') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'El ancho mínimo de la escalera fija es de 40 cm y la distancia máxima entre peldaños es de 30 cm', 'opcion', 1, true),
    (v_tipo, v_cat, '¿Se encuentra sólidamente anclada a las edificaciones?', 'opcion', 2, true),
    (v_tipo, v_cat, '¿Se identifica que en el entorno puede existir probabilidad de riesgo eléctrico?', 'opcion', 3, true),
    (v_tipo, v_cat, '¿Para alturas mayores de 4,5 metros, se cuenta con líneas de vida vertical fija, con freno mecánico o retráctiles?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿Para realizar el ascenso y descenso se implementa el uso del arnés? Y para aquellas con alturas inferiores a 4,5 metros, ¿se implementa eslinga en Y o doble?', 'opcion', 5, true),
    (v_tipo, v_cat, '¿La escalera presenta defectos estructurales? (peldaños rotos, listones sueltos, grietas, corrosión u otros)', 'opcion', 6, true),
    (v_tipo, v_cat, 'Se identifica de forma visible un control visual de "Solo personal autorizado"', 'opcion', 7, true),
    (v_tipo, v_cat, 'Se identifica control de acceso, que impida que sea utilizada, donde se establezca bloqueo con candado u otro dispositivo, que impida el acceso del personal no autorizado', 'opcion', 8, true),
    (v_tipo, v_cat, '¿El personal que realiza el ascenso cuenta con certificación vigente para la labor de alturas?', 'opcion', 9, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Escalera Vertical Portátil Sencilla y de Extensión', 'verde', 2, 'Tipo de Escalera', 'ESCALERA VERTICAL PORTÁTIL SENCILLA Y DE EXTENSIÓN') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '¿Los rieles o largueros de la escalera presentan grietas en soportes, mal soldados o corrosión por óxido?', 'opcion', 1, true),
    (v_tipo, v_cat, '¿El sitio de postura está nivelado, sólido y estable?', 'opcion', 2, true),
    (v_tipo, v_cat, '¿La escalera está libre de pintura, grasa y suciedad?', 'opcion', 3, true),
    (v_tipo, v_cat, '¿Los peldaños de la escalera están rotos o defectuosos o mal soldados?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿Las zapatas se encuentran en buen estado y son apropiadas para el tipo de terreno?', 'opcion', 5, true),
    (v_tipo, v_cat, 'Las escaleras de extensión deben sobrepasar al menos 1 metro el punto de apoyo superior. ¿Se evidencia esta condición?', 'opcion', 6, true),
    (v_tipo, v_cat, '¿Cuándo la escalera sobrepasa los 3 metros de altura, se implementa sistema de sujeción de la misma (asegurarla o ventearla) y además se establece línea de vida vertical portátil, con arnés u otros dispositivos?', 'opcion', 7, true),
    (v_tipo, v_cat, 'Los sujetadores se identifican, que no tengan algún tipo de desecho o suciedad y se verifica si se enganchan con facilidad en los peldaños; también se debe verificar que las aletas de los sujetadores no estén reventadas', 'opcion', 8, true),
    (v_tipo, v_cat, 'Verifique que la cuerda esté asegurada a la sección voladiza de la escalera, que no esté rota, desecha, gastada o deshilada, y se debe verificar que se deslice fácilmente por la polea', 'opcion', 9, true),
    (v_tipo, v_cat, 'El lugar donde se guarda la escalera es un lugar donde no se obstruye el paso o pueda ser dañada', 'opcion', 10, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Escalera de Tijera', 'ambar', 3, 'Tipo de Escalera', 'ESCALERA DE TIJERA') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Las bisagras cierran y abren con facilidad, que no esté golpeada, pegados o sueltos; luego ábrala nuevamente y valide que la escalera queda firme', 'opcion', 1, true),
    (v_tipo, v_cat, 'Las cuatro zapatas de la escalera están completas, sin desgaste o faltantes', 'opcion', 2, true),
    (v_tipo, v_cat, 'Los rieles y peldaños están libres de grietas, desgaste, rajados, doblados, uniones ajustadas, libres de cualquier derrame, goteo, aceite o desecho', 'opcion', 3, true),
    (v_tipo, v_cat, '¿La superficie de posicionamiento es sólida, estable?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿Los peldaños están libres de grietas, deflexión, corrosión por óxido, agujeros, despuntes?', 'opcion', 5, true),
    (v_tipo, v_cat, '¿La escalera presenta defectos estructurales? (listones sueltos, grietas, corrosión u otros)', 'opcion', 6, true),
    (v_tipo, v_cat, 'Si la escalera cuenta con una bandeja de trabajo, ¿esta se encuentra quebrada, reventada o floja?', 'opcion', 7, true),
    (v_tipo, v_cat, '¿El último peldaño de la escalera se encuentra quebrado o desajustado?', 'opcion', 8, true),
    (v_tipo, v_cat, '¿El personal que realiza el ascenso cuenta con certificación vigente para la labor de alturas?', 'opcion', 9, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Escalera de Plataforma o Tipo Avión', 'violeta', 4, 'Tipo de Escalera', 'ESCALERA DE PLATAFORMA O TIPO AVIÓN') returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, '¿Todas las partes y componentes están libres de grietas, corrosión, deflexión, agujeros?', 'opcion', 1, true),
    (v_tipo, v_cat, '¿La escalera posee frenos de seguridad?', 'opcion', 2, true),
    (v_tipo, v_cat, '¿Los frenos de la escalera se encuentran en buen estado?', 'opcion', 3, true),
    (v_tipo, v_cat, '¿Las barandas de la plataforma de trabajo tienen como mínimo un metro de alto x 60 centímetros de ancho?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿La plataforma de trabajo tiene rodapiés de mínimo 9 centímetros de alto?', 'opcion', 5, true),
    (v_tipo, v_cat, '¿Los peldaños tienen una superficie antideslizante?', 'opcion', 6, true),
    (v_tipo, v_cat, '¿La huella del peldaño es de 30 cm y la contrahuella (alto) es de 40 cm?', 'opcion', 7, true),
    (v_tipo, v_cat, 'Las llantas se encuentran con algunos signos de desgaste, con disminución del diámetro, con presencia de objetos enterrados', 'opcion', 8, true),
    (v_tipo, v_cat, '¿Las llantas se deslizan y se desplazan con facilidad y se identifican que son estables?', 'opcion', 9, true);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'En caso de ser necesario, especifique el motivo del retiro del equipo de acceso u observaciones respectivas', 'texto', 901, false),
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 902, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 903, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 904, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 905, false);
end $$;

-- === andamios ===
do $$
declare
  v_tipo uuid;
  v_cat uuid;
begin
  select id into v_tipo from tipos_inspeccion where codigo = 'andamios';

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values
    (v_tipo, null, 'Actividad a realizar', 'texto', null, 1, true);

  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, 'Planeación de la Labor', 'teal', 1, null, null) returning id into v_cat;
  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, v_cat, 'Antes de iniciar el montaje del andamio, se verifica que la base de apoyo es lo suficientemente estable, firme y resistente', 'opcion', 1, true),
    (v_tipo, v_cat, '¿El área de seguridad se encuentra adecuadamente aislada y señalizada?', 'opcion', 2, true),
    (v_tipo, v_cat, '¿Se cuenta con personal competente para realizar el armado y levantamiento del andamio?', 'opcion', 3, true),
    (v_tipo, v_cat, '¿Fue diseñado de forma adecuada el sistema de protección contra caídas para garantizar un acceso seguro?', 'opcion', 4, true),
    (v_tipo, v_cat, '¿Los andamios certificados con altura superior a siete (7) m son levantados bajo la supervisión de una persona calificada?', 'opcion', 5, true),
    (v_tipo, v_cat, '¿En zona vehicular se colocan conos o vallas a los 10 m y 15 m en ambos sentidos de la vía en cada costado del andamio?', 'opcion', 6, true),
    (v_tipo, v_cat, '¿Los componentes del andamio fueron inspeccionados para verificar las recomendaciones del fabricante y sus partes en buen estado?', 'opcion', 7, true),
    (v_tipo, v_cat, '¿El andamio es asegurado a la estructura cuando este ha superado los cuatro metros de altura?', 'opcion', 8, true),
    (v_tipo, v_cat, '¿Todos los lados abiertos y extremos de las plataformas de trabajo poseen barandas y rodapiés?', 'opcion', 9, true),
    (v_tipo, v_cat, 'Una vez colocados los montantes de la sección inicial, ¿se procede al arriostramiento del tramo ejecutado, colocando por ambos lados travesaños laterales tipo "cruz" o "crucetas" o por el arriostramiento adecuado?', 'opcion', 10, true),
    (v_tipo, v_cat, '¿El andamio se encuentra vertical, nivelado, escuadra y rígido?', 'opcion', 11, true),
    (v_tipo, v_cat, '¿El andamio cuenta con un documento que indique las condiciones de fabricación y diseño, carga total, restricciones, etc.?', 'opcion', 12, true),
    (v_tipo, v_cat, '¿Las condiciones estructurales del andamio son las adecuadas de acuerdo a las recomendaciones del fabricante?', 'opcion', 13, true),
    (v_tipo, v_cat, '¿Fue evaluada por una persona competente para verificar que la estructura que se usa para soportar el andamio es capaz de soportar la carga que se le va a aplicar?', 'opcion', 14, true),
    (v_tipo, v_cat, '¿El sistema de acceso cumple con los criterios mínimos de auto estabilidad y auto soportabilidad, acorde con los requisitos establecidos por el fabricante o en las normas nacionales y/o internacionales?', 'opcion', 15, true),
    (v_tipo, v_cat, '¿Las plataformas prefabricadas están aseguradas por ganchos u otro medio equivalente en ambos extremos?', 'opcion', 16, true),
    (v_tipo, v_cat, '¿Las condiciones ambientales son propias para desarrollar los trabajos?', 'opcion', 17, true),
    (v_tipo, v_cat, 'Si el andamio es modificado, ¿cuenta con las certificaciones correspondientes dadas por personal técnico competente?', 'opcion', 18, true),
    (v_tipo, v_cat, '¿Cuándo se utilizan elementos para levantar materiales se realiza cuando el andamio está reforzado o asegurado con una estructura permanente para impedir que se vuelque?', 'opcion', 19, true),
    (v_tipo, v_cat, '¿Se tomaron todas las precauciones necesarias para el desarrollo de trabajos eléctricos: materiales aislantes, plataformas no conductoras, equipos de protección contra caídas dieléctricos, herramientas dieléctricas, etc.?', 'opcion', 20, true),
    (v_tipo, v_cat, '¿Las líneas de vida del sistema de protección contra caídas se encuentran en puntos de anclaje certificados? ¿Esta cumple los requerimientos y exigencias para trabajo en alturas?', 'opcion', 21, true),
    (v_tipo, v_cat, '¿Las líneas de vida se encuentran suspendidas libremente sin contacto con miembros estructurales o la fachada del edificio, o por el contrario están protegidas para evitar fricción?', 'opcion', 22, true),
    (v_tipo, v_cat, '¿Se cuenta con el procedimiento y equipos adecuados al plan de rescate establecido y evaluado de acuerdo a los escenarios de riesgo?', 'opcion', 23, true);

  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values
    (v_tipo, null, 'En caso de ser necesario, especifique el motivo del retiro del equipo de acceso u observaciones respectivas', 'texto', 901, false),
    (v_tipo, null, 'A1.- FORTALEZAS', 'texto', 902, false),
    (v_tipo, null, 'A2.- HALLAZGOS (Compromisos)', 'texto', 903, false),
    (v_tipo, null, 'A3.- URGENTE Y/O REITERATIVO', 'booleano', 904, false),
    (v_tipo, null, 'A4.- RESPONSABLE DE LA INSPECCION', 'texto', 905, false);
end $$;
