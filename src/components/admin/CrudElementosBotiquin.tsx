import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { FormaIcono } from '@/lib/botiquines'
import { IconoElementoBotiquin } from '@/components/inventario/IconoElementoBotiquin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

type Fila = { id: string; nombre: string; cantidad: string | null; forma: FormaIcono; orden: number; activo: boolean }

const FORMAS: { valor: FormaIcono; etiqueta: string }[] = [
  { valor: 'caja', etiqueta: 'Caja' },
  { valor: 'paquete', etiqueta: 'Paquete' },
  { valor: 'frasco', etiqueta: 'Frasco' },
  { valor: 'rollo', etiqueta: 'Rollo' },
]

const VACIO = { nombre: '', cantidad: '', forma: 'caja' as FormaIcono, orden: 1 }

/**
 * Catálogo administrable de elementos de botiquín (Administración → Catálogos) — controla qué
 * elementos aparecen en el checklist de cada botiquín en Inventario. Es un CRUD dedicado (no
 * `CrudSimple`) porque necesita campos propios: cantidad sugerida y forma del ícono isométrico.
 */
export function CrudElementosBotiquin() {
  const [filas, setFilas] = useState<Fila[]>([])
  const [cargando, setCargando] = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Fila | null>(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)

  const [aEliminar, setAEliminar] = useState<Fila | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from('catalogo_elementos_botiquin')
      .select('*')
      .order('orden')
      .then(({ data }) => {
        setFilas((data ?? []) as Fila[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  function abrirNuevo() {
    setEditando(null)
    setForm({ ...VACIO, orden: filas.length + 1 })
    setModalAbierto(true)
  }

  function abrirEditar(f: Fila) {
    setEditando(f)
    setForm({ nombre: f.nombre, cantidad: f.cantidad ?? '', forma: f.forma, orden: f.orden })
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const payload = { nombre: form.nombre, cantidad: form.cantidad || null, forma: form.forma, orden: form.orden }
    const { error } = editando
      ? await supabase.from('catalogo_elementos_botiquin').update(payload).eq('id', editando.id)
      : await supabase.from('catalogo_elementos_botiquin').insert(payload)
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setModalAbierto(false)
    cargar()
  }

  async function alternarActivo(f: Fila) {
    await supabase.from('catalogo_elementos_botiquin').update({ activo: !f.activo }).eq('id', f.id)
    cargar()
  }

  async function eliminar() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.from('catalogo_elementos_botiquin').delete().eq('id', aEliminar.id)
    setEliminando(false)
    setAEliminar(null)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo eliminar', texto: error.message })
      return
    }
    cargar()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--cac-azul)]">Elementos de Botiquín</h3>
          <Button size="sm" onClick={abrirNuevo}>
            <Plus />
            Nuevo
          </Button>
        </div>

        {cargando ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Cargando…</div>
        ) : filas.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Sin registros.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {filas.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <IconoElementoBotiquin forma={f.forma} size={26} />
                  <div className="min-w-0">
                    <div className="truncate text-sm">{f.nombre}</div>
                    {f.cantidad && <div className="truncate text-xs text-muted-foreground">{f.cantidad}</div>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => alternarActivo(f)} className="cursor-pointer">
                    <Badge tono={f.activo ? 'exito' : 'neutro'}>{f.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(f)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setAEliminar(f)}>
                    <Trash2 className="size-3.5 text-[var(--error)]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-sm">
          <form onSubmit={guardar}>
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar elemento' : 'Nuevo elemento de botiquín'}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="elem-nombre">Nombre</Label>
                <Input id="elem-nombre" required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="elem-cantidad">Cantidad sugerida (opcional)</Label>
                <Input
                  id="elem-cantidad"
                  placeholder='Ej: 1 paquete x20'
                  value={form.cantidad}
                  onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ícono</Label>
                <div className="flex items-center gap-3">
                  <Select value={form.forma} onValueChange={(v) => setForm((f) => ({ ...f, forma: v as FormaIcono }))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS.map((f) => (
                        <SelectItem key={f.valor} value={f.valor}>
                          {f.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <IconoElementoBotiquin forma={form.forma} size={32} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="elem-orden">Orden</Label>
                <Input
                  id="elem-orden"
                  type="number"
                  min={1}
                  required
                  value={form.orden}
                  onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={aEliminar !== null}
        titulo={`Eliminar "${aEliminar?.nombre}"`}
        descripcion="Los botiquines que ya lo tenían marcado como faltante conservarán esa referencia, pero dejará de aparecer en el checklist."
        cargando={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </Card>
  )
}
