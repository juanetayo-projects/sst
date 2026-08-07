import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pregunta, TipoCampo } from '@/domain/inspecciones'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

const CAMPOS_CATEGORIA: { value: TipoCampo; label: string }[] = [
  { value: 'opcion', label: 'Opción (checklist)' },
  { value: 'texto', label: 'Texto libre' },
]
const CAMPOS_LIBRES: { value: TipoCampo; label: string }[] = [
  { value: 'select', label: 'Lista desplegable' },
  { value: 'texto', label: 'Texto libre' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'booleano', label: 'Sí / No' },
]

export function PreguntaModal({
  open,
  onClose,
  pregunta,
  tipoInspeccionId,
  categoriaId,
  esCategoria,
  siguienteOrden,
  onGuardado,
}: {
  open: boolean
  onClose: () => void
  pregunta: Pregunta | null
  tipoInspeccionId: string
  categoriaId: string | null
  esCategoria: boolean
  siguienteOrden: number
  onGuardado: () => void
}) {
  const [texto, setTexto] = useState('')
  const [tipoCampo, setTipoCampo] = useState<TipoCampo>(esCategoria ? 'opcion' : 'texto')
  const [opcionesTexto, setOpcionesTexto] = useState('')
  const [obligatoria, setObligatoria] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  useEffect(() => {
    if (!open) return
    setTexto(pregunta?.texto ?? '')
    setTipoCampo(pregunta?.tipo_campo ?? (esCategoria ? 'opcion' : 'texto'))
    setOpcionesTexto((pregunta?.opciones ?? []).join('\n'))
    setObligatoria(pregunta?.obligatoria ?? true)
  }, [open, pregunta, esCategoria])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const opciones =
      tipoCampo === 'select'
        ? opcionesTexto
            .split('\n')
            .map((o) => o.trim())
            .filter(Boolean)
        : null

    const payload = {
      tipo_inspeccion_id: tipoInspeccionId,
      categoria_id: categoriaId,
      texto,
      tipo_campo: tipoCampo,
      opciones,
      obligatoria,
    }

    const { error } = pregunta
      ? await supabase.from('preguntas').update(payload).eq('id', pregunta.id)
      : await supabase.from('preguntas').insert({ ...payload, orden: siguienteOrden })

    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    onGuardado()
    onClose()
  }

  const opcionesDeCampo = esCategoria ? CAMPOS_CATEGORIA : CAMPOS_LIBRES

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md">
          <form onSubmit={guardar}>
            <DialogHeader>
              <DialogTitle>{pregunta ? 'Editar pregunta' : 'Nueva pregunta'}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="texto-pregunta">Texto de la pregunta</Label>
                <Textarea id="texto-pregunta" required rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de campo</Label>
                <Select value={tipoCampo} onValueChange={(v) => setTipoCampo(v as TipoCampo)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesDeCampo.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {tipoCampo === 'select' && (
                <div className="space-y-1.5">
                  <Label htmlFor="opciones-pregunta">Opciones (una por línea)</Label>
                  <Textarea
                    id="opciones-pregunta"
                    rows={4}
                    required
                    value={opcionesTexto}
                    onChange={(e) => setOpcionesTexto(e.target.value)}
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={obligatoria} onCheckedChange={(v) => setObligatoria(v === true)} />
                Obligatoria
              </label>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </>
  )
}
