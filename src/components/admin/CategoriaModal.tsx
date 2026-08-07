import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import type { CategoriaPregunta, Pregunta } from '@/domain/inspecciones'
import type { ColorBloque } from '@/domain/categoriasSST'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

const COLORES: { value: ColorBloque; label: string }[] = [
  { value: 'azul', label: 'Azul' },
  { value: 'verde', label: 'Verde' },
  { value: 'ambar', label: 'Ámbar' },
  { value: 'violeta', label: 'Violeta' },
  { value: 'teal', label: 'Teal' },
  { value: 'rojo', label: 'Rojo' },
]

const SIN_CONDICION = '__ninguna__'

export function CategoriaModal({
  open,
  onClose,
  categoria,
  tipoInspeccionId,
  encabezado,
  siguienteOrden,
  onGuardado,
}: {
  open: boolean
  onClose: () => void
  categoria: CategoriaPregunta | null
  tipoInspeccionId: string
  encabezado: Pregunta[]
  siguienteOrden: number
  onGuardado: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState<ColorBloque>('azul')
  const [condicionCampo, setCondicionCampo] = useState(SIN_CONDICION)
  const [condicionValor, setCondicionValor] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const preguntasCondicionables = encabezado.filter((p) => p.tipo_campo === 'select' || p.tipo_campo === 'booleano')
  const preguntaCondicion = preguntasCondicionables.find((p) => p.texto === condicionCampo)
  const opcionesCondicion = preguntaCondicion
    ? preguntaCondicion.tipo_campo === 'booleano'
      ? ['Sí', 'No']
      : (preguntaCondicion.opciones ?? [])
    : []

  useEffect(() => {
    if (!open) return
    setNombre(categoria?.nombre ?? '')
    setColor((categoria?.color as ColorBloque) ?? 'azul')
    setCondicionCampo(categoria?.condicion_campo ?? SIN_CONDICION)
    setCondicionValor(categoria?.condicion_valor ?? '')
  }, [open, categoria])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const payload = {
      tipo_inspeccion_id: tipoInspeccionId,
      nombre,
      color,
      condicion_campo: condicionCampo === SIN_CONDICION ? null : condicionCampo,
      condicion_valor: condicionCampo === SIN_CONDICION ? null : condicionValor || null,
    }
    const { error } = categoria
      ? await supabase.from('categorias_pregunta').update(payload).eq('id', categoria.id)
      : await supabase.from('categorias_pregunta').insert({ ...payload, orden: siguienteOrden })

    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    onGuardado()
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md">
          <form onSubmit={guardar}>
            <DialogHeader>
              <DialogTitle>{categoria ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-categoria">Nombre</Label>
                <Input id="nombre-categoria" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Select value={color} onValueChange={(v) => setColor(v as ColorBloque)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Mostrar solo si (opcional)</Label>
                <Select
                  value={condicionCampo}
                  onValueChange={(v) => {
                    setCondicionCampo(v)
                    setCondicionValor('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN_CONDICION}>Siempre visible</SelectItem>
                    {preguntasCondicionables.map((p) => (
                      <SelectItem key={p.id} value={p.texto}>
                        {p.texto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {preguntasCondicionables.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Agrega primero una pregunta de encabezado tipo "Lista desplegable" o "Sí / No" para poder
                    condicionar una categoría a su respuesta.
                  </p>
                )}
              </div>
              {condicionCampo !== SIN_CONDICION && (
                <div className="space-y-1.5">
                  <Label>Valor que la activa</Label>
                  <Select value={condicionValor} onValueChange={setCondicionValor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona…" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesCondicion.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
