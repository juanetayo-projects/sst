function descargar(blob: Blob, archivo: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = archivo
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportarExcel(
  nombre: string,
  columnas: { header: string; key: string; width?: number }[],
  filas: Record<string, unknown>[]
) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Datos')
  ws.columns = columnas.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18 }))

  ws.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D2D6B' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
  })
  filas.forEach((f) => ws.addRow(f))

  const buf = await wb.xlsx.writeBuffer()
  descargar(new Blob([buf]), `${nombre}.xlsx`)
}

export async function exportarListaPDF(titulo: string, headers: string[], filas: (string | number)[][]) {
  const pdfMake = (await import('pdfmake/build/pdfmake')).default
  const pdfFonts = await import('pdfmake/build/vfs_fonts')
  const fuentes = pdfFonts as unknown as { pdfMake?: { vfs: unknown }; vfs?: unknown }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfMake as any).vfs = fuentes.pdfMake?.vfs ?? fuentes.vfs

  pdfMake
    .createPdf({
      pageOrientation: 'landscape',
      content: [
        { text: titulo, style: 'h' },
        {
          table: { headerRows: 1, body: [headers.map((h) => ({ text: h, color: 'white', bold: true })), ...filas] },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#0D2D6B' : rowIndex % 2 ? '#F1F5F9' : null),
          },
        },
      ],
      styles: { h: { fontSize: 14, bold: true, color: '#0D2D6B', margin: [0, 0, 0, 8] } },
      defaultStyle: { fontSize: 8 },
    })
    .download(`${titulo}.pdf`)
}

export type SeccionPDF = { titulo: string; color: string; filas: [string, string][] }

/** Reporte detallado de una inspección: encabezado + bloques de categoría con colores institucionales. */
export async function exportarInspeccionPDF(datos: {
  titulo: string
  encabezado: [string, string][]
  secciones: SeccionPDF[]
  cierre: [string, string][]
}) {
  const pdfMake = (await import('pdfmake/build/pdfmake')).default
  const pdfFonts = await import('pdfmake/build/vfs_fonts')
  const fuentes = pdfFonts as unknown as { pdfMake?: { vfs: unknown }; vfs?: unknown }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfMake as any).vfs = fuentes.pdfMake?.vfs ?? fuentes.vfs

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = [{ text: datos.titulo, style: 'h' }]

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
