// Genera el SQL de seed (categorias_pregunta + preguntas) a partir del
// catálogo extraído de los 10 Excel (docs/catalogo_preguntas.md).
// Uso: node generar_seed_preguntas.mjs > ../supabase/migrations/0007_seed_preguntas.sql
//
// Emite un bloque DO $$ ... $$ por módulo, con variables para evitar repetir
// subconsultas (el SQL resultante es mucho más compacto que un INSERT por fila).
//
// Simplificaciones de alcance MVP (documentadas, no accidentales):
// - No se modelan los bloques repetidos de "2do extintor" / "2do botiquín".
// - No se modelan los campos de % de cumplimiento calculado del módulo vehículos.
// - Los campos de encabezado propios de un módulo (más allá de empresa/sede/
//   lugar/fecha, que ya son columnas fijas de `inspecciones`) se guardan como
//   preguntas con categoria_id = null, tipo_campo 'select'/'texto'/'fecha'.
// - Categorías condicionales (Escalera por tipo, Vehículos por tipo) usan
//   condicion_campo/condicion_valor contra el texto exacto de la pregunta de
//   encabezado que las activa.

import { modulos, CIERRE_ESTANDAR } from './datos_seed.mjs'

const COLORES = ['azul', 'verde', 'ambar', 'violeta', 'teal']

function esc(s) {
  return s.replace(/'/g, "''")
}

let out = ''
let ci = 0

for (const modulo of modulos) {
  out += `\n-- === ${modulo.codigo} ===\n`
  out += `do $$\ndeclare\n  v_tipo uuid;\n  v_cat uuid;\nbegin\n`
  out += `  select id into v_tipo from tipos_inspeccion where codigo = '${modulo.codigo}';\n\n`

  let ordenPregunta = 0
  const encabezado = modulo.encabezado ?? []
  if (encabezado.length) {
    const filas = encabezado.map((campo) => {
      ordenPregunta += 1
      const opciones = campo.opciones ? `'${esc(JSON.stringify(campo.opciones))}'::jsonb` : 'null'
      return `    (v_tipo, null, '${esc(campo.texto)}', '${campo.tipo_campo}', ${opciones}, ${ordenPregunta}, true)`
    })
    out += `  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, opciones, orden, obligatoria) values\n${filas.join(',\n')};\n\n`
  }

  let ordenCategoria = 0
  for (const cat of modulo.categorias) {
    ordenCategoria += 1
    const color = COLORES[ci % COLORES.length]
    ci += 1
    const condCampo = cat.condicion ? `'${esc(cat.condicion.campo)}'` : 'null'
    const condValor = cat.condicion ? `'${esc(cat.condicion.valor)}'` : 'null'
    out += `  insert into categorias_pregunta (tipo_inspeccion_id, nombre, color, orden, condicion_campo, condicion_valor) values (v_tipo, '${esc(cat.nombre)}', '${color}', ${ordenCategoria}, ${condCampo}, ${condValor}) returning id into v_cat;\n`

    const filas = []
    let ordenP = 0
    for (const texto of cat.preguntas) {
      ordenP += 1
      filas.push(`    (v_tipo, v_cat, '${esc(texto)}', 'opcion', ${ordenP}, true)`)
    }
    if (cat.observaciones) {
      ordenP += 1
      filas.push(`    (v_tipo, v_cat, 'Observaciones', 'texto', ${ordenP}, false)`)
    }
    out += `  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values\n${filas.join(',\n')};\n\n`
  }

  const cierre = modulo.cierre ?? []
  if (cierre.length) {
    const filas = cierre.map((campo, i) => `    (v_tipo, null, '${esc(campo.texto)}', '${campo.tipo_campo}', ${900 + i + 1}, false)`)
    out += `  insert into preguntas (tipo_inspeccion_id, categoria_id, texto, tipo_campo, orden, obligatoria) values\n${filas.join(',\n')};\n`
  }

  out += `end $$;\n`
}

process.stdout.write(out)
