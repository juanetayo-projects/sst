import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, ChevronLeft, ChevronRight, Trash2, CheckCircle2, XCircle, CalendarClock, CalendarCheck, CalendarX, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { cn, formatearFecha } from '@/lib/utils'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

type Programacion = {
  id: string
  tipo_inspeccion_id: string
  fecha_programada: string
  empresa: string | null
  sede: string | null
  responsable_id: string | null
  estado: 'pendiente' | 'realizada' | 'cancelada'
  notas: string | null
  tipos_inspeccion: { codigo: string; nombre: string } | null
  responsable: { nombre_completo: string } | null
}

const TODOS = '__todos__'
const hoyISO = new Date().toISOString().slice(0, 10)

function esVencida(p: Programacion) {
  return p.estado === 'pendiente' && p.fecha_programada < hoyISO
}

function EstadoBadge({ p }: { p: Programacion }) {
  if (p.estado === 'realizada') return <Badge tono="exito">Realizada</Badge>
  if (p.estado === 'cancelada') return <Badge tono="neutro">Cancelada</Badge>
  if (esVencida(p)) return <Badge tono="error">Vencida</Badge>
  return <Badge tono="advertencia">Pendiente</Badge>
}

/** Mini-calendario de un solo mes para elegir una fecha — usado dentro del modal "Programar ronda". */
function MiniCalendarioSeleccion({ valor, onSeleccionar }: { valor: string; onSeleccionar: (iso: string) => void }) {
  const inicial = valor ? new Date(`${valor}T00:00:00`) : new Date()
  const [mes, setMes] = useState({ y: inicial.getFullYear(), m: inicial.getMonth() })
  const primerDia = new Date(mes.y, mes.m, 1)
  const diasEnMes = new Date(mes.y, mes.m + 1, 0).getDate()
  const offset = (primerDia.getDay() + 6) % 7
  const celdas: (number | null)[] = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  return (
    <div className="w-full max-w-[260px] rounded-lg border border-border p-2">
      <div className="mb-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMes((s) => (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }))}
          className="rounded p-1 hover:bg-accent"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="text-xs font-medium capitalize">{format(new Date(mes.y, mes.m, 1), 'MMMM yyyy', { locale: es })}</span>
        <button
          type="button"
          onClick={() => setMes((s) => (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }))}
          className="rounded p-1 hover:bg-accent"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-muted-foreground">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {celdas.map((d, i) => {
          if (!d) return <div key={i} />
          const iso = `${mes.y}-${String(mes.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const activo = iso === valor
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSeleccionar(iso)}
              className={cn(
                'flex aspect-square items-center justify-center rounded text-xs transition-colors',
                activo ? 'bg-[var(--cac-azul)] font-bold text-white' : 'hover:bg-accent'
              )}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ProgramacionRondas() {
  const { session, perfil } = useAuth()
  const esAdmin = perfil?.role === 'admin'

  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [empresas, setEmpresas] = useState<string[]>([])
  const [sedes, setSedes] = useState<string[]>([])
  const [perfiles, setPerfiles] = useState<{ id: string; nombre_completo: string }[]>([])
  const [programaciones, setProgramaciones] = useState<Programacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [tipoId, setTipoId] = useState(TODOS)
  const [empresa, setEmpresa] = useState(TODOS)
  const [sede, setSede] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [hasta, setHasta] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 90)
    return d.toISOString().slice(0, 10)
  })

  const [mesCal, setMesCal] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [diaSeleccionado, setDiaSeleccionado] = useState<{ fecha: string; items: Programacion[] } | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [tiposSeleccionados, setTiposSeleccionados] = useState<Set<string>>(new Set())
  const [fechaProgramar, setFechaProgramar] = useState(hoyISO)
  const [empresaProgramar, setEmpresaProgramar] = useState('')
  const [sedeProgramar, setSedeProgramar] = useState('')
  const [responsableProgramar, setResponsableProgramar] = useState('')
  const [notasProgramar, setNotasProgramar] = useState('')
  const [guardandoProgramacion, setGuardandoProgramacion] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('tipos_inspeccion').select('*').eq('activo', true).order('orden'),
      supabase.from('empresas').select('nombre').eq('activo', true).order('orden'),
      supabase.from('sedes').select('nombre').eq('activo', true).order('orden'),
      supabase.from('profiles').select('id,nombre_completo').eq('activo', true).order('nombre_completo'),
    ]).then(([tiposRes, empresasRes, sedesRes, perfilesRes]) => {
      setTipos((tiposRes.data ?? []) as TipoInspeccion[])
      setEmpresas((empresasRes.data ?? []).map((e) => e.nombre))
      setSedes((sedesRes.data ?? []).map((s) => s.nombre))
      setPerfiles((perfilesRes.data ?? []) as { id: string; nombre_completo: string }[])
    })
  }, [])

  function cargar() {
    setCargando(true)
    let q = supabase
      .from('programaciones_ronda')
      .select('*, tipos_inspeccion(codigo,nombre), responsable:profiles!programaciones_ronda_responsable_id_fkey(nombre_completo)')
      .order('fecha_programada')
    if (tipoId !== TODOS) q = q.eq('tipo_inspeccion_id', tipoId)
    if (empresa !== TODOS) q = q.eq('empresa', empresa)
    if (sede !== TODOS) q = q.eq('sede', sede)
    if (estadoFiltro !== TODOS && estadoFiltro !== 'vencida') q = q.eq('estado', estadoFiltro)
    if (desde) q = q.gte('fecha_programada', desde)
    if (hasta) q = q.lte('fecha_programada', hasta)
    q.then(({ data }) => {
      let filas = (data ?? []) as unknown as Programacion[]
      if (estadoFiltro === 'vencida') filas = filas.filter(esVencida)
      setProgramaciones(filas)
      setCargando(false)
    })
  }

  useEffect(cargar, [tipoId, empresa, sede, estadoFiltro, desde, hasta])

  async function guardarProgramacion(e: FormEvent) {
    e.preventDefault()
    if (tiposSeleccionados.size === 0 || !session) return
    setGuardandoProgramacion(true)
    const filas = Array.from(tiposSeleccionados).map((tipo_inspeccion_id) => ({
      tipo_inspeccion_id,
      fecha_programada: fechaProgramar,
      empresa: empresaProgramar || null,
      sede: sedeProgramar || null,
      responsable_id: responsableProgramar || null,
      notas: notasProgramar || null,
      created_by: session.user.id,
    }))
    const { error } = await supabase.from('programaciones_ronda').insert(filas)
    setGuardandoProgramacion(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo programar', texto: error.message })
      return
    }
    setModalAbierto(false)
    setTiposSeleccionados(new Set())
    setNotasProgramar('')
    setMensaje({ tipo: 'exito', titulo: 'Ronda(s) programada(s)', texto: `Se programaron ${filas.length} ronda(s) para ${formatearFecha(fechaProgramar)}.` })
    cargar()
  }

  async function marcarRealizada(p: Programacion) {
    await supabase.from('programaciones_ronda').update({ estado: 'realizada' }).eq('id', p.id)
    cargar()
    setDiaSeleccionado(null)
  }
  async function cancelarProgramacion(p: Programacion) {
    await supabase.from('programaciones_ronda').update({ estado: 'cancelada' }).eq('id', p.id)
    cargar()
    setDiaSeleccionado(null)
  }
  async function eliminarProgramacion(p: Programacion) {
    await supabase.from('programaciones_ronda').delete().eq('id', p.id)
    cargar()
    setDiaSeleccionado(null)
  }

  // ── Calendario ──
  const cal = useMemo(() => {
    const primerDia = new Date(mesCal.y, mesCal.m, 1)
    const diasEnMes = new Date(mesCal.y, mesCal.m + 1, 0).getDate()
    const offset = (primerDia.getDay() + 6) % 7
    const porDia = new Map<number, Programacion[]>()
    for (const p of programaciones) {
      const d = new Date(`${p.fecha_programada}T00:00:00`)
      if (d.getFullYear() === mesCal.y && d.getMonth() === mesCal.m) {
        const lista = porDia.get(d.getDate()) ?? []
        lista.push(p)
        porDia.set(d.getDate(), lista)
      }
    }
    const celdas: ({ dia: number; items: Programacion[] } | null)[] = Array.from({ length: offset }, () => null)
    for (let dia = 1; dia <= diasEnMes; dia++) celdas.push({ dia, items: porDia.get(dia) ?? [] })
    return celdas
  }, [programaciones, mesCal])

  function colorDia(items: Programacion[]) {
    if (items.length === 0) return null
    if (items.some((p) => esVencida(p))) return { bg: 'var(--error-suave)', text: 'var(--error)' }
    if (items.some((p) => p.estado === 'pendiente')) return { bg: 'var(--advertencia-suave)', text: '#8a6400' }
    if (items.every((p) => p.estado === 'realizada')) return { bg: 'var(--exito-suave)', text: 'var(--exito)' }
    return { bg: 'var(--neutro-suave)', text: 'var(--neutro)' }
  }

  // ── Estadísticas ──
  const estadisticas = useMemo(() => {
    const activas = programaciones.filter((p) => p.estado !== 'cancelada')
    const realizadas = programaciones.filter((p) => p.estado === 'realizada').length
    const pct = activas.length === 0 ? 0 : Math.round((realizadas / activas.length) * 100)
    const vencidas = programaciones.filter(esVencida).length
    return { programadas: programaciones.length, realizadas, pct, vencidas }
  }, [programaciones])

  const porTipo = useMemo(() => {
    const mapa = new Map<string, { nombre: string; programadas: number; realizadas: number }>()
    for (const p of programaciones) {
      if (p.estado === 'cancelada') continue
      const nombre = p.tipos_inspeccion?.nombre ?? '—'
      const actual = mapa.get(nombre) ?? { nombre, programadas: 0, realizadas: 0 }
      actual.programadas += 1
      if (p.estado === 'realizada') actual.realizadas += 1
      mapa.set(nombre, actual)
    }
    return Array.from(mapa.values()).sort((a, b) => b.programadas - a.programadas)
  }, [programaciones])

  const listaVencidas = useMemo(() => programaciones.filter(esVencida), [programaciones])

  return (
    <div>
      <PageHeader
        titulo="Programación de rondas"
        acciones={
          esAdmin && (
            <Button size="sm" onClick={() => setModalAbierto(true)}>
              <Plus />
              Programar ronda
            </Button>
          )
        }
      />

      <FilterBar>
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={tipoId} onValueChange={setTipoId}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los tipos</SelectItem>
              {tipos.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Empresa</Label>
          <Select value={empresa} onValueChange={setEmpresa}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Sede</Label>
          <Select value={sede} onValueChange={setSede}>
            <SelectTrigger className="h-8 w-32 text-xs">
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
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="vencida">Vencida</SelectItem>
              <SelectItem value="realizada">Realizada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
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

      <Tabs defaultValue="calendario">
        <TabsList>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        {cargando ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
        ) : (
          <>
            <TabsContent value="calendario">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      className="rounded px-2 py-1 text-sm hover:bg-accent"
                      onClick={() => setMesCal((s) => (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }))}
                    >
                      ‹
                    </button>
                    <span className="text-sm font-semibold capitalize text-[var(--cac-azul)]">
                      {format(new Date(mesCal.y, mesCal.m, 1), 'MMMM yyyy', { locale: es })}
                    </span>
                    <button
                      className="rounded px-2 py-1 text-sm hover:bg-accent"
                      onClick={() => setMesCal((s) => (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }))}
                    >
                      ›
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {cal.map((c, i) => {
                      if (!c) return <div key={i} />
                      const color = colorDia(c.items)
                      return (
                        <button
                          key={i}
                          onClick={() => c.items.length > 0 && setDiaSeleccionado({ fecha: `${mesCal.y}-${String(mesCal.m + 1).padStart(2, '0')}-${String(c.dia).padStart(2, '0')}`, items: c.items })}
                          className={cn('flex aspect-square flex-col items-center justify-start gap-0.5 rounded p-1 text-xs', c.items.length > 0 ? 'cursor-pointer' : '')}
                          style={color ? { backgroundColor: color.bg, color: color.text } : undefined}
                        >
                          <span className="font-medium">{c.dia}</span>
                          {c.items.length > 0 && <span className="text-[10px] font-bold">{c.items.length}</span>}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tabla">
              <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="franja-institucional text-left text-xs text-white">
                      <th className="px-3 py-2.5 font-semibold">Fecha</th>
                      <th className="px-3 py-2.5 font-semibold">Tipo de ronda</th>
                      <th className="px-3 py-2.5 font-semibold">Empresa</th>
                      <th className="px-3 py-2.5 font-semibold">Sede</th>
                      <th className="px-3 py-2.5 font-semibold">Responsable</th>
                      <th className="px-3 py-2.5 font-semibold">Estado</th>
                      {esAdmin && <th className="px-3 py-2.5 font-semibold"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {programaciones.map((p, i) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                        <td className="px-3 py-2">{formatearFecha(p.fecha_programada)}</td>
                        <td className="px-3 py-2">{p.tipos_inspeccion?.nombre ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.empresa ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.sede ?? '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.responsable?.nombre_completo ?? '—'}</td>
                        <td className="px-3 py-2">
                          <EstadoBadge p={p} />
                        </td>
                        {esAdmin && (
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              {p.estado === 'pendiente' && (
                                <>
                                  <Button variant="ghost" size="icon" title="Marcar realizada" onClick={() => marcarRealizada(p)}>
                                    <CheckCircle2 className="size-3.5 text-[var(--exito)]" />
                                  </Button>
                                  <Button variant="ghost" size="icon" title="Cancelar" onClick={() => cancelarProgramacion(p)}>
                                    <XCircle className="size-3.5 text-muted-foreground" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="icon" title="Eliminar" onClick={() => eliminarProgramacion(p)}>
                                <Trash2 className="size-3.5 text-[var(--error)]" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {programaciones.length === 0 && (
                      <tr>
                        <td colSpan={esAdmin ? 7 : 6} className="px-3 py-6 text-center text-muted-foreground">
                          Sin rondas programadas con estos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </TabsContent>

            <TabsContent value="estadisticas">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard titulo="Programadas en el periodo" valor={estadisticas.programadas} icono={CalendarClock} color="azul" />
                  <MetricCard titulo="Realizadas" valor={estadisticas.realizadas} icono={CalendarCheck} color="verde" />
                  <MetricCard titulo="% Cumplimiento" valor={`${estadisticas.pct}%`} icono={Percent} color="ambar" />
                  <MetricCard titulo="Vencidas" valor={estadisticas.vencidas} icono={CalendarX} color="rojo" />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Programadas vs. realizadas por tipo de ronda</div>
                    <Card>
                      <CardContent className="p-4">
                        {porTipo.length === 0 ? (
                          <div className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground">Sin datos en el periodo.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={Math.max(160, porTipo.length * 40)}>
                            <BarChart data={porTipo} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                              <YAxis type="category" dataKey="nombre" width={150} tick={{ fontSize: 10.5 }} />
                              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Bar dataKey="programadas" name="Programadas" fill="var(--cac-azul)" radius={[0, 4, 4, 0]} />
                              <Bar dataKey="realizadas" name="Realizadas" fill="var(--exito)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Rondas vencidas</div>
                    <Card className="overflow-x-auto">
                      {listaVencidas.length === 0 ? (
                        <div className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground">Sin rondas vencidas en el periodo.</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="franja-institucional text-left text-xs text-white">
                              <th className="px-3 py-2.5 font-semibold">Fecha</th>
                              <th className="px-3 py-2.5 font-semibold">Tipo</th>
                              <th className="px-3 py-2.5 font-semibold">Empresa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listaVencidas.map((p, i) => (
                              <tr key={p.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                                <td className="px-3 py-2">{formatearFecha(p.fecha_programada)}</td>
                                <td className="px-3 py-2">{p.tipos_inspeccion?.nombre ?? '—'}</td>
                                <td className="px-3 py-2 text-muted-foreground">{p.empresa ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Modal: programar ronda */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-md">
          <form onSubmit={guardarProgramacion}>
            <DialogHeader>
              <DialogTitle>Programar ronda</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Tipo(s) de ronda</Label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {tipos.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={tiposSeleccionados.has(t.id)}
                        onCheckedChange={(v) =>
                          setTiposSeleccionados((prev) => {
                            const copia = new Set(prev)
                            if (v === true) copia.add(t.id)
                            else copia.delete(t.id)
                            return copia
                          })
                        }
                      />
                      {t.nombre}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <MiniCalendarioSeleccion valor={fechaProgramar} onSeleccionar={setFechaProgramar} />
                <p className="text-xs text-muted-foreground">Fecha elegida: {formatearFecha(fechaProgramar)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Empresa (opcional)</Label>
                  <Select value={empresaProgramar || TODOS} onValueChange={(v) => setEmpresaProgramar(v === TODOS ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TODOS}>Sin definir</SelectItem>
                      {empresas.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sede (opcional)</Label>
                  <Select value={sedeProgramar || TODOS} onValueChange={(v) => setSedeProgramar(v === TODOS ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TODOS}>Sin definir</SelectItem>
                      {sedes.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Responsable (opcional)</Label>
                <Select value={responsableProgramar || TODOS} onValueChange={(v) => setResponsableProgramar(v === TODOS ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Sin asignar</SelectItem>
                    {perfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Notas (opcional)</Label>
                <Textarea rows={2} value={notasProgramar} onChange={(e) => setNotasProgramar(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardandoProgramacion} disabled={tiposSeleccionados.size === 0}>
                Programar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: detalle del día en el calendario */}
      <Dialog open={diaSeleccionado !== null} onOpenChange={(v) => !v && setDiaSeleccionado(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{diaSeleccionado && formatearFecha(diaSeleccionado.fecha)}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {diaSeleccionado?.items.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.tipos_inspeccion?.nombre ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.empresa ?? 'Sin empresa'} {p.sede ? `· ${p.sede}` : ''}
                      {p.responsable ? ` · ${p.responsable.nombre_completo}` : ''}
                    </div>
                  </div>
                  <EstadoBadge p={p} />
                </div>
                {esAdmin && p.estado === 'pendiente' && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => marcarRealizada(p)}>
                      <CheckCircle2 className="size-3.5" />
                      Marcar realizada
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => cancelarProgramacion(p)}>
                      Cancelar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => eliminarProgramacion(p)}>
                      <Trash2 className="size-3.5 text-[var(--error)]" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
