import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Flame, FileSpreadsheet, Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { formatearFecha } from '@/lib/utils'
import { exportarExcel } from '@/lib/exportar'
import { estadoVencimiento, ETIQUETA_VENCIMIENTO, TONO_VENCIMIENTO, type EstadoVencimiento } from '@/lib/inventario'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'

type Extintor = {
  id: string
  codigo: string
  empresa: string | null
  sede: string | null
  ubicacion: string | null
  tipo: string | null
  capacidad: string | null
  fecha_vencimiento: string | null
}

const TODOS = '__todos__'
const ORDEN_ESTADO: Record<EstadoVencimiento, number> = { vencido: 0, proximo: 1, vigente: 2, sin_fecha: 3 }
const FORM_VACIO = { codigo: '', empresa: '', sede: '', ubicacion: '', tipo: '', capacidad: '', fecha_vencimiento: '' }

export default function Vencimientos() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.role === 'admin'

  const [items, setItems] = useState<Extintor[]>([])
  const [cargando, setCargando] = useState(true)
  const [sede, setSede] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Extintor | null>(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Extintor | null>(null)
  const [eliminando, setEliminando] = useState(false)

  function cargar() {
    setCargando(true)
    supabase
      .from('inventario_extintores')
      .select('id,codigo,empresa,sede,ubicacion,tipo,capacidad,fecha_vencimiento')
      .eq('activo', true)
      .then(({ data }) => {
        setItems((data ?? []) as Extintor[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  function abrirNuevo() {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  function abrirEditar(item: Extintor) {
    setEditando(item)
    setForm({
      codigo: item.codigo,
      empresa: item.empresa ?? '',
      sede: item.sede ?? '',
      ubicacion: item.ubicacion ?? '',
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
      ubicacion: form.ubicacion || null,
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

  const sedes = useMemo(() => Array.from(new Set(items.map((i) => i.sede).filter((s): s is string => !!s))).sort(), [items])

  const filtrados = useMemo(() => {
    return items
      .filter((i) => sede === TODOS || i.sede === sede)
      .filter((i) => estadoFiltro === TODOS || estadoVencimiento(i.fecha_vencimiento) === estadoFiltro)
      .sort((a, b) => {
        const oa = ORDEN_ESTADO[estadoVencimiento(a.fecha_vencimiento)]
        const ob = ORDEN_ESTADO[estadoVencimiento(b.fecha_vencimiento)]
        if (oa !== ob) return oa - ob
        return (a.fecha_vencimiento ?? '9999').localeCompare(b.fecha_vencimiento ?? '9999')
      })
  }, [items, sede, estadoFiltro])

  const resumen = useMemo(() => {
    const vencidos = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vencido').length
    const proximos = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'proximo').length
    const vigentes = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vigente').length
    return { total: filtrados.length, vencidos, proximos, vigentes }
  }, [filtrados])

  const subtituloFiltros = useMemo(() => {
    const partes = [`Sede: ${sede === TODOS ? 'Todas' : sede}`, `Estado: ${estadoFiltro === TODOS ? 'Todos' : ETIQUETA_VENCIMIENTO[estadoFiltro as EstadoVencimiento]}`]
    return partes.join(' · ')
  }, [sede, estadoFiltro])

  async function exportar() {
    await exportarExcel({
      nombreArchivo: 'vencimientos_extintores',
      titulo: 'Vencimientos de extintores — SST',
      subtitulo: subtituloFiltros,
      columnas: [
        { header: 'Código', key: 'codigo', width: 14 },
        { header: 'Sede', key: 'sede', width: 26 },
        { header: 'Ubicación', key: 'ubicacion', width: 26 },
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'Vencimiento', key: 'vencimiento', width: 14 },
        { header: 'Estado', key: 'estado', width: 16 },
      ],
      filas: filtrados.map((i) => ({
        codigo: i.codigo,
        sede: i.sede ?? '—',
        ubicacion: i.ubicacion ?? '—',
        tipo: i.tipo ?? '—',
        vencimiento: formatearFecha(i.fecha_vencimiento),
        estado: ETIQUETA_VENCIMIENTO[estadoVencimiento(i.fecha_vencimiento)],
      })),
    })
  }

  return (
    <div>
      <PageHeader
        titulo="Vencimientos de extintores"
        acciones={
          <>
            {esAdmin && (
              <Button size="sm" onClick={abrirNuevo}>
                <Plus />
                Nuevo extintor
              </Button>
            )}
            <Button variant="outline" size="sm" disabled={filtrados.length === 0} onClick={exportar}>
              <FileSpreadsheet />
              Exportar Excel
            </Button>
          </>
        }
      />
      <p className="mb-4 text-sm text-muted-foreground">
        Seguimiento de la fecha de vencimiento de cada extintor del inventario, para anticipar el recambio antes de que quede vencido.
        {esAdmin ? ' Puedes crear, editar o eliminar registros directamente aquí, o desde ' : ' El inventario se administra en '}
        <Link to="/admin/inventario" className="font-medium text-[var(--cac-azul)] hover:underline">
          Administración → Inventario
        </Link>
        {esAdmin ? ' (allí también se ven los datos de piso y agente extintor).' : '.'}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Total extintores" valor={resumen.total} icono={Flame} color="azul" />
        <MetricCard titulo="Vencidos" valor={resumen.vencidos} icono={Flame} color="rojo" />
        <MetricCard titulo="Próximos a vencer" valor={resumen.proximos} icono={Flame} color="ambar" />
        <MetricCard titulo="Vigentes" valor={resumen.vigentes} icono={Flame} color="verde" />
      </div>

      <FilterBar>
        <div className="space-y-1.5">
          <Label className="text-xs">Sede</Label>
          <Select value={sede} onValueChange={setSede}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {sedes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Estado</Label>
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="proximo">Próximo a vencer</SelectItem>
              <SelectItem value="vigente">Vigente</SelectItem>
              <SelectItem value="sin_fecha">Sin fecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <Card className="overflow-x-auto">
        {cargando ? (
          <div className="p-4">
            <SkeletonTabla filas={8} columnas={6} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="franja-institucional text-left text-xs text-white">
                <th className="px-3 py-2.5 font-semibold">Código</th>
                <th className="px-3 py-2.5 font-semibold">Sede</th>
                <th className="px-3 py-2.5 font-semibold">Ubicación</th>
                <th className="px-3 py-2.5 font-semibold">Tipo</th>
                <th className="px-3 py-2.5 font-semibold">Vencimiento</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                {esAdmin && <th className="px-3 py-2.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i, idx) => {
                const estado = estadoVencimiento(i.fecha_vencimiento)
                return (
                  <tr key={i.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: idx % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                    <td className="px-3 py-2 font-medium">{i.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{i.sede ?? '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{i.ubicacion ?? '—'}</td>
                    <td className="px-3 py-2">{i.tipo ?? '—'}</td>
                    <td className="px-3 py-2">{formatearFecha(i.fecha_vencimiento)}</td>
                    <td className="px-3 py-2">
                      <Badge tono={TONO_VENCIMIENTO[estado]}>{ETIQUETA_VENCIMIENTO[estado]}</Badge>
                    </td>
                    {esAdmin && (
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Editar" onClick={() => abrirEditar(i)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setAEliminar(i)}>
                            <Trash2 className="size-3.5 text-[var(--error)]" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={esAdmin ? 7 : 6} className="px-3 py-6 text-center text-muted-foreground">
                    Sin registros con estos filtros.
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
            <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
              <Flame className="size-5 text-white" />
              <DialogTitle className="text-white">{editando ? 'Editar extintor' : 'Nuevo extintor'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="venc-codigo">Código</Label>
                <Input id="venc-codigo" required value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venc-empresa">Empresa</Label>
                <Input id="venc-empresa" value={form.empresa} onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venc-sede">Sede</Label>
                <Input id="venc-sede" value={form.sede} onChange={(e) => setForm((f) => ({ ...f, sede: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venc-ubicacion">Ubicación</Label>
                <Input id="venc-ubicacion" value={form.ubicacion} onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venc-tipo">Tipo</Label>
                <Input id="venc-tipo" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venc-capacidad">Capacidad</Label>
                <Input id="venc-capacidad" value={form.capacidad} onChange={(e) => setForm((f) => ({ ...f, capacidad: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="venc-fecha">Fecha de vencimiento</Label>
                <Input id="venc-fecha" type="date" value={form.fecha_vencimiento} onChange={(e) => setForm((f) => ({ ...f, fecha_vencimiento: e.target.value }))} />
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
