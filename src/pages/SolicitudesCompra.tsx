import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FileSpreadsheet, PackageCheck, ShoppingCart, Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { formatearFecha } from '@/lib/utils'
import { exportarPlantillaCompras } from '@/lib/exportar'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'

type Solicitud = {
  id: string
  fecha: string
  tipo_elemento: string
  cantidad: number
  unidad_medida: string | null
  empresa: string | null
  observacion: string | null
  estado: 'pendiente' | 'solicitado' | 'recibido'
  inspeccion_id: string
  inspecciones: { empresa: string | null; sede: string | null; tipo_inspeccion_id: string; tipos_inspeccion: { nombre: string } | null } | null
}

type InspeccionOpcion = { id: string; fecha_inspeccion: string; empresa: string | null; sede: string | null; tipos_inspeccion: { nombre: string } | null }

const TODOS = '__todos__'
const TONO_ESTADO = { pendiente: 'advertencia', solicitado: 'info', recibido: 'exito' } as const
const ETIQUETA_ESTADO = { pendiente: 'Pendiente', solicitado: 'Solicitado', recibido: 'Recibido' } as const

const FORM_VACIO = {
  inspeccion_id: '',
  fecha: new Date().toISOString().slice(0, 10),
  tipo_elemento: '',
  cantidad: '1',
  unidad_medida: '',
  empresa: '',
  observacion: '',
  estado: 'pendiente' as Solicitud['estado'],
}

export default function SolicitudesCompra() {
  const { session, perfil } = useAuth()
  const esAdmin = perfil?.role === 'admin'

  const [filas, setFilas] = useState<Solicitud[]>([])
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [tipoId, setTipoId] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [generando, setGenerando] = useState(false)

  const [inspeccionesOpciones, setInspeccionesOpciones] = useState<InspeccionOpcion[]>([])
  const [empresas, setEmpresas] = useState<string[]>([])
  const [unidades, setUnidades] = useState<string[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Solicitud | null>(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Solicitud | null>(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    supabase.from('tipos_inspeccion').select('*').eq('activo', true).order('orden').then(({ data }) => setTipos((data ?? []) as TipoInspeccion[]))
    supabase
      .from('inspecciones')
      .select('id,fecha_inspeccion,empresa,sede,tipos_inspeccion(nombre)')
      .order('fecha_inspeccion', { ascending: false })
      .limit(100)
      .then(({ data }) => setInspeccionesOpciones((data ?? []) as unknown as InspeccionOpcion[]))
    supabase.from('empresas').select('nombre').eq('activo', true).order('orden').then(({ data }) => setEmpresas((data ?? []).map((e) => e.nombre)))
    supabase.from('unidades_medida').select('nombre').eq('activo', true).order('orden').then(({ data }) => setUnidades((data ?? []).map((u) => u.nombre)))
  }, [])

  function cargar() {
    setCargando(true)
    let q = supabase
      .from('solicitudes_compra_item')
      .select('id,fecha,tipo_elemento,cantidad,unidad_medida,empresa,observacion,estado,inspeccion_id,inspecciones(empresa,sede,tipo_inspeccion_id,tipos_inspeccion(nombre))')
      .order('fecha', { ascending: false })
    if (estadoFiltro !== TODOS) q = q.eq('estado', estadoFiltro)
    if (desde) q = q.gte('fecha', desde)
    if (hasta) q = q.lte('fecha', hasta)
    q.then(({ data }) => {
      let resultado = (data ?? []) as unknown as Solicitud[]
      if (tipoId !== TODOS) resultado = resultado.filter((r) => r.inspecciones?.tipo_inspeccion_id === tipoId)
      setFilas(resultado)
      setCargando(false)
    })
  }

  useEffect(cargar, [tipoId, estadoFiltro, desde, hasta])

  const resumen = useMemo(() => {
    const pendientes = filas.filter((f) => f.estado === 'pendiente').length
    const solicitadas = filas.filter((f) => f.estado === 'solicitado').length
    const recibidas = filas.filter((f) => f.estado === 'recibido').length
    return { total: filas.length, pendientes, solicitadas, recibidas }
  }, [filas])

  function alternarSeleccion(id: string) {
    setSeleccionadas((prev) => {
      const copia = new Set(prev)
      if (copia.has(id)) copia.delete(id)
      else copia.add(id)
      return copia
    })
  }

  async function generarExcel() {
    const items = filas.filter((f) => seleccionadas.has(f.id))
    if (items.length === 0) return
    setGenerando(true)
    const { desbordados } = await exportarPlantillaCompras({
      solicitante: perfil?.nombre_completo ?? 'Sistema de Inspecciones SST',
      items: items.map((f) => ({
        tipo_elemento: f.tipo_elemento,
        cantidad: f.cantidad,
        unidad_medida: f.unidad_medida,
        observacion: f.observacion,
        empresa: f.empresa ?? f.inspecciones?.empresa ?? null,
        sede: f.inspecciones?.sede ?? null,
      })),
    })

    const idsPendientes = items.filter((f) => f.estado === 'pendiente').map((f) => f.id)
    if (idsPendientes.length > 0) {
      await supabase.from('solicitudes_compra_item').update({ estado: 'solicitado' }).in('id', idsPendientes)
    }
    setGenerando(false)
    setSeleccionadas(new Set())
    const textoBase = `Se generó la plantilla de Compras con ${items.length} ítem(s)${idsPendientes.length > 0 ? ` y se marcaron ${idsPendientes.length} como "Solicitado"` : ''}.`
    setMensaje({
      tipo: 'exito',
      titulo: 'Plantilla generada',
      texto:
        desbordados > 0
          ? `${textoBase} La plantilla oficial solo tiene 5 filas de ítems — ${desbordados} elemento(s) repetido(s) se listaron como texto adicional en la fila 5, columna "Especificaciones".`
          : textoBase,
    })
    cargar()
  }

  async function marcarRecibido(id: string) {
    await supabase.from('solicitudes_compra_item').update({ estado: 'recibido' }).eq('id', id)
    cargar()
  }

  function abrirNueva() {
    setEditando(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  function abrirEditar(f: Solicitud) {
    setEditando(f)
    setForm({
      inspeccion_id: f.inspeccion_id,
      fecha: f.fecha,
      tipo_elemento: f.tipo_elemento,
      cantidad: String(f.cantidad),
      unidad_medida: f.unidad_medida ?? '',
      empresa: f.empresa ?? '',
      observacion: f.observacion ?? '',
      estado: f.estado,
    })
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!editando && !form.inspeccion_id) return
    setGuardando(true)
    const payload = {
      fecha: form.fecha,
      tipo_elemento: form.tipo_elemento,
      cantidad: Number(form.cantidad) || 1,
      unidad_medida: form.unidad_medida || null,
      empresa: form.empresa || null,
      observacion: form.observacion || null,
      estado: form.estado,
    }
    const { error } = editando
      ? await supabase.from('solicitudes_compra_item').update(payload).eq('id', editando.id)
      : await supabase.from('solicitudes_compra_item').insert({ ...payload, inspeccion_id: form.inspeccion_id, created_by: session?.user.id })
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
    const { error } = await supabase.from('solicitudes_compra_item').delete().eq('id', aEliminar.id)
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
        titulo="Solicitudes de compra"
        acciones={
          esAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={abrirNueva}>
                <Plus />
                Nueva solicitud
              </Button>
              <Button size="sm" disabled={seleccionadas.size === 0} cargando={generando} onClick={generarExcel}>
                <FileSpreadsheet />
                Generar Excel para Compras {seleccionadas.size > 0 ? `(${seleccionadas.size})` : ''}
              </Button>
            </>
          )
        }
      />
      <p className="mb-4 text-sm text-muted-foreground">
        Elementos registrados desde cada ronda de inspección para reponer o adquirir. Selecciona los que vas a enviar y genera el Excel para
        Compras — quedan marcados como "Solicitado" automáticamente.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Total" valor={resumen.total} icono={ShoppingCart} color="azul" />
        <MetricCard titulo="Pendientes" valor={resumen.pendientes} icono={ShoppingCart} color="ambar" />
        <MetricCard titulo="Solicitadas" valor={resumen.solicitadas} icono={ShoppingCart} color="verde" />
        <MetricCard titulo="Recibidas" valor={resumen.recibidas} icono={PackageCheck} color="verde" />
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
              <SelectItem value="solicitado">Solicitado</SelectItem>
              <SelectItem value="recibido">Recibido</SelectItem>
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
                {esAdmin && (
                  <th className="w-8 px-3 py-1.5">
                    <Checkbox
                      checked={filas.length > 0 && seleccionadas.size === filas.length}
                      onCheckedChange={(v) => setSeleccionadas(v === true ? new Set(filas.map((f) => f.id)) : new Set())}
                    />
                  </th>
                )}
                <th className="px-3 py-1.5 font-semibold">Fecha</th>
                <th className="px-3 py-1.5 font-semibold">Ronda</th>
                <th className="px-3 py-1.5 font-semibold">Empresa / Sede</th>
                <th className="px-3 py-1.5 font-semibold">Elemento</th>
                <th className="px-3 py-1.5 font-semibold">Cant.</th>
                <th className="px-3 py-1.5 font-semibold">UM</th>
                <th className="px-3 py-1.5 font-semibold">Observación</th>
                <th className="px-3 py-1.5 font-semibold">Estado</th>
                {esAdmin && <th className="px-3 py-1.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={f.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                  {esAdmin && (
                    <td className="px-3 py-1.5">
                      <Checkbox checked={seleccionadas.has(f.id)} onCheckedChange={() => alternarSeleccion(f.id)} />
                    </td>
                  )}
                  <td className="px-3 py-1.5">{formatearFecha(f.fecha)}</td>
                  <td className="px-3 py-1.5">
                    <Link to={`/inspecciones/${f.inspeccion_id}`} className="hover:underline">
                      {f.inspecciones?.tipos_inspeccion?.nombre ?? '—'}
                    </Link>
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {f.empresa ?? f.inspecciones?.empresa ?? '—'} {f.inspecciones?.sede ? `· ${f.inspecciones.sede}` : ''}
                  </td>
                  <td className="px-3 py-1.5">{f.tipo_elemento}</td>
                  <td className="px-3 py-1.5 text-right tabular">{f.cantidad}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{f.unidad_medida ?? '—'}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{f.observacion ?? '—'}</td>
                  <td className="px-3 py-1.5">
                    <Badge tono={TONO_ESTADO[f.estado]}>{ETIQUETA_ESTADO[f.estado]}</Badge>
                  </td>
                  {esAdmin && (
                    <td className="px-3 py-1.5">
                      <div className="flex justify-end gap-1">
                        {f.estado === 'solicitado' && (
                          <Button variant="ghost" size="icon" title="Marcar recibido" onClick={() => marcarRecibido(f.id)}>
                            <PackageCheck className="size-3.5 text-[var(--exito)]" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => abrirEditar(f)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Eliminar" onClick={() => setAEliminar(f)}>
                          <Trash2 className="size-3.5 text-[var(--error)]" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={esAdmin ? 10 : 8} className="px-3 py-6 text-center text-muted-foreground">
                    Sin solicitudes con estos filtros.
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
              <ShoppingCart className="size-5 text-white" />
              <DialogTitle className="text-white">{editando ? 'Editar solicitud' : 'Nueva solicitud'}</DialogTitle>
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
              <div className="space-y-1.5">
                <Label htmlFor="sol-fecha">Fecha</Label>
                <Input id="sol-fecha" type="date" required value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Empresa</Label>
                <Select value={form.empresa} onValueChange={(v) => setForm((f) => ({ ...f, empresa: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sol-estado">Estado</Label>
                <Select value={form.estado} onValueChange={(v) => setForm((f) => ({ ...f, estado: v as Solicitud['estado'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="solicitado">Solicitado</SelectItem>
                    <SelectItem value="recibido">Recibido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="sol-elemento">Elemento</Label>
                <Input id="sol-elemento" required value={form.tipo_elemento} onChange={(e) => setForm((f) => ({ ...f, tipo_elemento: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sol-cantidad">Cantidad</Label>
                <Input id="sol-cantidad" type="number" min="0" step="any" required value={form.cantidad} onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Unidad de medida</Label>
                <Select value={form.unidad_medida} onValueChange={(v) => setForm((f) => ({ ...f, unidad_medida: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="UM" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="sol-obs">Observación</Label>
                <Input id="sol-obs" value={form.observacion} onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))} />
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
        titulo="Eliminar solicitud"
        descripcion="Esta acción no se puede deshacer."
        cargando={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
