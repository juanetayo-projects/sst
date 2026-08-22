function descargar(blob: Blob, archivo: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = archivo
  a.click()
  URL.revokeObjectURL(url)
}

let logoDataUrlCache: string | null | undefined

/** Logo institucional como data URL — se cachea tras la primera exportación. */
async function obtenerLogoDataUrl(): Promise<string | null> {
  if (logoDataUrlCache !== undefined) return logoDataUrlCache
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}images/logo_cacsb2.png`)
    const blob = await res.blob()
    logoDataUrlCache = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('No se pudo leer el logo'))
      reader.readAsDataURL(blob)
    })
  } catch {
    logoDataUrlCache = null
  }
  return logoDataUrlCache
}

export async function exportarExcel(opts: {
  nombreArchivo: string
  titulo: string
  subtitulo?: string
  columnas: { header: string; key: string; width?: number }[]
  filas: Record<string, unknown>[]
}) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Datos')
  ws.columns = opts.columnas.map((c) => ({ key: c.key, width: c.width ?? 18 }))

  const logo = await obtenerLogoDataUrl()
  if (logo) {
    const base64 = logo.split(',')[1]
    const imgId = wb.addImage({ base64, extension: 'png' })
    ws.addImage(imgId, { tl: { col: 0, row: 0 }, ext: { width: 120, height: 40 } })
  }
  ws.addRow([])
  ws.addRow([])
  ws.addRow([])
  const filaTitulo = ws.addRow([opts.titulo])
  filaTitulo.font = { bold: true, size: 14, color: { argb: 'FF0D2D6B' } }
  if (opts.subtitulo) {
    const filaSub = ws.addRow([opts.subtitulo])
    filaSub.font = { italic: true, size: 9, color: { argb: 'FF64748B' } }
  }
  ws.addRow([])

  const filaHeader = ws.addRow(opts.columnas.map((c) => c.header))
  filaHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D2D6B' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
  })
  opts.filas.forEach((f) => ws.addRow(opts.columnas.map((c) => f[c.key])))

  const buf = await wb.xlsx.writeBuffer()
  descargar(new Blob([buf]), `${opts.nombreArchivo}.xlsx`)
}

async function iniciarPdfMake() {
  const pdfMake = (await import('pdfmake/build/pdfmake')).default
  const pdfFonts = await import('pdfmake/build/vfs_fonts')
  const fuentes = pdfFonts as unknown as { pdfMake?: { vfs: unknown }; vfs?: unknown }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfMake as any).vfs = fuentes.pdfMake?.vfs ?? fuentes.vfs
  return pdfMake
}

export async function exportarListaPDF(opts: {
  nombreArchivo: string
  titulo: string
  subtitulo?: string
  columnas: string[]
  filas: (string | number)[][]
}) {
  const pdfMake = await iniciarPdfMake()
  const logo = await obtenerLogoDataUrl()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = []
  if (logo) content.push({ image: logo, width: 100, margin: [0, 0, 0, 8] })
  content.push({ text: opts.titulo, style: 'h' })
  if (opts.subtitulo) content.push({ text: opts.subtitulo, style: 'sub' })
  content.push({
    table: {
      headerRows: 1,
      body: [opts.columnas.map((h) => ({ text: h, color: 'white', bold: true })), ...opts.filas],
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#0D2D6B' : rowIndex % 2 ? '#F1F5F9' : null),
    },
    margin: [0, 10, 0, 0],
  })

  pdfMake
    .createPdf({
      pageOrientation: 'landscape',
      content,
      styles: {
        h: { fontSize: 14, bold: true, color: '#0D2D6B' },
        sub: { fontSize: 9, italics: true, color: '#64748B', margin: [0, 2, 0, 0] },
      },
      defaultStyle: { fontSize: 8 },
    })
    .download(`${opts.nombreArchivo}.pdf`)
}

export type DistribucionRespuestaPDF = { valor: string; cantidad: number; pct: number }
export type SeccionPDF = { titulo: string; color: string; filas: [string, string][]; termometro?: DistribucionRespuestaPDF[] }

const COLOR_HEX_VALOR: Record<string, string> = {
  Cumple: '#0F9D58',
  Sí: '#0F9D58',
  'No Cumple': '#D93025',
  No: '#D93025',
  'No Aplica': '#64748B',
}
const PALETA_HEX_RESPALDO = ['#16468E', '#F4B400', '#4B7BC8']

function colorHexPara(valor: string, indice: number): string {
  return COLOR_HEX_VALOR[valor] ?? PALETA_HEX_RESPALDO[indice % PALETA_HEX_RESPALDO.length]
}

const ALTURA_TUBO_TERMOMETRO = 32

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function construirTermometroPDF(termometro: DistribucionRespuestaPDF[]): any {
  const total = termometro.reduce((a, d) => a + d.cantidad, 0)
  return {
    columns: [
      ...termometro.map((d, i) => {
        const color = colorHexPara(d.valor, i)
        const alturaFill = Math.max(d.pct > 0 ? 4 : 0, Math.round((d.pct / 100) * ALTURA_TUBO_TERMOMETRO))
        return {
          width: 62,
          stack: [
            { text: `${d.pct}%`, alignment: 'center', fontSize: 8, bold: true, color },
            {
              canvas: [
                { type: 'rect', x: 24, y: 0, w: 8, h: ALTURA_TUBO_TERMOMETRO, color: '#E2E8F0', r: 4 },
                { type: 'rect', x: 24, y: ALTURA_TUBO_TERMOMETRO - alturaFill, w: 8, h: alturaFill, color, r: 4 },
                { type: 'ellipse', x: 28, y: ALTURA_TUBO_TERMOMETRO + 6, r1: 5, r2: 5, color },
              ],
              margin: [0, 2, 0, 12],
            },
            { text: String(d.cantidad), alignment: 'center', fontSize: 8, bold: true },
            { text: d.valor, alignment: 'center', fontSize: 6.5, color: '#64748B' },
          ],
        }
      }),
      {
        width: '*',
        text: `${total} respuesta${total === 1 ? '' : 's'}`,
        fontSize: 7,
        italics: true,
        color: '#64748B',
        alignment: 'right',
        margin: [0, ALTURA_TUBO_TERMOMETRO / 2 - 4, 0, 0],
      },
    ],
    margin: [0, 2, 0, 6],
  }
}

/** Reporte detallado de una inspección: encabezado + bloques de categoría con colores institucionales. */
export async function exportarInspeccionPDF(datos: {
  titulo: string
  encabezado: [string, string][]
  secciones: SeccionPDF[]
  cierre: [string, string][]
}) {
  const pdfMake = await iniciarPdfMake()
  const logo = await obtenerLogoDataUrl()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = []
  if (logo) content.push({ image: logo, width: 90, margin: [0, 0, 0, 8] })
  content.push({ text: datos.titulo, style: 'h' })

  content.push({
    columns: datos.encabezado.map(([label, valor]) => ({
      stack: [
        { text: label, style: 'etiqueta' },
        { text: valor || '—', style: 'valor' },
      ],
    })),
    margin: [0, 0, 0, 12],
  })

  for (const sec of datos.secciones) {
    content.push({ text: sec.titulo, style: 'seccion', color: sec.color, margin: [0, 10, 0, 4] })
    if (sec.termometro && sec.termometro.length > 0) content.push(construirTermometroPDF(sec.termometro))
    content.push({
      table: {
        widths: ['*', 80],
        body: sec.filas.map(([texto, valor]) => [
          { text: texto, fontSize: 8 },
          { text: valor || '—', fontSize: 8, bold: true, alignment: 'center' },
        ]),
      },
      layout: { fillColor: (i: number) => (i % 2 ? '#F8FAFC' : null), hLineColor: '#E2E8F0', vLineColor: '#E2E8F0' },
    })
  }

  if (datos.cierre.some(([, v]) => v)) {
    content.push({ text: 'Cierre de la inspección', style: 'seccion', color: '#0D2D6B', margin: [0, 10, 0, 4] })
    content.push({
      stack: datos.cierre
        .filter(([, v]) => v)
        .map(([label, valor]) => ({
          stack: [
            { text: label, style: 'etiqueta' },
            { text: valor, style: 'valor', margin: [0, 0, 0, 6] },
          ],
        })),
    })
  }

  pdfMake
    .createPdf({
      content,
      styles: {
        h: { fontSize: 14, bold: true, color: '#0D2D6B', margin: [0, 0, 0, 10] },
        seccion: { fontSize: 10, bold: true },
        etiqueta: { fontSize: 7, color: '#64748B' },
        valor: { fontSize: 9 },
      },
      defaultStyle: { fontSize: 8 },
    })
    .download(`${datos.titulo}.pdf`)
}

async function cargarPlantilla(archivo: string) {
  const ExcelJS = (await import('exceljs')).default
  const res = await fetch(`${import.meta.env.BASE_URL}plantillas/${archivo}`)
  if (!res.ok) throw new Error(`No se encontró la plantilla "${archivo}".`)
  const buffer = await res.arrayBuffer()
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer)
  return wb
}

export type ItemSolicitudCompra = {
  tipo_elemento: string
  cantidad: number
  unidad_medida: string | null
  observacion: string | null
  empresa: string | null
  sede: string | null
}

/**
 * Exporta ítems de solicitudes de compra a la plantilla institucional oficial
 * (`RED-GCS-F-005 — Solicitud interna suministros y recursos físicos`), agrupando
 * elementos repetidos (mismo nombre + unidad de medida) sumando la cantidad.
 * Los campos de clasificación administrativa que la app no conoce (cargo, tiempo
 * de gestión, tipo de suministro, categoría) se dejan en blanco para que Compras
 * los complete según su criterio.
 *
 * La plantilla trae 5 filas de ítems ya diseñadas (con celdas combinadas); insertar
 * filas nuevas con ExcelJS corrompe esas combinaciones en este archivo específico
 * (error "Cannot merge already merged cells" al reabrirlo), así que si hay más de
 * 5 grupos, los que sobran se listan en la columna de Especificaciones de la última
 * fila en vez de crear filas nuevas. Devuelve cuántos grupos quedaron así, para que
 * quien llama pueda avisarlo.
 */
export async function exportarPlantillaCompras(opts: { items: ItemSolicitudCompra[]; solicitante: string }): Promise<{ desbordados: number }> {
  const wb = await cargarPlantilla('plantilla-compras.xlsx')
  const ws = wb.getWorksheet('RED-GCS-F-005')
  if (!ws) throw new Error('La plantilla de compras no tiene la hoja esperada.')

  const grupos = new Map<string, { descripcion: string; unidad: string; cantidad: number; observaciones: Set<string>; empresasSedes: Set<string> }>()
  for (const item of opts.items) {
    const unidad = (item.unidad_medida ?? '').trim()
    const clave = `${item.tipo_elemento.trim().toLowerCase()}|${unidad.toLowerCase()}`
    const actual = grupos.get(clave) ?? { descripcion: item.tipo_elemento.trim(), unidad, cantidad: 0, observaciones: new Set<string>(), empresasSedes: new Set<string>() }
    actual.cantidad += Number(item.cantidad) || 0
    if (item.observacion?.trim()) actual.observaciones.add(item.observacion.trim())
    const es = [item.empresa, item.sede].filter(Boolean).join(' - ')
    if (es) actual.empresasSedes.add(es)
    grupos.set(clave, actual)
  }
  const filas = Array.from(grupos.values())

  ws.getCell('G10').value = opts.solicitante.toUpperCase()
  ws.getCell('G12').value = null
  ws.getCell('B15').value = null
  ws.getCell('E15').value = null
  ws.getCell('G15').value = new Date()
  ws.getCell('B18').value = 'RED-Gestión SST'
  ws.getCell('E18').value = 'SST'
  ws.getCell('G18').value = null
  ws.getCell('I18').value = null

  const filaBase = 22
  const filasPlantilla = 5
  const visibles = filas.slice(0, filasPlantilla)
  const desbordadas = filas.slice(filasPlantilla)

  visibles.forEach((f, i) => {
    const fila = filaBase + i
    ws.getCell(`B${fila}`).value = i + 1
    ws.getCell(`D${fila}`).value = f.descripcion
    ws.getCell(`I${fila}`).value = f.unidad || null
    ws.getCell(`J${fila}`).value = f.cantidad
    let especificaciones = Array.from(f.observaciones).join(' · ')
    if (f.empresasSedes.size > 0) especificaciones = [especificaciones, `(${Array.from(f.empresasSedes).join('; ')})`].filter(Boolean).join(' ')
    if (desbordadas.length > 0 && i === visibles.length - 1) {
      const extra = desbordadas.map((d) => `${d.descripcion}: ${d.cantidad}${d.unidad ? ` ${d.unidad}` : ''}`).join(' · ')
      especificaciones = [especificaciones, `+ ${desbordadas.length} ítem(s) adicional(es) — ${extra}`].filter(Boolean).join(' | ')
    }
    ws.getCell(`G${fila}`).value = especificaciones || null
  })

  ws.getCell('B30').value =
    'Solicitud generada automáticamente desde el módulo de Inspecciones SST — reposición de elementos registrados en rondas de inspección.'

  const buffer = await wb.xlsx.writeBuffer()
  descargar(new Blob([buffer]), `solicitud_compras_sst_${new Date().toISOString().slice(0, 10)}.xlsx`)
  return { desbordados: desbordadas.length }
}

export type ItemCompromisoActa = {
  descripcion: string
  responsable: string | null
  fecha_compromiso: string
}

export type AsistenteActa = { nombre: string; empresaCargo: string; contacto: string }
export type TemaTratadoActa = { tema: string; tiempo: string }

/**
 * Exporta compromisos de rondas SST a la plantilla institucional de Acta de Reunión
 * (`FT-SST-005`), llenando la tabla de COMPROMISOS, los datos generales básicos
 * (fecha, tema, responsable), y los asistentes / temas tratados / observaciones que
 * indique quien exporta. La plantilla trae 9 filas de asistentes y 10 de temas tratados
 * ya diseñadas (con celdas combinadas por fila); igual que en la plantilla de compras,
 * insertar filas nuevas en esas dos tablas corrompe el archivo, así que si sobran
 * asistentes o temas se listan como texto adicional en la última fila disponible.
 */
export async function exportarPlantillaCompromisos(opts: {
  items: ItemCompromisoActa[]
  responsableActa: string
  asistentes: AsistenteActa[]
  temasTratados: TemaTratadoActa[]
  observaciones: string
}) {
  const wb = await cargarPlantilla('compromisos.xlsx')
  const ws = wb.getWorksheet('Acta de Reunion')
  if (!ws) throw new Error('La plantilla de compromisos no tiene la hoja esperada.')

  ws.getCell('C7').value = new Date()
  ws.getCell('E7').value = null
  ws.getCell('C8').value = null
  ws.getCell('E8').value = null
  ws.getCell('C9').value = 'Seguimiento de compromisos de rondas SST'
  ws.getCell('C10').value = opts.responsableActa

  const asistentesFilaBase = 14
  const asistentesFilasPlantilla = 9
  const asistentesVisibles = opts.asistentes.slice(0, asistentesFilasPlantilla)
  const asistentesDesbordados = opts.asistentes.slice(asistentesFilasPlantilla)
  for (let i = 0; i < asistentesFilasPlantilla; i++) {
    const fila = asistentesFilaBase + i
    const a = asistentesVisibles[i]
    ws.getCell(`B${fila}`).value = a?.nombre || null
    ws.getCell(`D${fila}`).value = a?.contacto || null
    let empresaCargo = a?.empresaCargo || null
    if (asistentesDesbordados.length > 0 && i === asistentesFilasPlantilla - 1) {
      const extra = asistentesDesbordados.map((d) => `${d.nombre}${d.empresaCargo ? ` (${d.empresaCargo})` : ''}`).join('; ')
      empresaCargo = [empresaCargo, `+ ${asistentesDesbordados.length} adicional(es): ${extra}`].filter(Boolean).join(' | ')
    }
    ws.getCell(`C${fila}`).value = empresaCargo
  }

  const temasFilaBase = 25
  const temasFilasPlantilla = 10
  const temasVisibles = opts.temasTratados.slice(0, temasFilasPlantilla)
  const temasDesbordados = opts.temasTratados.slice(temasFilasPlantilla)
  for (let i = 0; i < temasFilasPlantilla; i++) {
    const fila = temasFilaBase + i
    const t = temasVisibles[i]
    let tema = t?.tema || null
    if (temasDesbordados.length > 0 && i === temasFilasPlantilla - 1) {
      const extra = temasDesbordados.map((d) => d.tema).join('; ')
      tema = [tema, `+ ${temasDesbordados.length} tema(s) adicional(es): ${extra}`].filter(Boolean).join(' | ')
    }
    ws.getCell(`B${fila}`).value = tema
    ws.getCell(`F${fila}`).value = t?.tiempo || null
  }

  ws.getCell('B36').value = opts.observaciones.trim() || null

  const filaBase = 43
  const filasPlantilla = 4
  const extra = Math.max(opts.items.length - filasPlantilla, 0)
  if (extra > 0) {
    ws.duplicateRow(filaBase + filasPlantilla - 1, extra, true)
    // La celda C de las filas nuevas queda con el valor de ejemplo duplicado (la combinación B:C
    // de esta plantilla no se puede recrear con ExcelJS sin corromper el archivo) — se limpia para
    // que no se vea texto viejo junto a la columna B con el compromiso real.
    for (let i = 1; i <= extra; i++) {
      ws.getCell(`C${filaBase + filasPlantilla - 1 + i}`).value = null
    }
  }
  opts.items.forEach((item, i) => {
    const fila = filaBase + i
    ws.getCell(`B${fila}`).value = item.descripcion
    ws.getCell(`D${fila}`).value = new Date(`${item.fecha_compromiso}T00:00:00`)
    ws.getCell(`E${fila}`).value = item.responsable ?? ''
  })
  for (let i = opts.items.length; i < filasPlantilla; i++) {
    const fila = filaBase + i
    ws.getCell(`B${fila}`).value = null
    ws.getCell(`D${fila}`).value = null
    ws.getCell(`E${fila}`).value = null
  }

  const buffer = await wb.xlsx.writeBuffer()
  descargar(new Blob([buffer]), `acta_compromisos_sst_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
