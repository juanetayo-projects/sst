import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Flame } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { supabase } from '@/lib/supabase'
import { estadoVencimiento, ETIQUETA_VENCIMIENTO, TONO_VENCIMIENTO } from '@/lib/inventario'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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

const TODOS = '__todos__'

export default function Inventario() {
  const [items, setItems] = useState<Extintor[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [sedeFiltro, setSedeFiltro] = useState(TODOS)
  const [pisoFiltro, setPisoFiltro] = useState(TODOS)
  const [agenteFiltro, setAgenteFiltro] = useState(TODOS)
  const [tipoFiltro, setTipoFiltro] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)

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

  const sedes = useMemo(() => Array.from(new Set(items.map((i) => i.sede).filter((s): s is string => !!s))).sort(), [items])
  const pisos = useMemo(() => Array.from(new Set(items.map((i) => i.piso).filter((s): s is string => !!s))).sort(), [items])
  const agentes = useMemo(() => Array.from(new Set(items.map((i) => i.agente_extintor).filter((s): s is string => !!s))).sort(), [items])
  const tiposExtintor = useMemo(() => Array.from(new Set(items.map((i) => i.tipo).filter((s): s is string => !!s))).sort(), [items])

  const filtrados = items.filter((i) => {
    if (sedeFiltro !== TODOS && i.sede !== sedeFiltro) return false
    if (pisoFiltro !== TODOS && i.piso !== pisoFiltro) return false
    if (agenteFiltro !== TODOS && i.agente_extintor !== agenteFiltro) return false
    if (tipoFiltro !== TODOS && i.tipo !== tipoFiltro) return false
    if (estadoFiltro !== TODOS && estadoVencimiento(i.fecha_vencimiento) !== estadoFiltro) return false
    const q = busqueda.trim().toLowerCase()
    if (q && ![i.codigo, i.sede, i.ubicacion, i.tipo].some((v) => v?.toLowerCase().includes(q))) return false
    return true
  })

  const estadisticas = useMemo(() => {
    const vencidos = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vencido').length
    const proximos = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'proximo').length
    const vigentes = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vigente').length
    return { total: filtrados.length, vencidos, proximos, vigentes }
  }, [filtrados])

  const porSede = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const i of filtrados) {
      const s = i.sede ?? 'Sin sede'
      conteo.set(s, (conteo.get(s) ?? 0) + 1)
    }
    return Array.from(conteo.entries())
      .map(([sede, total]) => ({ sede, total }))
      .sort((a, b) => b.total - a.total)
  }, [filtrados])

  const porTipo = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const i of filtrados) {
      const t = i.tipo ?? 'Sin definir'
      conteo.set(t, (conteo.get(t) ?? 0) + 1)
    }
    return Array.from(conteo.entries()).map(([tipo, total]) => ({ tipo, total }))
  }, [filtrados])

  const porAgente = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const i of filtrados) {
      const a = i.agente_extintor ?? 'Sin definir'
      conteo.set(a, (conteo.get(a) ?? 0) + 1)
    }
    return Array.from(conteo.entries()).map(([agente, total]) => ({ agente, total }))
  }, [filtrados])

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

      <p className="mb-4 text-sm text-muted-foreground">
        Estos códigos son los que se ofrecen al diligenciar la Ronda de Extintores — al elegir un código se autocompletan
        el tipo y la capacidad en el formulario.
      </p>

      <Tabs defaultValue="listado">
        <TabsList>
          <TabsTrigger value="listado">Listado</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="listado">
          <FilterBar className="mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Buscar</Label>
              <Input placeholder="Código, sede, ubicación…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="h-8 w-44 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sede</Label>
              <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
                <SelectTrigger className="h-8 w-36 text-xs">
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
              <Label className="text-xs">Piso</Label>
              <Select value={pisoFiltro} onValueChange={setPisoFiltro}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {pisos.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Agente</Label>
              <Select value={agenteFiltro} onValueChange={setAgenteFiltro}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {agentes.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {tiposExtintor.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vencimiento</Label>
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger className="h-8 w-36 text-xs">
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
                  {filtrados.map((item, i) => {
                    const venc = estadoVencimiento(item.fecha_vencimiento)
                    return (
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
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {item.fecha_vencimiento ?? '—'}
                            <Badge tono={TONO_VENCIMIENTO[venc]}>{ETIQUETA_VENCIMIENTO[venc]}</Badge>
                          </div>
                        </td>
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
                    )
                  })}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">
                        Sin registros con estos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard titulo="Total extintores" valor={estadisticas.total} icono={Flame} color="azul" />
              <MetricCard titulo="Vigentes" valor={estadisticas.vigentes} icono={Flame} color="verde" />
              <MetricCard titulo="Próximos a vencer" valor={estadisticas.proximos} icono={Flame} color="ambar" />
              <MetricCard titulo="Vencidos" valor={estadisticas.vencidos} icono={Flame} color="rojo" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Por sede</div>
                <Card>
                  <CardContent className="p-4">
                    <ResponsiveContainer width="100%" height={Math.max(160, porSede.length * 36)}>
                      <BarChart data={porSede} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="sede" width={170} tick={{ fontSize: 10.5 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} />
                        <Bar dataKey="total" fill="var(--cac-azul)" radius={[0, 6, 6, 0]}>
                          <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--foreground)' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
                <div>
                  <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Por tipo</div>
                  <Card>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={porTipo} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} />
                          <Line type="monotone" dataKey="total" name="Extintores" stroke="var(--cac-azul)" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Por agente extintor</div>
                  <Card>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={porAgente} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="agente" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} />
                          <Line type="monotone" dataKey="total" name="Extintores" stroke="var(--exito)" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
