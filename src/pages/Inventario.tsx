import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Flame, Syringe, FileSpreadsheet } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { formatearFecha } from '@/lib/utils'
import { exportarExcel } from '@/lib/exportar'
import { estadoVencimiento, ETIQUETA_VENCIMIENTO, TONO_VENCIMIENTO } from '@/lib/inventario'
import {
  ETIQUETA_TIPO_BOTIQUIN,
  DESCRIPCION_TIPO_BOTIQUIN,
  leerAtributosBotiquin,
  type TipoBotiquin,
  type ElementoBotiquin,
} from '@/lib/botiquines'
import { IconoElementoBotiquin } from '@/components/inventario/IconoElementoBotiquin'
import { CampoListaOtra } from '@/components/inventario/CampoListaOtra'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const TODOS = '__todos__'

export default function Inventario() {
  const { perfil } = useAuth()
  const puedeEscribir = perfil?.role === 'admin' || perfil?.role === 'inspector'

  const [empresasCatalogo, setEmpresasCatalogo] = useState<string[]>([])
  const [sedesCatalogo, setSedesCatalogo] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('empresas').select('nombre').eq('activo', true).order('orden'),
      supabase.from('sedes').select('nombre').eq('activo', true).order('orden'),
    ]).then(([empresasRes, sedesRes]) => {
      setEmpresasCatalogo((empresasRes.data ?? []).map((e) => e.nombre))
      setSedesCatalogo((sedesRes.data ?? []).map((s) => s.nombre))
    })
  }, [])

  return (
    <div>
      <PageHeader titulo="Inventario" />
      <p className="mb-4 text-sm text-muted-foreground">
        Inventario de equipos de seguridad de la clínica, por empresa y sede. Los códigos que aquí se registran son los que se ofrecen al
        diligenciar las rondas correspondientes.
      </p>

      <Tabs defaultValue="extintores">
        <TabsList>
          <TabsTrigger value="extintores" className="inline-flex items-center gap-1.5">
            <Flame className="size-3.5" />
            Extintores
          </TabsTrigger>
          <TabsTrigger value="botiquines" className="inline-flex items-center gap-1.5">
            <Syringe className="size-3.5" />
            Botiquines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extintores">
          <SeccionExtintores puedeEscribir={puedeEscribir} empresasCatalogo={empresasCatalogo} sedesCatalogo={sedesCatalogo} />
        </TabsContent>
        <TabsContent value="botiquines">
          <SeccionBotiquines puedeEscribir={puedeEscribir} empresasCatalogo={empresasCatalogo} sedesCatalogo={sedesCatalogo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Extintores
// ════════════════════════════════════════════════════════════════

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

const VACIO_EXTINTOR: Omit<Extintor, 'id' | 'activo'> = {
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

function SeccionExtintores({ puedeEscribir, sedesCatalogo }: { puedeEscribir: boolean; empresasCatalogo: string[]; sedesCatalogo: string[] }) {
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
  const [form, setForm] = useState(VACIO_EXTINTOR)
  const [sedeEsOtra, setSedeEsOtra] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [aEliminar, setAEliminar] = useState<Extintor | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from('inventario_equipos')
      .select('*')
      .eq('tipo_equipo', 'extintor')
      .order('codigo')
      .then(({ data }) => {
        setItems((data ?? []) as Extintor[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  function abrirNuevo() {
    setEditando(null)
    setForm(VACIO_EXTINTOR)
    setSedeEsOtra(false)
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
    setSedeEsOtra(!!item.sede && !sedesCatalogo.includes(item.sede))
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const payload = {
      tipo_equipo: 'extintor',
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
      ? await supabase.from('inventario_equipos').update(payload).eq('id', editando.id)
      : await supabase.from('inventario_equipos').insert(payload)
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setModalAbierto(false)
    cargar()
  }

  async function alternarActivo(item: Extintor) {
    await supabase.from('inventario_equipos').update({ activo: !item.activo }).eq('id', item.id)
    cargar()
  }

  async function eliminar() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.from('inventario_equipos').delete().eq('id', aEliminar.id)
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
      <Tabs defaultValue="listado">
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3 shadow-relieve-sm">
          <TabsList>
            <TabsTrigger value="listado">Listado</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>
          <div className="mx-1 hidden h-8 w-px self-end bg-border sm:block" />
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
          {puedeEscribir && (
            <Button size="sm" className="ml-auto" onClick={abrirNuevo}>
              <Plus />
              Nuevo extintor
            </Button>
          )}
        </div>

        <TabsContent value="listado">
          <Card className="overflow-x-auto">
            {cargando ? (
              <div className="p-4">
                <SkeletonTabla filas={8} columnas={7} />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="franja-institucional text-left text-xs text-white">
                    <th className="px-3 py-1.5 font-semibold">Código</th>
                    <th className="px-3 py-1.5 font-semibold">Sede</th>
                    <th className="px-3 py-1.5 font-semibold">Ubicación</th>
                    <th className="px-3 py-1.5 font-semibold">Agente</th>
                    <th className="px-3 py-1.5 font-semibold">Tipo</th>
                    <th className="px-3 py-1.5 font-semibold">Capacidad</th>
                    <th className="px-3 py-1.5 font-semibold">Vencimiento</th>
                    <th className="px-3 py-1.5 font-semibold">Estado</th>
                    {puedeEscribir && <th className="px-3 py-1.5 font-semibold"></th>}
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
                        <td className="px-3 py-1.5 font-medium">{item.codigo}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{item.sede ?? '—'}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{item.ubicacion ?? '—'}</td>
                        <td className="px-3 py-1.5">{item.agente_extintor ?? '—'}</td>
                        <td className="px-3 py-1.5">{item.tipo ?? '—'}</td>
                        <td className="px-3 py-1.5">{item.capacidad ?? '—'}</td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            {item.fecha_vencimiento ?? '—'}
                            <Badge tono={TONO_VENCIMIENTO[venc]}>{ETIQUETA_VENCIMIENTO[venc]}</Badge>
                          </div>
                        </td>
                        <td className="px-3 py-1.5">
                          <button onClick={() => puedeEscribir && alternarActivo(item)} disabled={!puedeEscribir} className="disabled:cursor-not-allowed">
                            <Badge tono={item.activo ? 'exito' : 'neutro'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge>
                          </button>
                        </td>
                        {puedeEscribir && (
                          <td className="px-3 py-1.5">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => abrirEditar(item)}>
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setAEliminar(item)}>
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
                      <td colSpan={puedeEscribir ? 9 : 8} className="px-3 py-6 text-center text-muted-foreground">
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
            <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
              <Flame className="size-5 text-white" />
              <DialogTitle className="text-white">{editando ? 'Editar extintor' : 'Nuevo extintor'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ext-codigo">Código</Label>
                <Input id="ext-codigo" required value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ext-sede">Sede</Label>
                <CampoListaOtra
                  id="ext-sede"
                  opciones={sedesCatalogo}
                  value={form.sede ?? ''}
                  onChange={(v) => setForm((f) => ({ ...f, sede: v }))}
                  esOtra={sedeEsOtra}
                  onEsOtraChange={setSedeEsOtra}
                  placeholder="Sede"
                />
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

// ════════════════════════════════════════════════════════════════
// Botiquines
// ════════════════════════════════════════════════════════════════

type Botiquin = {
  id: string
  codigo: string
  empresa: string | null
  sede: string | null
  piso: string | null
  ubicacion: string | null
  fecha_vencimiento: string | null
  activo: boolean
  atributos: unknown
}

const VACIO_BOTIQUIN = {
  codigo: '',
  empresa: '',
  sede: '',
  piso: '',
  ubicacion: '',
  fecha_vencimiento: '',
  tipo_botiquin: 'A' as TipoBotiquin,
  elementos_faltantes: new Set<string>(),
}

function SeccionBotiquines({
  puedeEscribir,
  empresasCatalogo,
  sedesCatalogo,
}: {
  puedeEscribir: boolean
  empresasCatalogo: string[]
  sedesCatalogo: string[]
}) {
  const [items, setItems] = useState<Botiquin[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [sedeFiltro, setSedeFiltro] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)

  const [catalogoElementos, setCatalogoElementos] = useState<ElementoBotiquin[]>([])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Botiquin | null>(null)
  const [form, setForm] = useState(VACIO_BOTIQUIN)
  const [empresaEsOtra, setEmpresaEsOtra] = useState(false)
  const [sedeEsOtra, setSedeEsOtra] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [verContenido, setVerContenido] = useState<Botiquin | null>(null)
  const [aEliminar, setAEliminar] = useState<Botiquin | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from('inventario_equipos')
      .select('id,codigo,empresa,sede,piso,ubicacion,fecha_vencimiento,activo,atributos')
      .eq('tipo_equipo', 'botiquin')
      .order('codigo')
      .then(({ data }) => {
        setItems((data ?? []) as Botiquin[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  useEffect(() => {
    supabase
      .from('catalogo_elementos_botiquin')
      .select('id,nombre,cantidad,forma')
      .eq('activo', true)
      .order('orden')
      .then(({ data }) => setCatalogoElementos((data ?? []) as ElementoBotiquin[]))
  }, [])

  function abrirNuevo() {
    setEditando(null)
    setForm(VACIO_BOTIQUIN)
    setEmpresaEsOtra(false)
    setSedeEsOtra(false)
    setModalAbierto(true)
  }

  function abrirEditar(item: Botiquin) {
    const atributos = leerAtributosBotiquin(item.atributos)
    setEditando(item)
    setForm({
      codigo: item.codigo,
      empresa: item.empresa ?? '',
      sede: item.sede ?? '',
      piso: item.piso ?? '',
      ubicacion: item.ubicacion ?? '',
      fecha_vencimiento: item.fecha_vencimiento ?? '',
      tipo_botiquin: atributos.tipo_botiquin,
      elementos_faltantes: new Set(atributos.elementos_faltantes),
    })
    setEmpresaEsOtra(!!item.empresa && !empresasCatalogo.includes(item.empresa))
    setSedeEsOtra(!!item.sede && !sedesCatalogo.includes(item.sede))
    setModalAbierto(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const payload = {
      tipo_equipo: 'botiquin',
      codigo: form.codigo,
      empresa: form.empresa || null,
      sede: form.sede || null,
      piso: form.piso || null,
      ubicacion: form.ubicacion || null,
      fecha_vencimiento: form.fecha_vencimiento || null,
      atributos: { tipo_botiquin: form.tipo_botiquin, elementos_faltantes: Array.from(form.elementos_faltantes) },
    }
    const { error } = editando
      ? await supabase.from('inventario_equipos').update(payload).eq('id', editando.id)
      : await supabase.from('inventario_equipos').insert(payload)
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setModalAbierto(false)
    cargar()
  }

  async function alternarActivo(item: Botiquin) {
    await supabase.from('inventario_equipos').update({ activo: !item.activo }).eq('id', item.id)
    cargar()
  }

  async function eliminar() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.from('inventario_equipos').delete().eq('id', aEliminar.id)
    setEliminando(false)
    setAEliminar(null)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo eliminar', texto: error.message })
      return
    }
    cargar()
  }

  const sedes = useMemo(() => Array.from(new Set(items.map((i) => i.sede).filter((s): s is string => !!s))).sort(), [items])

  const filtrados = items.filter((i) => {
    if (sedeFiltro !== TODOS && i.sede !== sedeFiltro) return false
    if (estadoFiltro === 'con_faltantes' && leerAtributosBotiquin(i.atributos).elementos_faltantes.length === 0) return false
    if (estadoFiltro !== TODOS && estadoFiltro !== 'con_faltantes' && estadoVencimiento(i.fecha_vencimiento) !== estadoFiltro) return false
    const q = busqueda.trim().toLowerCase()
    if (q && ![i.codigo, i.sede, i.ubicacion].some((v) => v?.toLowerCase().includes(q))) return false
    return true
  })

  const estadisticas = useMemo(() => {
    const vencidos = filtrados.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vencido').length
    const conFaltantes = filtrados.filter((i) => leerAtributosBotiquin(i.atributos).elementos_faltantes.length > 0).length
    const completos = filtrados.filter((i) => leerAtributosBotiquin(i.atributos).elementos_faltantes.length === 0).length
    return { total: filtrados.length, vencidos, conFaltantes, completos }
  }, [filtrados])

  async function exportar() {
    await exportarExcel({
      nombreArchivo: 'inventario_botiquines',
      titulo: 'Inventario de botiquines — SST',
      subtitulo: `Sede: ${sedeFiltro === TODOS ? 'Todas' : sedeFiltro}`,
      columnas: [
        { header: 'Código', key: 'codigo', width: 14 },
        { header: 'Empresa', key: 'empresa', width: 18 },
        { header: 'Sede', key: 'sede', width: 24 },
        { header: 'Piso', key: 'piso', width: 10 },
        { header: 'Ubicación', key: 'ubicacion', width: 26 },
        { header: 'Tipo', key: 'tipo_botiquin', width: 10 },
        { header: 'Vencimiento', key: 'vencimiento', width: 14 },
        { header: 'Estado', key: 'estado', width: 16 },
        { header: 'Elementos faltantes', key: 'faltantes', width: 40 },
      ],
      filas: filtrados.map((i) => {
        const atributos = leerAtributosBotiquin(i.atributos)
        const faltantes = atributos.elementos_faltantes
          .map((id) => catalogoElementos.find((e) => e.id === id)?.nombre ?? id)
          .join(', ')
        return {
          codigo: i.codigo,
          empresa: i.empresa ?? '—',
          sede: i.sede ?? '—',
          piso: i.piso ?? '—',
          ubicacion: i.ubicacion ?? '—',
          tipo_botiquin: ETIQUETA_TIPO_BOTIQUIN[atributos.tipo_botiquin],
          vencimiento: formatearFecha(i.fecha_vencimiento),
          estado: ETIQUETA_VENCIMIENTO[estadoVencimiento(i.fecha_vencimiento)],
          faltantes: faltantes || 'Completo',
        }
      }),
    })
  }

  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground">
        Contenido según la Resolución 705 de 2007 (Ministerio de Protección Social) — el catálogo de elementos se administra en{' '}
        <span className="font-medium">Administración → Catálogos</span>. Al hacer la ronda, marca en cada botiquín los elementos que hagan
        falta o estén vencidos — quedan visibles aquí como pendientes de reponer, para reportarlos a Compras.
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <FilterBar className="mb-0 flex-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Buscar</Label>
            <Input placeholder="Código, sede, ubicación…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="h-8 w-44 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sede</Label>
            <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
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
                <SelectItem value="con_faltantes">Con faltantes</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="proximo">Próximo a vencer</SelectItem>
                <SelectItem value="vigente">Vigente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={filtrados.length === 0} onClick={exportar}>
            <FileSpreadsheet />
            Exportar Excel
          </Button>
          {puedeEscribir && (
            <Button size="sm" onClick={abrirNuevo}>
              <Plus />
              Nuevo botiquín
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Total botiquines" valor={estadisticas.total} icono={Syringe} color="azul" />
        <MetricCard titulo="Completos" valor={estadisticas.completos} icono={Syringe} color="verde" />
        <MetricCard titulo="Con faltantes" valor={estadisticas.conFaltantes} icono={Syringe} color="ambar" />
        <MetricCard titulo="Vencidos" valor={estadisticas.vencidos} icono={Syringe} color="rojo" />
      </div>

      <Card className="overflow-x-auto">
        {cargando ? (
          <div className="p-4">
            <SkeletonTabla filas={6} columnas={8} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="franja-institucional text-left text-xs text-white">
                <th className="px-3 py-1.5 font-semibold">Código</th>
                <th className="px-3 py-1.5 font-semibold">Sede</th>
                <th className="px-3 py-1.5 font-semibold">Ubicación</th>
                <th className="px-3 py-1.5 font-semibold">Tipo</th>
                <th className="px-3 py-1.5 font-semibold">Vencimiento</th>
                <th className="px-3 py-1.5 font-semibold">Contenido</th>
                <th className="px-3 py-1.5 font-semibold">Estado</th>
                <th className="px-3 py-1.5 font-semibold">Activo</th>
                {puedeEscribir && <th className="px-3 py-1.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item, i) => {
                const venc = estadoVencimiento(item.fecha_vencimiento)
                const atributos = leerAtributosBotiquin(item.atributos)
                const faltan = atributos.elementos_faltantes.length
                return (
                  <tr key={item.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                    <td className="px-3 py-1.5 font-medium">{item.codigo}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{item.sede ?? '—'}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{item.ubicacion ?? '—'}</td>
                    <td className="px-3 py-1.5">{ETIQUETA_TIPO_BOTIQUIN[atributos.tipo_botiquin]}</td>
                    <td className="px-3 py-1.5">{item.fecha_vencimiento ?? '—'}</td>
                    <td className="px-3 py-1.5">
                      <button className="cursor-pointer" onClick={() => setVerContenido(item)}>
                        <Badge tono={faltan > 0 ? 'advertencia' : 'exito'}>{faltan > 0 ? `${faltan} faltante${faltan > 1 ? 's' : ''}` : 'Completo'}</Badge>
                      </button>
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge tono={TONO_VENCIMIENTO[venc]}>{ETIQUETA_VENCIMIENTO[venc]}</Badge>
                    </td>
                    <td className="px-3 py-1.5">
                      <button onClick={() => puedeEscribir && alternarActivo(item)} disabled={!puedeEscribir} className="disabled:cursor-not-allowed">
                        <Badge tono={item.activo ? 'exito' : 'neutro'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </button>
                    </td>
                    {puedeEscribir && (
                      <td className="px-3 py-1.5">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => abrirEditar(item)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setAEliminar(item)}>
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
                  <td colSpan={puedeEscribir ? 9 : 8} className="px-3 py-6 text-center text-muted-foreground">
                    Sin registros con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <button
        type="button"
        className="mt-3 text-xs font-medium text-[var(--cac-azul)] hover:underline"
        onClick={() => setVerContenido({ id: '', codigo: '', empresa: null, sede: null, piso: null, ubicacion: null, fecha_vencimiento: null, activo: true, atributos: {} })}
      >
        Ver catálogo de elementos de referencia
      </button>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={guardar}>
            <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
              <Syringe className="size-5 text-white" />
              <DialogTitle className="text-white">{editando ? 'Editar botiquín' : 'Nuevo botiquín'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bot-codigo">Código</Label>
                <Input id="bot-codigo" required placeholder="BOT-TOR-1-01" value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bot-empresa">Empresa</Label>
                <CampoListaOtra
                  id="bot-empresa"
                  opciones={empresasCatalogo}
                  value={form.empresa}
                  onChange={(v) => setForm((f) => ({ ...f, empresa: v }))}
                  esOtra={empresaEsOtra}
                  onEsOtraChange={setEmpresaEsOtra}
                  placeholder="Empresa"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bot-sede">Sede</Label>
                <CampoListaOtra
                  id="bot-sede"
                  opciones={sedesCatalogo}
                  value={form.sede}
                  onChange={(v) => setForm((f) => ({ ...f, sede: v }))}
                  esOtra={sedeEsOtra}
                  onEsOtraChange={setSedeEsOtra}
                  placeholder="Sede"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bot-piso">Piso</Label>
                <Input id="bot-piso" value={form.piso} onChange={(e) => setForm((f) => ({ ...f, piso: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bot-ubicacion">Ubicación</Label>
                <Input id="bot-ubicacion" value={form.ubicacion} onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de botiquín</Label>
                <Select value={form.tipo_botiquin} onValueChange={(v) => setForm((f) => ({ ...f, tipo_botiquin: v as TipoBotiquin }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['A', 'B', 'C'] as TipoBotiquin[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {ETIQUETA_TIPO_BOTIQUIN[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bot-vencimiento" className="block">
                  Próximo vencimiento
                  <span className="block text-xs font-normal text-muted-foreground">(elemento más próximo a vencer)</span>
                </Label>
                <Input id="bot-vencimiento" type="date" value={form.fecha_vencimiento} onChange={(e) => setForm((f) => ({ ...f, fecha_vencimiento: e.target.value }))} />
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-1.5 block">Contenido — desmarca lo que haga falta o esté vencido</Label>
              <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-border p-2.5 sm:grid-cols-2">
                {catalogoElementos.map((elemento) => {
                  const presente = !form.elementos_faltantes.has(elemento.id)
                  return (
                    <label key={elemento.id} className="flex items-center gap-2 rounded-md p-1 text-xs hover:bg-accent/50">
                      <Checkbox
                        checked={presente}
                        onCheckedChange={(v) =>
                          setForm((f) => {
                            const copia = new Set(f.elementos_faltantes)
                            if (v === true) copia.delete(elemento.id)
                            else copia.add(elemento.id)
                            return { ...f, elementos_faltantes: copia }
                          })
                        }
                      />
                      <IconoElementoBotiquin forma={elemento.forma} size={22} />
                      <span className="min-w-0">
                        <span className="block font-medium">{elemento.nombre}</span>
                        <span className="block text-muted-foreground">{elemento.cantidad}</span>
                      </span>
                    </label>
                  )
                })}
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

      <Dialog open={verContenido !== null} onOpenChange={(v) => !v && setVerContenido(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
            <Syringe className="size-5 text-white" />
            <DialogTitle className="text-white">{verContenido?.codigo ? `Contenido — ${verContenido.codigo}` : 'Catálogo de elementos'}</DialogTitle>
          </DialogHeader>
          {verContenido?.codigo && (
            <p className="mb-2 text-xs text-muted-foreground">{DESCRIPCION_TIPO_BOTIQUIN[leerAtributosBotiquin(verContenido.atributos).tipo_botiquin]}</p>
          )}
          <div className="space-y-1">
            {catalogoElementos.map((elemento) => {
              const faltante = verContenido?.codigo ? leerAtributosBotiquin(verContenido.atributos).elementos_faltantes.includes(elemento.id) : false
              return (
                <div key={elemento.id} className="flex items-center gap-2.5 rounded-lg border border-border/60 p-1.5">
                  <IconoElementoBotiquin forma={elemento.forma} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{elemento.nombre}</div>
                    <div className="text-xs text-muted-foreground">{elemento.cantidad}</div>
                  </div>
                  {verContenido?.codigo && <Badge tono={faltante ? 'error' : 'exito'}>{faltante ? 'Falta' : 'OK'}</Badge>}
                </div>
              )
            })}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setVerContenido(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={aEliminar !== null}
        titulo={`Eliminar "${aEliminar?.codigo}"`}
        descripcion="Esta acción no se puede deshacer."
        cargando={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
