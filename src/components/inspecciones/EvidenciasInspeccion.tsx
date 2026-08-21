import { useRef, useState } from 'react'
import { Paperclip, FileText, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const BUCKET = 'evidencias'

function nombreArchivo(ruta: string) {
  const partes = ruta.split('/')
  const conTimestamp = partes[partes.length - 1] ?? ruta
  return conTimestamp.replace(/^\d+-/, '')
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
  const inputRef = useRef<HTMLInputElement>(null)

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

  async function verArchivo(ruta: string) {
    const { data, error: errorFirma } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 300)
    if (errorFirma || !data) {
      setError('No se pudo abrir el archivo.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  async function eliminarArchivo(ruta: string) {
    await supabase.storage.from(BUCKET).remove([ruta])
    onChange(urls.filter((u) => u !== ruta))
  }

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="space-y-1.5">
          {urls.map((ruta) => (
            <div key={ruta} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-1.5 text-sm">
              <button type="button" onClick={() => verArchivo(ruta)} className="flex min-w-0 items-center gap-1.5 text-left hover:underline">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{nombreArchivo(ruta)}</span>
              </button>
              {!soloLectura && (
                <button type="button" onClick={() => eliminarArchivo(ruta)} className="shrink-0 rounded p-1 hover:bg-accent">
                  <Trash2 className="size-3.5 text-[var(--error)]" />
                </button>
              )}
            </div>
          ))}
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
    </div>
  )
}
