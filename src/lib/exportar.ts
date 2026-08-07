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

export type SeccionPDF = { titulo: string; color: string; filas: [string, string][] }

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
