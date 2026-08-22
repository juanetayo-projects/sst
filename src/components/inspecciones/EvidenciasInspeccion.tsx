import { useEffect, useRef, useState } from 'react'
import { Paperclip, FileText, Trash2, ExternalLink, Expand } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const BUCKET = 'evidencias'
const EXTENSIONES_IMAGEN = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

function nombreArchivo(ruta: string) {
  const partes = ruta.split('/')
  const conTimestamp = partes[partes.length - 1] ?? ruta
  return conTimestamp.replace(/^\d+-/, '')
}

function extension(ruta: string) {
  return (nombreArchivo(ruta).split('.').pop() ?? '').toLowerCase()
}

function esImagen(ruta: string) {
  return EXTENSIONES_IMAGEN.includes(extension(ruta))
}

function esPDF(ruta: string) {
  return extension(ruta) === 'pdf'
}

/**
 * Evidencias adjuntas a una inspección (fotos, PDFs, etc.) — sube al bucket privado `evidencias`
 * bajo `evidencias/{inspeccionId}/...` y guarda solo la ruta (no la URL, porque el bucket es privado
 * y las URLs firmadas expiran); la vista/descarga genera la URL firmada al momento del clic.
 */
export function EvidenciasInspeccion({
  inspeccionId,
  urls,
  onChange,
  soloLectura = false,
}: {
  inspeccionId: string
  urls: string[]
  onChange: (urls: string[]) => void
  soloLectura?: boolean
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firmadas, setFirmadas] = useState<Record<string, string>>({})
  const [vistaGrande, setVistaGrande] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const faltantes = urls.filter((u) => !(u in firmadas))
    if (faltantes.length === 0) return
    Promise.all(
      faltantes.map(async (ruta) => {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 3600)
        return [ruta, data?.signedUrl ?? null] as const
      })
    ).then((pares) => {
      setFirmadas((prev) => {
        const copia = { ...prev }
        for (const [ruta, url] of pares) if (url) copia[ruta] = url
        return copia
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls])

  async function subirArchivos(archivos: FileList | null) {
    if (!archivos || archivos.length === 0 || subiendo) return
    setSubiendo(true)
    setError(null)
    const nuevasRutas: string[] = []
    for (const archivo of Array.from(archivos)) {
      const nombreSeguro = archivo.name.replace(/[^\w.-]+/g, '_')
      const ruta = `${inspeccionId}/${Date.now()}-${nombreSeguro}`
      const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo)
      if (errorSubida) {
        setError(`No se pudo subir "${archivo.name}": ${errorSubida.message}`)
        continue
      }
      nuevasRutas.push(ruta)
    }
    if (nuevasRutas.length > 0) onChange([...urls, ...nuevasRutas])
    setSubiendo(false)
  }

  async function eliminarArchivo(ruta: string, e: React.MouseEvent) {
    e.stopPropagation()
    await supabase.storage.from(BUCKET).remove([ruta])
    onChange(urls.filter((u) => u !== ruta))
  }

  const rutaGrande = vistaGrande
  const urlGrande = rutaGrande ? firmadas[rutaGrande] : null

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((ruta) => {
            const url = firmadas[ruta]
            const imagen = esImagen(ruta)
            return (
              <button
                type="button"
                key={ruta}
                onClick={() => url && setVistaGrande(ruta)}
                title={nombreArchivo(ruta)}
                className="group relative flex size-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-accent/40 text-muted-foreground transition-shadow hover:shadow-md disabled:cursor-wait"
                disabled={!url}
              >
                {imagen && url ? (
                  <img src={url} alt={nombreArchivo(ruta)} className="size-full object-cover" />
                ) : (
                  <>
                    <FileText className="size-6" />
                    <span className="mt-1 max-w-full truncate px-1 text-[9px] leading-tight">{nombreArchivo(ruta)}</span>
                  </>
                )}
                {url && (
                  <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                    <Expand className="size-4 text-white" />
                  </span>
                )}
                {!soloLectura && (
                  <span
                    role="button"
                    onClick={(e) => eliminarArchivo(ruta, e)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-card/90 p-0.5 text-[var(--error)] shadow-sm hover:bg-card"
                  >
                    <Trash2 className="size-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
      {urls.length === 0 && soloLectura && <p className="text-sm text-muted-foreground">Sin evidencias adjuntas.</p>}

      {!soloLectura && (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            disabled={subiendo}
            onChange={(e) => {
              subirArchivos(e.target.files)
              e.target.value = ''
            }}
          />
          <Button type="button" variant="outline" size="sm" cargando={subiendo} onClick={() => inputRef.current?.click()}>
            <Paperclip className="size-3.5" />
            Adjuntar archivos
          </Button>
        </>
      )}
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}

      <Dialog open={vistaGrande !== null} onOpenChange={(v) => !v && setVistaGrande(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{rutaGrande ? nombreArchivo(rutaGrande) : ''}</DialogTitle>
          </DialogHeader>
          {rutaGrande && urlGrande && (
            <div className="flex max-h-[75vh] items-center justify-center overflow-auto rounded-lg bg-accent/30">
              {esImagen(rutaGrande) ? (
                <img src={urlGrande} alt={nombreArchivo(rutaGrande)} className="max-h-[75vh] w-full object-contain" />
              ) : esPDF(rutaGrande) ? (
                <iframe src={urlGrande} title={nombreArchivo(rutaGrande)} className="h-[75vh] w-full rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-10 text-muted-foreground">
                  <FileText className="size-10" />
                  <p className="text-sm">Vista previa no disponible para este tipo de archivo.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {urlGrande && (
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={urlGrande} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Abrir en pestaña nueva
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
