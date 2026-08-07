export const CIERRE_ESTANDAR = [
  { texto: 'A1.- FORTALEZAS', tipo_campo: 'texto' },
  { texto: 'A2.- HALLAZGOS (Compromisos)', tipo_campo: 'texto' },
  { texto: 'A3.- URGENTE Y/O REITERATIVO', tipo_campo: 'booleano' },
  { texto: 'A4.- RESPONSABLE DE LA INSPECCION', tipo_campo: 'texto' },
]

export const modulos = [
  {
    codigo: 'emergencias',
    encabezado: [
      {
        texto: 'Tipo de equipo inspeccionado',
        tipo_campo: 'select',
        opciones: ['Gabinete de red contraincendios', 'Botiquín de primeros auxilios', 'Camilla', 'Lámparas de emergencia', 'Señalización'],
      },
    ],
    categorias: [
      {
        nombre: 'Gabinete de Red Contraincendios',
        preguntas: ['Señalizacion', 'Cerradura', 'Vidrio', 'Pintura', 'Limpieza', 'Puerta', 'Soporte Manguera', 'Manguera', 'Valvula', 'Llave Spanner', 'Boquilla'],
        observaciones: true,
      },
      {
        nombre: 'G8.- Señalización de Emergencias y Seguridad',
        preguntas: ['8.01.- Están ubicadas en lugares visibles', '8.02.- Existen avisos y señales en las áreas requeridas', '8.03.- Se encuentran en buen estado'],
      },
      {
        nombre: 'G2.- Botiquín de Primeros Auxilios',
        preguntas: [
          '2.01.- Guantes quirúrgicos (3 pares)', '2.02.- Tapabocas (3 unidades)', '2.03.- Copitos de algodón (1 paquete)',
          '2.04.- Curas (10 curas)', '2.05.- Esparadrapo o Micropore (1 unidad c/u)', '2.06.- Gasa (8 paquetes)',
          '2.07.- Yodopavinona Espuma (1 unidad)', '2.08.- Isodine solución (1 unidad)', '2.09.- Bajalenguas (1 paquete x 10)',
          '2.10.- Vendas elásticas (4 unidades)', '2.11.- Tijeras (1 unidad)', '2.12.- Termómetro (1 unidad)',
          '2.13.- Linterna (1 unidad)', '2.14.- Pito (1 unidad)', '2.15.- Solución salina 100 ml', '2.16.- Alcohol',
          '2.17.- Algodón', '2.18.- Jabón antibacterial', '2.19.- Parche esteril para ojos (3 unidades)',
          '2.20.- Jeringa 10 ml (2 unidades)', '2.21.- Maletín- Maleta- Estuche guarda elementos',
        ],
        observaciones: true,
      },
      {
        nombre: 'G3.- Camilla',
        preguntas: ['3.01.- Instalación', '3.02.- Señalización', '3.03.- Estado de la tabla', '3.04.- Correas de seguridad', '3.05.- Sujetadores para cargue', '3.06.- Cuello ortopédico'],
        observaciones: true,
      },
      {
        nombre: 'Lámparas de Emergencia',
        preguntas: ['La lampara se encuentra limpia', 'La lampara cuenta con sus partes integras', 'La lampara al momento de testear enciende'],
        observaciones: true,
      },
    ],
    cierre: CIERRE_ESTANDAR,
  },
  {
    codigo: 'extintores',
    encabezado: [
      { texto: 'Tipo de Extintor', tipo_campo: 'texto' },
      { texto: 'Capacidad del extintor', tipo_campo: 'texto' },
      { texto: 'Código del Extintor', tipo_campo: 'texto' },
    ],
    categorias: [
      {
        nombre: 'G1.- Extintores',
        preguntas: [
          '1.01.- La base del extintor está al menos 10 cm de la altura sobre nivel del suelo', '1.02.- Estado de pintura',
          '1.03.- Se encuentran libres de golpes', '1.04.- Cuenta con autoadhesivo Fecha / Tipo', '1.05.- Estado de la manijas de transporte',
          '1.06.- Estado de la manijas de disparo/accionamiento', '1.07.- Presión', '1.08.- Manómetros se encuentra cargados',
          '1.09.- Boquillas se encuentra en buen estado', '1.10.- Mangueras se encuentra en buen estado',
          '1.11.- Se encuentran con Ring o aro de seguridad', '1.12.- Corneta', '1.13.- Se encuentra señalizados',
          '1.14.- Cuentan con los respectivos soportes (colgar/piso)', '1.15.- Fecha de vencimiento',
        ],
        observaciones: true,
      },
    ],
    cierre: CIERRE_ESTANDAR,
  },
  {
    codigo: 'orden_aseo',
    encabezado: [],
    categorias: [
      {
        nombre: 'G4.- Baños',
        preguntas: [
          '4.01.- Se encuentran visualmente aseados', '4.02.- Se perciben con aroma a limpieza',
          '4.03.- Hay dotación de papel higiénico y dispensador de jabón', '4.04.- Cuenta con caneca para la disposición de residuos solidos',
          '4.05.- Estructura en buen estado (piso, techo, paredes)', '4.06.- Los artefactos sanitarios se encuentran en buen estado',
          '4.07.- Cuenta con Ventilacion e iluminacion natural o artificial',
        ],
      },
      {
        nombre: 'G5.- Cocina',
        preguntas: [
          '5.01.- Los utensilios de cocina permanecen limpios', '5.02.- Los mesones permanecen libres de residuos de alimentos',
          '5.03.- Estructura en buen estado (piso, techo, paredes)', '5.04.- Cuenta con Ventilacion e iluminacion natural o artificial',
        ],
      },
      {
        nombre: 'G6.- Salas de Espera',
        preguntas: [
          '6.01.- Las sillas están limpias y en buen estado',
          '6.02.- La barra (recepción) esta ordenada, limpia y libre de objetos innecesarios',
          '6.03.- Cuenta con caneca para la disposición de residuos solidos',
        ],
      },
      {
        nombre: 'G7.- Pisos y Pasillos',
        preguntas: [
          '7.01.- Las áreas de circulación común se encuentran demarcadas claramente y libres de obstáculos y objetos innecesarios',
          '7.02.- Los pisos están limpios, secos, sin desperdicios', '7.03.- Los pasillos y entradas a las oficinas están libres de obstrucción',
        ],
      },
      {
        nombre: 'G8.- Señalización de Emergencias y Seguridad',
        preguntas: ['8.01.- Están ubicadas en lugares visibles', '8.02.- Existen avisos y señales en las áreas requeridas', '8.03.- Se encuentran en buen estado'],
      },
      {
        nombre: 'G9.- Áreas/Oficinas',
        preguntas: [
          '9.01.- Las ventanas y paredes se encuentran en buen estado, están limpias y libres de objetos innecesarios y en buen estado',
          '9.02.- Los techos están libres de goteras y los cielorrasos razonablemente limpios',
          '9.03.- Las puertas de salida están libres de obstáculos', '9.04.- Se encuentra señalada la ruta de evacuación',
          '9.05.- Sobre los escritorios solamente se encuentran los elementos requeridos para trabajar (cosedoras, perforadoras, sacaganchos, cuaderno para notas…etc)',
          '9.06.- Los documentos son archivados oportunamente en el lugar correspondiente',
          '9.07.- El papel reciclado se encuentra almacenado en el lugar destinado para ello',
          '9.08.- El área se encuentra limpia y libre de obstáculos',
          '9.09.- Los drenajes y alcantarillas se encuentran protegidos y en buen estado',
        ],
      },
      {
        nombre: 'G10.- Instalaciones Eléctricas',
        preguntas: [
          '10.01.- Toma electricos, interruptores en buen estado', '10.02.- Canaletas, estabilizadores o UPS en buen estado',
          '10.03.- Extensiones completas o con uniones aisladas y en buen estado', '10.04.- Luminarias y Estructuras en buen estado',
          '10.05.- Caja y Breakers en buen estado',
        ],
        observaciones: true,
      },
    ],
    cierre: CIERRE_ESTANDAR,
  },
  {
    codigo: 'sustancias_quimicas',
    encabezado: [],
    categorias: [
      {
        nombre: 'Etiquetado y Marcado',
        preguntas: ['Se encuentran debidamente rotulados', 'Rótulos en buen estado', 'Los frascos de productos químicos cuentan con las etiquetas adecuadas para facilitar su identificación'],
      },
      {
        nombre: 'Hojas de Seguridad',
        preguntas: [
          'Se cuenta en el área con las hojas de seguridad correspondientes', 'Hojas de seguridad en buen estado',
          'Hojas de seguridad corresponden a la información presentada en el rótulo del producto',
          'Hojas de seguridad son fácilmente identificables y de fácil acceso', 'Se encuentran en el idioma adecuado al personal que lo consulta',
          'Existe copia de las hojas de seguridad de los productos',
        ],
      },
      {
        nombre: 'Almacenamiento',
        preguntas: [
          'Se encuentran las sustancias en recipientes adecuados', 'Se encuentran los recipientes limpios', 'Se encuentran los recipientes bien cerrados',
          'El piso del almacén donde se almacena es Impermeable', 'Existe almacenamiento de material combustible y/o inflamable cerca de fuentes generadoras de calor',
          'El almacén tiene buena ventilación que evite la acumulación de vapores tóxicos o inflamables',
          'Se encuentran organizados los productos químicos de acuerdo con su incompatibilidad',
          'El almacén cuenta con material absorbente para manejo de derrames', 'Existe salida de emergencia en el almacén',
        ],
      },
      {
        nombre: 'Eliminación',
        preguntas: ['Se realiza la dosificación adecuada a los productos', 'Se hace la reutilización de la sustancia y/o producto', 'Se hace eliminación adecuada de las sustancias y/o producto'],
      },
      {
        nombre: 'Entrenamiento',
        preguntas: ['Se le informa al personal los riesgos a los que está expuesto por el manejo de sustancias químicas', 'Se encuentran los registros relacionados de divulgaciones'],
        observaciones: true,
      },
    ],
    cierre: [
      { texto: 'FORTALEZAS', tipo_campo: 'texto' },
      { texto: 'HALLAZGOS (Compromisos)', tipo_campo: 'texto' },
      { texto: 'URGENTE Y/O REITERATIVO', tipo_campo: 'booleano' },
      { texto: 'NOMBRE COLABORADOR QUE SUPERVISA', tipo_campo: 'texto' },
      { texto: 'NOMBRE COLABORADOR(ES) SUPERVISADO(S)', tipo_campo: 'texto' },
    ],
  },
  {
    codigo: 'epp',
    encabezado: [],
    categorias: [
      {
        nombre: 'G15.- Elementos de Protección Personal',
        preguntas: [
          '15.01.- Gorro quirúrgico', '15.02.- Bata desechable / Bata no desechable / Delantal antifluido', '15.03.- Monogafas de seguridad',
          '15.04.- Careta de seguridad', '15.05.- Tapabocas quirúrgico / Respirador N95', '15.06.- Guantes protección moto, casco y chaleco',
          '15.07.- Overol anti fluido', '15.08.- Polainas', '15.09.- Uniforme', '15.10.- Zapatos cerrados',
        ],
        observaciones: true,
      },
      {
        nombre: 'G16.- Higiene de Manos',
        preguntas: [
          '16.01.- Realiza los cinco momentos de lavado de manos', '16.02.- Realiza el lavado de manos y aplica los 12 pasos de lavado de manos',
          '16.03.- Realiza desinfección de manos según lo estipulado en la organización',
        ],
        observaciones: true,
      },
    ],
    cierre: [...CIERRE_ESTANDAR, { texto: 'A5.- NOMBRE COLABORADOR(ES) SUPERVISADO(S)', tipo_campo: 'texto' }],
  },
  {
    codigo: 'vehiculos_preoperacional',
    encabezado: [
      { texto: '¿Estás en condiciones de salud y descanso para usar el vehículo (sin malestar, mareos, fiebre, sueño u otros síntomas)?', tipo_campo: 'booleano' },
      { texto: 'Número de Cédula', tipo_campo: 'texto' },
      { texto: 'Nombre del Conductor', tipo_campo: 'texto' },
      { texto: 'Vehículo a conducir', tipo_campo: 'select', opciones: ['Automóvil', 'Motocicleta', 'Ambulancia'] },
      { texto: 'Placa / Marca / Modelo', tipo_campo: 'texto' },
      { texto: 'Fecha de vencimiento del SOAT', tipo_campo: 'fecha' },
      { texto: 'Fecha de vencimiento de Revisión Tecnomecánica', tipo_campo: 'fecha' },
      { texto: 'Fecha de próxima recarga extintor', tipo_campo: 'fecha' },
      { texto: 'Fecha de revisión Botiquín', tipo_campo: 'fecha' },
    ],
    categorias: [
      {
        nombre: 'Automóvil',
        condicion: { campo: 'Vehículo a conducir', valor: 'Automóvil' },
        preguntas: [
          'Adecuados niveles de fluidos (aceite de motor y direccion hidraulica liquido de frenos, refrigerante)',
          'Nivel Liquido de frenos y/o embrague (nivel max)', 'Nivel de refrigerante de motor (nivel maximo)', 'Nivel de aceite Dirección Hidráulica',
          'Cuenta con agua deposito limpia parabrisas', 'Revisión visual de fugas de fluidos (aceites, refrigerantes, agua, liquido frenos, etc.)',
          'Estado general de las llantas: Desgaste y presión de inflado (incluir llanta repuesto)',
          'Verificar estado general de cabina, puertas y carrocería (golpes, rayones, espejos retrovisores, limpieza general, gato, cruceta)',
          'Verificar funcionamiento luces en general (direccionales, stop, pito, plumillas, luces de advertencia, etc.)',
          'Verificar funcionamiento de indicadores tablero de instrumentos', 'Verificar ruidos anormales de algún componente del vehiculo',
          'Verificar el estado de cinturones de seguridad', 'Verificar el estado de vidrios, parabrisas y laterales',
          'Verificar el estado del motor limpio, libre de derrames de grasa, combustible, cables descubiertos o sueltos',
          'Verificar Kit de carretera', 'Verificación de KIT de Herramientas (llaves, destornilladores, alicate, etc.)',
          'Verificar llanta de repuesto', 'Verificar estado Baterías: ajuste de bornes y sulfatación',
        ],
      },
      {
        nombre: 'Motocicleta',
        condicion: { campo: 'Vehículo a conducir', valor: 'Motocicleta' },
        preguntas: [
          'Fugas y niveles de fluidos: revisar los niveles de los fluidos de la motocicleta (lubricante, combustible, refrigerante, líquidos de frenos)',
          'Espejos: revisar que los espejos no estén opacos y permitan una buena visualización; verificar que los espejos permiten graduarlos',
          'Bocina: hacer sonar la bocina para verificar su correcto funcionamiento',
          'Adecuado funcionamiento de luces de freno, direccionales, luces altas y bajas',
          'Direccionales: verificar que las luces enciendan correctamente y que se hagan los cambios; verificar que los acrílicos no tengan fracturas',
          'Luces altas, bajas: verificar que todas las luces enciendan y que se hagan los cambios; verificar que los acrílicos no tengan fracturas',
          'Llantas: verificar que las llantas tengan la presión recomendada por el fabricante; verificar que el labrado tenga profundidad correspondiente',
          'Estado general de las llantas: Desgaste y presión de inflado', 'Estado Baterías: ajuste de bornes y sulfatación',
          'Estado del KIT de arrastre y tensión de la cadena', 'Verificar estado general (golpes, rayones, espejos retrovisores, limpieza)',
          'Verificación de KIT de lluvia y Elementos de protección personal EPP (casco, chaleco, guantes, traje para lluvia, gafas, etc.)',
          'Verificación de KIT de Herramientas (llave bujía, destornilladores, alicate, etc.)', 'Verificar ruidos anormales de algún componente del vehículo',
          'Cuenta con el chaleco reflectivo después de las 6 pm',
        ],
      },
      {
        nombre: 'Ambulancia - Revisión mecánica (antes de iniciar el motor)',
        condicion: { campo: 'Vehículo a conducir', valor: 'Ambulancia' },
        preguntas: [
          'Nivel de aceite del motor', 'Aceite dirección hidráulica', 'Nivel de agua de batería', 'Nivel agua de radiador',
          'Nivel líquido de frenos', 'Nivel líquido de parabrisas', 'Luces de emergencia',
          'Luces externas (altas, stop, direccionales, estacionarias y plataforma)', 'Luces internas', 'Presión inflado de llantas',
          'Tensión correas de ventilador', 'Aire acondicionado', 'Llanta de repuesto',
          'Asientos compartimiento paciente y cinturones de seguridad tipo anclaje', 'Retrovisores',
          'Estado puertas de la cabina: bloqueo, ejes, material', 'Señalización "No fume", "Use cinturón de seguridad"',
        ],
      },
      {
        nombre: 'Ambulancia - Revisión mecánica (con motor encendido)',
        condicion: { campo: 'Vehículo a conducir', valor: 'Ambulancia' },
        preguntas: [
          'Observe operación de instrumentos', 'Sistema de limpia brisas (plumillas)', 'Pruebe la Sirena', 'Encienda las luces de emergencia',
          'Encienda las luces internas', 'Sistemas radio comunicación', 'Sistema de frenos', 'Aire acondicionado', 'Equipo de perifoneo',
          'Verificar Funcionamiento del indicador (aguja) de ACPM / Gasolina', 'Verificar funcionamiento del indicador (aguja) de presión de aceite', 'Pito',
        ],
      },
      {
        nombre: 'Revisión de Herramientas',
        condicion: { campo: 'Vehículo a conducir', valor: 'Ambulancia' },
        preguntas: [
          'Extintor para fuegos ABC de 2.26 Kg compartimiento del conductor', 'Alicate', 'Destornilladores: Pala/estría', 'Llave expansión',
          'Llaves fijas', 'Rueda de repuesto', 'Señales reflectivas de emergencia',
          'Linterna con pilas, la cual puede ser utilizada como lámpara desmontable', 'Caja de fusibles surtidos de los usados por vehículo',
          'Gato y equipo para sustitución de ruedas', 'Palanca patecabra', 'Tacos de madera para bloqueo de llantas',
          'Cuerda estática de 20m, diámetro mínimo 12.5 y sus ganchos para tracción', 'Juego de cables de iniciación eléctrica para la batería',
        ],
      },
      {
        nombre: 'Identificación Exterior',
        condicion: { campo: 'Vehículo a conducir', valor: 'Ambulancia' },
        preguntas: [
          'Leyenda AMBULANCIA en mayúscula, fija, reflectiva, a los costados, puerta posterior y techo',
          'Número de identificación reflectivo, en costados, frente y parte posterior', 'Cruz de vida', 'Sigla ámbito de servicio: TAM/TAB',
          'Nombre logotipo de la entidad', 'Leyenda CONSERVE SU DISTANCIA, en material reflectivo',
          'Número de Teléfono, en la parte baja del vehículo y en la parte posterior', 'Nombre la ciudad sede',
        ],
      },
    ],
    cierre: [
      { texto: 'Reporte de novedades: indique en qué parte se evidencia deterioro, daños o fallas', tipo_campo: 'texto' },
      { texto: 'Kilometraje de Inicio', tipo_campo: 'texto' },
      { texto: 'Kilometraje al final', tipo_campo: 'texto' },
      { texto: 'Porta los documentos del conductor y vehículo vigente: licencia de tránsito, SOAT, revisión técnico-mecánica, licencia de conducción y cédula de ciudadanía', tipo_campo: 'booleano' },
    ],
  },
  {
    codigo: 'alturas_verificacion',
    encabezado: [
      { texto: 'Tipos de trabajos en alturas a realizar', tipo_campo: 'texto' },
      { texto: 'Altura aproximada a la cual se va a desarrollar la actividad (mts)', tipo_campo: 'texto' },
    ],
    categorias: [
      {
        nombre: 'Planeación de la Labor',
        preguntas: [
          'Se cuenta con procedimiento especifico y claro para la labor a desarrollar',
          'Se dispone de los equipos y elementos necesarios para trabajar en alturas',
          'Personal cuenta con la certificado como persona autorizada para desarrollar trabajos en altura',
          '¿Se cuenta con formato de permiso de trabajo en alturas con sus respectivas firmas de autorización ajustado a los requerimientos mínimos de la resolución 4272 del 2021 en su art 15?',
          '¿Se evidencia registro de inspeccion pre-operacional de los sistemas de acceso?',
          '¿Se evidencia registro de inspeccion pre-uso de los sistemas de proteccion para trabajos en alturas?',
          '¿Se evidencia análisis de peligros por actividad donde se hayan identificado los peligros y evaluado todos los riesgos asociados a la tarea realizada en alturas y se toman acciones para el control de los mismos?',
          '¿Se evidencia registro de reporte de condiciones de salud por parte de los colaboradores y manifiesta estar en buenas condiciones de salud antes de iniciar la labor?',
          '¿Se evidencia registrado nombre y firma de la persona responsable de activar el plan de emergencias en el permiso de trabajo en alturas?',
          'El empleador o contratista asigna ayudante de seguridad para labor a ejecutar',
          '¿Se cuenta con coordinador de trabajo en alturas de la empresa o contratista?',
          '¿Se realiza control de energías peligrosas (bloqueo y etiquetado) para la tarea a realizar en alturas, para el caso de líneas energizadas cercanas o equipos en movimiento (si aplica)?',
          'Los sistemas de acceso utilizados son certificados y compatibles entre sí, en tamaño, figura, materiales, forma, diámetro, cumpliendo con los criterios mínimos de auto estabilidad y auto soportabilidad',
        ],
      },
      {
        nombre: 'Área de Trabajo',
        preguntas: [
          'El área de ejecución de la labor se encuentra limpia, ordenada y es óptima para la ejecución de la tarea',
          '¿Se manejan controles de acceso de personal para la tarea a realizar?',
          'Se señalizó y delimitó el área de trabajo, teniendo en cuenta la trayectoria de caída de objetos',
          '¿Se demarcan, señalizan y/o cubren orificios (huecos o aberturas) que se encuentran en la superficie donde se trabaja o camina?',
          'Los colaboradores disponen de elementos necesarios que permitan portar, transportar y asegurar herramientas, materiales, equipos y objetos que puedan caer desde alturas',
        ],
      },
      {
        nombre: 'EPP y Verificación de Sistema de Protección contra Caídas',
        preguntas: [
          '¿El personal usa casco con barbuquejo, mínimo tres puntos de apoyo según peligros identificados?',
          '¿El personal usa guantes de seguridad según peligros identificados?', '¿El personal usa botas de seguridad según peligros identificados?',
          '¿El personal usa gafas de seguridad según peligros identificados?', '¿El personal usa protección auditiva según peligros identificados?',
          '¿El personal se encuentra entrenado y capacitado en el uso de los EPP utilizados en la labor?',
          '¿Los equipos de protección contra caídas se seleccionan y se usan según las necesidades determinadas para el trabajador, las condiciones, tipo de tarea y los sistemas de acceso a utilizar?',
        ],
      },
      {
        nombre: 'Verificación de Puntos de Anclaje y Conectores',
        preguntas: [
          'Si el trabajo requiere el uso de una línea de vida o dispositivo fijo, está debidamente certificada',
          'Existen puntos de anclajes seguros (certificados, estructurales, autorizados)',
          'Se tienen adaptadores de anclaje certificados y en buen estado',
        ],
      },
      {
        nombre: 'Plan de Rescate',
        preguntas: ['Se conoce el plan de respuesta a emergencia del área', 'Se cuenta con un plan de rescate planificado en caso de emergencia'],
      },
    ],
    cierre: [
      { texto: 'Nombre y Apellido Responsable de trabajo', tipo_campo: 'texto' },
      { texto: 'Nombre y apellido de la persona que autoriza el trabajo', tipo_campo: 'texto' },
      ...CIERRE_ESTANDAR,
    ],
  },
  {
    codigo: 'alturas_preoperacional',
    encabezado: [
      { texto: 'Tipo de inspección', tipo_campo: 'select', opciones: ['Pre inicio de la actividad (se realiza por única vez antes de iniciar labores)', 'Diaria'] },
      { texto: 'Ejecutor de la actividad', tipo_campo: 'select', opciones: ['Equipo interno', 'Contratista'] },
      { texto: 'Marca', tipo_campo: 'texto' },
      { texto: 'Modelo', tipo_campo: 'texto' },
      { texto: 'Lote/Serial', tipo_campo: 'texto' },
      { texto: 'Fecha de fabricación', tipo_campo: 'fecha' },
    ],
    categorias: [
      {
        nombre: 'Arnés',
        preguntas: [
          'Etiqueta - Completa', 'Etiqueta - Legible', 'Cintas/Correas - Se evidencian hoyos o agujeros en las correas',
          'Cintas/Correas - Las correas evidencian desgaste o están deshilachadas', 'Cintas/Correas - Hay presencia de torsión en las correas',
          'Cintas/Correas - El arnés presenta suciedad o deterioro excesivo', 'Cintas/Correas - Se evidencian quemaduras, contaminación por químicos, etc.',
          'Cintas/Correas - Las correas tienen salpicaduras de pintura u otra sustancia', 'Cintas/Correas - Están en buen estado los testigos de impacto de las correas',
          'Costuras - Presentan roturas o quemaduras', 'Costuras - Están reventadas o presentan desgaste excesivo',
          'Anillos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo',
          'Hebillas - El arnés tiene completas y en buen estado las hebillas', 'Hebillas - El arnés presenta deformación en las hebillas',
          'Hebillas - Se evidencian fisuras, golpes, hundimientos, etc.',
        ],
      },
      {
        nombre: 'Eslinga de Posicionamiento',
        preguntas: [
          'Etiqueta - Completa', 'Etiqueta - Legible', 'Ganchos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo',
          'Ganchos - Cuentan con doble seguro de apertura', 'Ganchos - Se evidencian fallas que impidan la apertura de los ganchos',
          'Ganchos - Se evidencian fisuras, golpes, hundimientos, etc.', 'Ganchos - La eslinga tiene sus ojetes deformados y/o rotos',
          'Costuras - Presentan roturas o quemaduras', 'Costuras - Están reventadas o presentan desgaste excesivo',
          'Costuras - Están en buen estado los testigos de impacto de la correa', 'Cintas/Correas - Tiene hoyos o agujeros en sus correas',
          'Cintas/Correas - Evidencian desgaste o están deshilachadas', 'Cintas/Correas - Hay presencia de torsión en las correas',
          'Cintas/Correas - Se evidencia salpicadura de pintura y rigidez de las correas', 'Cintas/Correas - Presentan suciedad o deterioro excesivo',
          'Cintas/Correas - Se evidencian quemaduras por soldadura, chispas, etc.',
        ],
      },
      {
        nombre: 'Tie Off',
        preguntas: [
          'Etiqueta - Completa', 'Etiqueta - Legible', 'Cintas/Correas - La riata presenta desgaste o estiramiento excesivo',
          'Cintas/Correas - Fibras externas, cortadas, desgastadas o desgarradas', 'Cintas/Correas - Se evidencia salpicadura de pintura y rigidez de las correas',
          'Cintas/Correas - Se evidencian quemaduras por soldadura, chispas, etc.', 'Anillos - El Tie Off tiene completas y en buen estado los anillos',
          'Anillos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo', 'Anillos - Se evidencian fisuras, golpes, hundimientos, etc.',
        ],
      },
      {
        nombre: 'Eslinga en Y con Absorbedor de Choque',
        preguntas: [
          'Etiqueta - Completa', 'Etiqueta - Legible', 'Ganchos - Se encuentran libres de corrosión, moho, deformaciones y/o desgaste excesivo',
          'Ganchos - Cuentan con doble seguro de apertura', 'Ganchos - Se evidencian fallas que impidan la apertura de los ganchos',
          'Ganchos - Se evidencian fisuras, golpes, hundimientos, etc.', 'Ganchos - La eslinga tiene sus ojetes deformados y/o rotos',
          'Costuras - Presentan roturas o quemaduras', 'Costuras - Están reventadas o presentan desgaste excesivo',
          'Costuras - Están en buen estado los testigos de impacto de la correa', 'Cintas/Correas - Tiene hoyos o agujeros en sus correas',
          'Cintas/Correas - Se evidencian desgaste o están deshilachadas', 'Cintas/Correas - Hay presencia de torsión en las correas',
          'Cintas/Correas - Se evidencia salpicadura de pintura y rigidez de las correas', 'Cintas/Correas - Presentan suciedad o deterioro excesivo',
          'Cintas/Correas - Se evidencian quemaduras por soldadura, chispas, etc.',
        ],
      },
      {
        nombre: 'Casco',
        preguntas: [
          'Presenta rayones, marcaciones profundas, fisuras, golpes, hundimientos, etc.',
          'Se encuentra posicionada y en buen estado la araña de absorción de impactos',
          'Barbuquejo de tres puntos de agarre, posicionado y en buen estado', 'Sistema de aseguramiento en buen estado (clic)',
          'Banda de sudoración en buen estado', 'Puntos de sujeción en buen estado',
        ],
      },
      {
        nombre: 'Mosquetón',
        preguntas: [
          'Se identifica corrosión, moho, decoloración o alteraciones de las propiedades externas', 'Deformaciones, golpes o dobladuras',
          'Presenta fallas en el cierre y apertura; revise gatillo, espiga, seguro, eje', 'Se identifica zanjas o desgaste excesivo en sus ángulos',
        ],
      },
      {
        nombre: 'Línea de Vida',
        preguntas: [
          'Etiqueta - Completa', 'Etiqueta - Legible', 'Cuerda - Estiramiento excesivo, deformación de la cuerda',
          'Cuerda - Quemaduras o fibras derretidas', 'Cuerda - Ojetes deformados y/o rotos',
          'Cuerda - Cortes, roturas, deshilachamiento del tejido o trenzado de la cuerda',
          'Partes Metálicas - Se evidencian fallas que impidan la apertura del gancho',
          'Partes Metálicas - El gancho cuenta con doble seguro de apertura, funcional',
          'Partes Metálicas - Las ganchos tienen presencia de corrosión u óxido', 'Partes Metálicas - Se evidencian fisuras, golpes, hundimientos, etc.',
        ],
      },
      {
        nombre: 'Freno para Cuerda',
        preguntas: [
          'Diámetro del arrestador, compatible con la cuerda', 'Correcto aseguramiento del tornillo de bloqueo',
          'Posicionada y en buen estado guía fija y rodillo inferior', 'Bisagra en buen estado, cierre y apertura',
          'Las guías o uñas de sujeción presentan desgaste excesivo o dientes partidos', 'Doble Seguro de apertura funcional',
        ],
      },
      {
        nombre: 'Línea de Vida Horizontal',
        preguntas: [
          'Etiqueta - Completa', 'Etiqueta - Legible', 'Cuerda - Estiramiento excesivo, deformación de la cuerda',
          'Reata - Tiene hoyos o agujeros en sus correas', 'Cuerda - Ojetes deformados y/o rotos',
          'Cuerda - Cortes, roturas, deshilachamiento del tejido o trenzado de la cuerda',
          'Partes Metálicas - Se evidencian fallas que impidan la apertura del gancho',
          'Partes Metálicas - El gancho cuenta con doble seguro de apertura, funcional',
          'Partes Metálicas - Las ganchos tienen presencia de corrosión u óxido', 'Partes Metálicas - Se evidencian fisuras, golpes, hundimientos, etc.',
          'Reata - Las correas evidencian desgaste o están deshilachadas', 'Reata - Hay presencia de torsión en las correas',
          'Reata - Se evidencia salpicadura de pintura y rigidez de las correas', 'Reata - Presentan suciedad o deterioro excesivo',
          'Reata - Se evidencian quemaduras por soldadura, chispas, etc.',
        ],
      },
    ],
    cierre: [
      { texto: 'Adjunte las fotos donde se evidencien las etiquetas de los equipos inspeccionados', tipo_campo: 'texto' },
      ...CIERRE_ESTANDAR,
    ],
  },
  {
    codigo: 'escalera',
    encabezado: [
      { texto: 'Actividad a realizar', tipo_campo: 'texto' },
      {
        texto: 'Tipo de Escalera',
        tipo_campo: 'select',
        opciones: ['ESCALERA VERTICAL FIJA (TIPO GATO)', 'ESCALERA VERTICAL PORTÁTIL SENCILLA Y DE EXTENSIÓN', 'ESCALERA DE TIJERA', 'ESCALERA DE PLATAFORMA O TIPO AVIÓN'],
      },
    ],
    categorias: [
      {
        nombre: 'Escalera Vertical Fija (Tipo Gato)',
        condicion: { campo: 'Tipo de Escalera', valor: 'ESCALERA VERTICAL FIJA (TIPO GATO)' },
        preguntas: [
          'El ancho mínimo de la escalera fija es de 40 cm y la distancia máxima entre peldaños es de 30 cm',
          '¿Se encuentra sólidamente anclada a las edificaciones?', '¿Se identifica que en el entorno puede existir probabilidad de riesgo eléctrico?',
          '¿Para alturas mayores de 4,5 metros, se cuenta con líneas de vida vertical fija, con freno mecánico o retráctiles?',
          '¿Para realizar el ascenso y descenso se implementa el uso del arnés? Y para aquellas con alturas inferiores a 4,5 metros, ¿se implementa eslinga en Y o doble?',
          '¿La escalera presenta defectos estructurales? (peldaños rotos, listones sueltos, grietas, corrosión u otros)',
          'Se identifica de forma visible un control visual de "Solo personal autorizado"',
          'Se identifica control de acceso, que impida que sea utilizada, donde se establezca bloqueo con candado u otro dispositivo, que impida el acceso del personal no autorizado',
          '¿El personal que realiza el ascenso cuenta con certificación vigente para la labor de alturas?',
        ],
      },
      {
        nombre: 'Escalera Vertical Portátil Sencilla y de Extensión',
        condicion: { campo: 'Tipo de Escalera', valor: 'ESCALERA VERTICAL PORTÁTIL SENCILLA Y DE EXTENSIÓN' },
        preguntas: [
          '¿Los rieles o largueros de la escalera presentan grietas en soportes, mal soldados o corrosión por óxido?',
          '¿El sitio de postura está nivelado, sólido y estable?', '¿La escalera está libre de pintura, grasa y suciedad?',
          '¿Los peldaños de la escalera están rotos o defectuosos o mal soldados?', '¿Las zapatas se encuentran en buen estado y son apropiadas para el tipo de terreno?',
          'Las escaleras de extensión deben sobrepasar al menos 1 metro el punto de apoyo superior. ¿Se evidencia esta condición?',
          '¿Cuándo la escalera sobrepasa los 3 metros de altura, se implementa sistema de sujeción de la misma (asegurarla o ventearla) y además se establece línea de vida vertical portátil, con arnés u otros dispositivos?',
          'Los sujetadores se identifican, que no tengan algún tipo de desecho o suciedad y se verifica si se enganchan con facilidad en los peldaños; también se debe verificar que las aletas de los sujetadores no estén reventadas',
          'Verifique que la cuerda esté asegurada a la sección voladiza de la escalera, que no esté rota, desecha, gastada o deshilada, y se debe verificar que se deslice fácilmente por la polea',
          'El lugar donde se guarda la escalera es un lugar donde no se obstruye el paso o pueda ser dañada',
        ],
      },
      {
        nombre: 'Escalera de Tijera',
        condicion: { campo: 'Tipo de Escalera', valor: 'ESCALERA DE TIJERA' },
        preguntas: [
          'Las bisagras cierran y abren con facilidad, que no esté golpeada, pegados o sueltos; luego ábrala nuevamente y valide que la escalera queda firme',
          'Las cuatro zapatas de la escalera están completas, sin desgaste o faltantes',
          'Los rieles y peldaños están libres de grietas, desgaste, rajados, doblados, uniones ajustadas, libres de cualquier derrame, goteo, aceite o desecho',
          '¿La superficie de posicionamiento es sólida, estable?', '¿Los peldaños están libres de grietas, deflexión, corrosión por óxido, agujeros, despuntes?',
          '¿La escalera presenta defectos estructurales? (listones sueltos, grietas, corrosión u otros)',
          'Si la escalera cuenta con una bandeja de trabajo, ¿esta se encuentra quebrada, reventada o floja?',
          '¿El último peldaño de la escalera se encuentra quebrado o desajustado?',
          '¿El personal que realiza el ascenso cuenta con certificación vigente para la labor de alturas?',
        ],
      },
      {
        nombre: 'Escalera de Plataforma o Tipo Avión',
        condicion: { campo: 'Tipo de Escalera', valor: 'ESCALERA DE PLATAFORMA O TIPO AVIÓN' },
        preguntas: [
          '¿Todas las partes y componentes están libres de grietas, corrosión, deflexión, agujeros?', '¿La escalera posee frenos de seguridad?',
          '¿Los frenos de la escalera se encuentran en buen estado?', '¿Las barandas de la plataforma de trabajo tienen como mínimo un metro de alto x 60 centímetros de ancho?',
          '¿La plataforma de trabajo tiene rodapiés de mínimo 9 centímetros de alto?', '¿Los peldaños tienen una superficie antideslizante?',
          '¿La huella del peldaño es de 30 cm y la contrahuella (alto) es de 40 cm?',
          'Las llantas se encuentran con algunos signos de desgaste, con disminución del diámetro, con presencia de objetos enterrados',
          '¿Las llantas se deslizan y se desplazan con facilidad y se identifican que son estables?',
        ],
      },
    ],
    cierre: [
      { texto: 'En caso de ser necesario, especifique el motivo del retiro del equipo de acceso u observaciones respectivas', tipo_campo: 'texto' },
      ...CIERRE_ESTANDAR,
    ],
  },
  {
    codigo: 'andamios',
    encabezado: [{ texto: 'Actividad a realizar', tipo_campo: 'texto' }],
    categorias: [
      {
        nombre: 'Planeación de la Labor',
        preguntas: [
          'Antes de iniciar el montaje del andamio, se verifica que la base de apoyo es lo suficientemente estable, firme y resistente',
          '¿El área de seguridad se encuentra adecuadamente aislada y señalizada?',
          '¿Se cuenta con personal competente para realizar el armado y levantamiento del andamio?',
          '¿Fue diseñado de forma adecuada el sistema de protección contra caídas para garantizar un acceso seguro?',
          '¿Los andamios certificados con altura superior a siete (7) m son levantados bajo la supervisión de una persona calificada?',
          '¿En zona vehicular se colocan conos o vallas a los 10 m y 15 m en ambos sentidos de la vía en cada costado del andamio?',
          '¿Los componentes del andamio fueron inspeccionados para verificar las recomendaciones del fabricante y sus partes en buen estado?',
          '¿El andamio es asegurado a la estructura cuando este ha superado los cuatro metros de altura?',
          '¿Todos los lados abiertos y extremos de las plataformas de trabajo poseen barandas y rodapiés?',
          'Una vez colocados los montantes de la sección inicial, ¿se procede al arriostramiento del tramo ejecutado, colocando por ambos lados travesaños laterales tipo "cruz" o "crucetas" o por el arriostramiento adecuado?',
          '¿El andamio se encuentra vertical, nivelado, escuadra y rígido?',
          '¿El andamio cuenta con un documento que indique las condiciones de fabricación y diseño, carga total, restricciones, etc.?',
          '¿Las condiciones estructurales del andamio son las adecuadas de acuerdo a las recomendaciones del fabricante?',
          '¿Fue evaluada por una persona competente para verificar que la estructura que se usa para soportar el andamio es capaz de soportar la carga que se le va a aplicar?',
          '¿El sistema de acceso cumple con los criterios mínimos de auto estabilidad y auto soportabilidad, acorde con los requisitos establecidos por el fabricante o en las normas nacionales y/o internacionales?',
          '¿Las plataformas prefabricadas están aseguradas por ganchos u otro medio equivalente en ambos extremos?',
          '¿Las condiciones ambientales son propias para desarrollar los trabajos?',
          'Si el andamio es modificado, ¿cuenta con las certificaciones correspondientes dadas por personal técnico competente?',
          '¿Cuándo se utilizan elementos para levantar materiales se realiza cuando el andamio está reforzado o asegurado con una estructura permanente para impedir que se vuelque?',
          '¿Se tomaron todas las precauciones necesarias para el desarrollo de trabajos eléctricos: materiales aislantes, plataformas no conductoras, equipos de protección contra caídas dieléctricos, herramientas dieléctricas, etc.?',
          '¿Las líneas de vida del sistema de protección contra caídas se encuentran en puntos de anclaje certificados? ¿Esta cumple los requerimientos y exigencias para trabajo en alturas?',
          '¿Las líneas de vida se encuentran suspendidas libremente sin contacto con miembros estructurales o la fachada del edificio, o por el contrario están protegidas para evitar fricción?',
          '¿Se cuenta con el procedimiento y equipos adecuados al plan de rescate establecido y evaluado de acuerdo a los escenarios de riesgo?',
        ],
      },
    ],
    cierre: [
      { texto: 'En caso de ser necesario, especifique el motivo del retiro del equipo de acceso u observaciones respectivas', tipo_campo: 'texto' },
      ...CIERRE_ESTANDAR,
    ],
  },
]
