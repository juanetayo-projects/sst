import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ListChecks, Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { formatearFecha } from '@/lib/utils'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'

type Compromiso = {
  id: string
  descripcion: string
  responsable: string | null
  fecha_compromiso: string
  estado: 'pendiente' | 'cumplido'
  inspeccion_id: string
  inspecciones: { empresa: string | null; sede: string | null; tipo_inspeccion_id: string; tipos_inspeccion: { nombre: string } | null } | null
}

type InspeccionOpcion = { id: string; fecha_inspeccion: string; empresa: string | null; sede: string | null; tipos_inspeccion: { nombre: string } | null }

const TODOS = '__todos__'
const hoyISO = new Date().toISOString().slice(0, 10)
const FORM_VACIO = { inspeccion_id: '', descripcion: '', responsable: '', fecha_compromiso: hoyISO, estado: 'pendiente' as Compromiso['estado'] }

function esVencido(c: Compromiso) {
  return c.estado === 'pendiente' && c.fecha_compromiso < hoyISO
}

function EstadoBadge({ c }: { c: Compromiso }) {
  if (c.estado === 'cumplido') return <Badge tono="exito">Cumplido</Badge>
  if (esVencido(c)) return <Badge tono="error">Vencido</Badge>
  return <Badge tono="advertencia">Pendiente</Badge>
}

export default function Compromisos() {
  const { session, perfil } = useAuth()
  const esAdmin = perfil?.role === 'admin'

  const [filas, setFilas] = useState<Compromiso[]>([])
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [tipoId, setTipoId] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const [inspeccionesOpciones, setInspeccionesOpciones] = useState<InspeccionOpcion[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Compromiso | null>(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Compromiso | null>(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    supabase.from('tipos_inspeccion').select('*').eq('activo', true).order('orden').then(({ data }) => setTipos((data ?? []) as TipoInspeccion[]))
    supabase
      .from('inspecciones')
      .select('id,fecha_inspeccion,empresa,sede,tipos_inspeccion(nombre)')
      .order('fecha_inspeccion', { ascending: false })
      .limit(100)
      .then(({ data }) => setInspeccionesOpciones((data ?? []) as unknown as InspeccionOpcion[]))
  }, [])

  function cargar() {
    setCargando(true)
    let q = supabase
      .from('compromisos_ronda')
      .select('id,descripcion,responsable,fecha_compromiso,estado,inspeccion_id,inspecciones(empresa,sede,tipo_inspeccion_id,tipos_inspeccion(nombre))')
      .order('fecha_compromiso', { ascending: true })
    if (desde) q = q.gte('fecha_compromiso', desde)
    if (hasta) q = q.lte('fecha_compromiso', hasta)
    q.then(({ data }) => {
      let resultado = (data ?? []) as unknown as Compromiso[]
      if (tipoId !== TODOS) resultado = resultado.filter((r) => r.inspecciones?.tipo_inspeccion_id === tipoId)
      if (estadoFiltro === 'vencido') resultado = resultado.filter(esVencido)
      else if (estadoFiltro !== TODOS) resultado = resultado.filter((r) => r.estado === estadoFiltro)
      setFilas(resultado)
      setCargando(false)
    })
  }

  useEffect(cargar, [tipoId, estadoFiltro, desde, hasta])

  const resumen = useMemo(() => {
    const pendientes = filas.filter((f) => f.estado === 'pendiente' && !esVencido(f)).length
    const vencidos = filas.filter(esVencido).length
    const cumplidos = filas.filter((f) => f.estado === 'cumplido').length
    return { total: filas.length, pendientes, vencidos, cumplidos }
  }, [filas])

  async function marcarCumplido(id: string) {
    await supabase.from('compromisos_ronda').update({ estado: 'cumplido', fecha_cumplido: new Date().toISOString().slice(0, 10) }).eq('id', id)
    cargar()
  }

  function abrirNuevo() {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  function abrirEditar(c: Compromiso) {
    setEditando(c)
    setForm({
      inspeccion_id: c.inspeccion_id,
      descripcion: c.descripcion,
      responsable: c.responsable ?? '',
      fecha_compromiso: c.fecha_compromiso,
      estado: c.estado,
    })
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!editando && !form.inspeccion_id) return
    setGuardando(true)
    const payload = {
      descripcion: form.descripcion,
      responsable: form.responsable || null,
      fecha_compromiso: form.fecha_compromiso,
      estado: form.estado,
      ...(form.estado === 'cumplido' ? { fecha_cumplido: new Date().toISOString().slice(0, 10) } : {}),
    }
    const { error } = editando
      ? await supabase.from('compromisos_ronda').update(payload).eq('id', editando.id)
      : await supabase.from('compromisos_ronda').insert({ ...payload, inspeccion_id: form.inspeccion_id })
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
    const { error } = await supabase.from('compromisos_ronda').delete().eq('id', aEliminar.id)
    setEliminando(false)
    setAEliminar(null)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo eliminar', texto: error.message })
      return
    }
    cargar()
  }

  return (
    <div>
      <PageHeader
        titulo="Compromisos de ronda"
        acciones={
          esAdmin && (
            <Button size="sm" onClick={abrirNuevo}>
              <Plus />
              Nuevo compromiso
            </Button>
          )
        }
      />
      <p className="mb-4 text-sm text-muted-foreground">
        Acta de compromisos registrada al final de cada ronda: qué se acordó corregir, quién responde y para cuándo. Un compromiso pendiente cuya
        fecha ya pasó se marca automáticamente como <strong>Vencido</strong>.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Total" valor={resumen.total} icono={ListChecks} color="azul" />
        <MetricCard titulo="Pendientes" valor={resumen.pendientes} icono={ListChecks} color="ambar" />
        <MetricCard titulo="Vencidos" valor={resumen.vencidos} icono={ListChecks} color="rojo" />
        <MetricCard titulo="Cumplidos" valor={resumen.cumplidos} icono={CheckCircle2} color="verde" />
      </div>

      <FilterBar>
        <div className="space-y-1.5">
          <Label className="text-xs">Ronda</Label>
          <Select value={tipoId} onValueChange={setTipoId}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {tipos.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Estado</Label>
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="cumplido">Cumplido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="h-8 w-32 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="h-8 w-32 text-xs" />
        </div>
      </FilterBar>

      <Card className="overflow-x-auto">
        {cargando ? (
          <div className="p-4">
            <SkeletonTabla filas={8} columnas={7} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="franja-institucional text-left text-xs text-white">
                <th className="px-3 py-2.5 font-semibold">Fecha compromiso</th>
                <th className="px-3 py-2.5 font-semibold">Ronda</th>
                <th className="px-3 py-2.5 font-semibold">Empresa / Sede</th>
                <th className="px-3 py-2.5 font-semibold">Descripción</th>
                <th className="px-3 py-2.5 font-semibold">Responsable</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                <th className="px-3 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((c, i) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                  <td className="px-3 py-2">{formatearFecha(c.fecha_compromiso)}</td>
                  <td className="px-3 py-2">
                    <Link to={`/inspecciones/${c.inspeccion_id}`} className="hover:underline">
                      {c.inspecciones?.tipos_inspeccion?.nombre ?? '—'}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {c.inspecciones?.empresa ?? '—'} {c.inspecciones?.sede ? `· ${c.inspecciones.sede}` : ''}
                  </td>
                  <td className="px-3 py-2">{c.descripcion}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.responsable ?? '—'}</td>
                  <td className="px-3 py-2">
                    <EstadoBadge c={c} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {c.estado === 'pendiente' && session && (
                        <Button variant="ghost" size="icon" title="Marcar cumplido" onClick={() => marcarCumplido(c.id)}>
                          <CheckCircle2 className="size-3.5 text-[var(--exito)]" />
                        </Button>
                      )}
                      {esAdmin && (
                        <>
                          <Button variant="ghost" size="icon" title="Editar" onClick={() => abrirEditar(c)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setAEliminar(c)}>
                            <Trash2 className="size-3.5 text-[var(--error)]" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    Sin compromisos con estos filtros.
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
              <ListChecks className="size-5 text-white" />
              <DialogTitle className="text-white">{editando ? 'Editar compromiso' : 'Nuevo compromiso'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {!editando && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Ronda de inspección</Label>
                  <Select value={form.inspeccion_id} onValueChange={(v) => setForm((f) => ({ ...f, inspeccion_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la ronda…" />
                    </SelectTrigger>
                    <SelectContent>
                      {inspeccionesOpciones.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {formatearFecha(i.fecha_inspeccion)} · {i.tipos_inspeccion?.nombre ?? '—'} · {i.empresa ?? 'Sin empresa'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="comp-descripcion">Descripción</Label>
                <Input id="comp-descripcion" required value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="comp-responsable">Responsable</Label>
                <Input id="comp-responsable" value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="comp-fecha">Fecha compromiso</Label>
                <Input id="comp-fecha" type="date" required value={form.fecha_compromiso} onChange={(e) => setForm((f) => ({ ...f, fecha_compromiso: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="comp-estado">Estado</Label>
                <Select value={form.estado} onValueChange={(v) => setForm((f) => ({ ...f, estado: v as Compromiso['estado'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="cumplido">Cumplido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando} disabled={!editando && !form.inspeccion_id}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={aEliminar !== null}
        titulo="Eliminar compromiso"
        descripcion="Esta acción no se puede deshacer."
        cargando={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
