import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

type Fila = { id: string; nombre: string; orden: number; activo: boolean }

export function CrudSimple({ tabla, titulo }: { tabla: 'empresas' | 'sedes' | 'unidades_medida'; titulo: string }) {
  const [filas, setFilas] = useState<Fila[]>([])
  const [cargando, setCargando] = useState(true)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Fila | null>(null)
  const [nombre, setNombre] = useState('')
  const [orden, setOrden] = useState(1)
  const [guardando, setGuardando] = useState(false)

  const [aEliminar, setAEliminar] = useState<Fila | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from(tabla)
      .select('*')
      .order('orden')
      .then(({ data }) => {
        setFilas((data ?? []) as Fila[])
        setCargando(false)
      })
  }

  useEffect(cargar, [tabla])

  function abrirNuevo() {
    setEditando(null)
    setNombre('')
    setOrden(filas.length + 1)
    setModalAbierto(true)
  }

  function abrirEditar(f: Fila) {
    setEditando(f)
    setNombre(f.nombre)
    setOrden(f.orden)
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const { error } = editando
      ? await supabase.from(tabla).update({ nombre, orden }).eq('id', editando.id)
      : await supabase.from(tabla).insert({ nombre, orden })
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setModalAbierto(false)
    cargar()
  }

  async function alternarActivo(f: Fila) {
    await supabase.from(tabla).update({ activo: !f.activo }).eq('id', f.id)
    cargar()
  }

  async function eliminar() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.from(tabla).delete().eq('id', aEliminar.id)
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
          <h3 className="text-sm font-semibold text-[var(--cac-azul)]">{titulo}</h3>
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
                <span className="text-sm">{f.nombre}</span>
                <div className="flex items-center gap-2">
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
              <DialogTitle>{editando ? `Editar ${titulo.toLowerCase()}` : `Nuevo — ${titulo}`}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={`nombre-${tabla}`}>Nombre</Label>
                <Input id={`nombre-${tabla}`} required value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`orden-${tabla}`}>Orden</Label>
                <Input
                  id={`orden-${tabla}`}
                  type="number"
                  min={1}
                  required
                  value={orden}
                  onChange={(e) => setOrden(Number(e.target.value))}
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
        descripcion="Esta acción no se puede deshacer. Los registros históricos que ya la usan no se verán afectados."
        cargando={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </Card>
  )
}
