import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'

type Extintor = {
  id: string
  codigo: string
  empresa: string | null
  sede: string | null
  piso: string | null
  ubicacion: string | null
  agente_extintor: string | null
  tipo: string | null
  capacidad: string | null
  fecha_vencimiento: string | null
  activo: boolean
}

const VACIO: Omit<Extintor, 'id' | 'activo'> = {
  codigo: '',
  empresa: '',
  sede: '',
  piso: '',
  ubicacion: '',
  agente_extintor: '',
  tipo: '',
  capacidad: '',
  fecha_vencimiento: '',
}

export default function Inventario() {
  const [items, setItems] = useState<Extintor[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Extintor | null>(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)

  const [aEliminar, setAEliminar] = useState<Extintor | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from('inventario_extintores')
      .select('*')
      .order('codigo')
      .then(({ data }) => {
        setItems((data ?? []) as Extintor[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  function abrirNuevo() {
    setEditando(null)
    setForm(VACIO)
    setModalAbierto(true)
  }

  function abrirEditar(item: Extintor) {
    setEditando(item)
    setForm({
      codigo: item.codigo,
      empresa: item.empresa ?? '',
      sede: item.sede ?? '',
      piso: item.piso ?? '',
      ubicacion: item.ubicacion ?? '',
      agente_extintor: item.agente_extintor ?? '',
      tipo: item.tipo ?? '',
      capacidad: item.capacidad ?? '',
      fecha_vencimiento: item.fecha_vencimiento ?? '',
    })
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const payload = {
      codigo: form.codigo,
      empresa: form.empresa || null,
      sede: form.sede || null,
      piso: form.piso || null,
      ubicacion: form.ubicacion || null,
      agente_extintor: form.agente_extintor || null,
      tipo: form.tipo || null,
      capacidad: form.capacidad || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
    }
    const { error } = editando
      ? await supabase.from('inventario_extintores').update(payload).eq('id', editando.id)
      : await supabase.from('inventario_extintores').insert(payload)
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setModalAbierto(false)
    cargar()
  }

  async function alternarActivo(item: Extintor) {
    await supabase.from('inventario_extintores').update({ activo: !item.activo }).eq('id', item.id)
    cargar()
  }

  async function eliminar() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.from('inventario_extintores').delete().eq('id', aEliminar.id)
    setEliminando(false)
    setAEliminar(null)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo eliminar', texto: error.message })
      return
    }
    cargar()
  }

  const filtrados = items.filter((i) => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return true
    return [i.codigo, i.sede, i.ubicacion, i.tipo].some((v) => v?.toLowerCase().includes(q))
  })

  return (
    <div>
      <PageHeader
        titulo="Inventario de extintores"
        acciones={
          <Button size="sm" onClick={abrirNuevo}>
            <Plus />
            Nuevo extintor
          </Button>
        }
      />

      <p className="mb-3 text-sm text-muted-foreground">
        Estos códigos son los que se ofrecen al diligenciar la Ronda de Extintores — al elegir un código se autocompletan
        el tipo y la capacidad en el formulario.
      </p>

      <div className="mb-3 max-w-xs">
        <Input placeholder="Buscar por código, sede, ubicación…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      <Card className="overflow-x-auto">
        {cargando ? (
          <div className="p-4">
            <SkeletonTabla filas={8} columnas={7} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="franja-institucional text-left text-xs text-white">
                <th className="px-3 py-2.5 font-semibold">Código</th>
                <th className="px-3 py-2.5 font-semibold">Sede</th>
                <th className="px-3 py-2.5 font-semibold">Ubicación</th>
                <th className="px-3 py-2.5 font-semibold">Agente</th>
                <th className="px-3 py-2.5 font-semibold">Tipo</th>
                <th className="px-3 py-2.5 font-semibold">Capacidad</th>
                <th className="px-3 py-2.5 font-semibold">Vencimiento</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                <th className="px-3 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0"
                  style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}
                >
                  <td className="px-3 py-2 font-medium">{item.codigo}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.sede ?? '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.ubicacion ?? '—'}</td>
                  <td className="px-3 py-2">{item.agente_extintor ?? '—'}</td>
                  <td className="px-3 py-2">{item.tipo ?? '—'}</td>
                  <td className="px-3 py-2">{item.capacidad ?? '—'}</td>
                  <td className="px-3 py-2">{item.fecha_vencimiento ?? '—'}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => alternarActivo(item)} className="cursor-pointer">
                      <Badge tono={item.activo ? 'exito' : 'neutro'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(item)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setAEliminar(item)}>
                        <Trash2 className="size-3.5 text-[var(--error)]" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">
                    Sin registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg">
          <form onSubmit={guardar}>
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar extintor' : 'Nuevo extintor'}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ext-codigo">Código</Label>
                <Input id="ext-codigo" required value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-sede">Sede</Label>
                <Input id="ext-sede" value={form.sede ?? ''} onChange={(e) => setForm((f) => ({ ...f, sede: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-piso">Piso</Label>
                <Input id="ext-piso" value={form.piso ?? ''} onChange={(e) => setForm((f) => ({ ...f, piso: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-ubicacion">Ubicación</Label>
                <Input id="ext-ubicacion" value={form.ubicacion ?? ''} onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-agente">Agente extintor</Label>
                <Input id="ext-agente" value={form.agente_extintor ?? ''} onChange={(e) => setForm((f) => ({ ...f, agente_extintor: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-tipo">Tipo</Label>
                <Input id="ext-tipo" value={form.tipo ?? ''} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-capacidad">Capacidad</Label>
                <Input id="ext-capacidad" value={form.capacidad ?? ''} onChange={(e) => setForm((f) => ({ ...f, capacidad: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-vencimiento">Fecha de vencimiento</Label>
                <Input
                  id="ext-vencimiento"
                  type="date"
                  value={form.fecha_vencimiento ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, fecha_vencimiento: e.target.value }))}
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
        titulo={`Eliminar "${aEliminar?.codigo}"`}
        descripcion="Esta acción no se puede deshacer. Las inspecciones históricas que ya usaron este código no se ven afectadas."
        cargando={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
