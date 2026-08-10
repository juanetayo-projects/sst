import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format, parseISO, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, CalendarClock, ChevronRight, FileClock, HelpCircle, TrendingDown, TrendingUp, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { supabase } from '@/lib/supabase'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { CATEGORIAS_SST, COLOR_HEX_BLOQUE, obtenerCategoriaSST } from '@/domain/categoriasSST'
import { formatearFecha } from '@/lib/utils'
import { PageHeader, FilterBar } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type FilaInspeccion = {
  id: string
  empresa: string | null
  sede: string | null
  fecha_inspeccion: string
  estado: string
  urgente: boolean
  created_at: string
  tipo_inspeccion_id: string
  tipos_inspeccion: { codigo: string; nombre: string } | null
}

type FilaRespuesta = { valor: string | null; inspeccion_id: string }

const CONFORME = new Set(['Cumple', 'Sí'])
const NO_CONFORME = new Set(['No Cumple', 'No'])
const VENTANA_VENCIMIENTO_DIAS = 30
const VENTANA_BORRADOR_DIAS = 7
const TODOS = '__todos__'

// ─────────────────────────── Piezas reutilizables ───────────────────────────

function AnilloSimple({
  pct,
  color,
  tamano = 108,
  grosor = 11,
  children,
}: {
  pct: number
  color: string
  tamano?: number
  grosor?: number
  children?: React.ReactNode
}) {
  const r = (tamano - grosor) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div className="relative shrink-0" style={{ width: tamano, height: tamano }}>
      <svg width={tamano} height={tamano} className="-rotate-90">
        <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={grosor} />
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={grosor}
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

function AnillosConcentricos({
  datos,
  tamano = 168,
  grosor = 13,
  onSegmentClick,
}: {
  datos: { nombre: string; valor: number; color: string }[]
  tamano?: number
  grosor?: number
  onSegmentClick?: (nombre: string, e: React.MouseEvent) => void
}) {
  const max = Math.max(1, ...datos.map((d) => d.valor))
  return (
    <svg width={tamano} height={tamano} className="-rotate-90 shrink-0">
      {datos.map((d, i) => {
        const r = tamano / 2 - grosor / 2 - i * (grosor + 3)
        if (r <= 0) return null
        const c = 2 * Math.PI * r
        const pct = d.valor / max
        return (
          <g key={d.nombre}>
            <circle cx={tamano / 2} cy={tamano / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={grosor} />
            <circle
              cx={tamano / 2}
              cy={tamano / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={grosor}
              strokeDasharray={c}
              strokeDashoffset={c - pct * c}
              strokeLinecap="round"
              className={onSegmentClick ? 'cursor-pointer' : undefined}
              onClick={onSegmentClick ? (e) => onSegmentClick(d.nombre, e) : undefined}
            />
          </g>
        )
      })}
    </svg>
  )
}

interface PopCol<T> {
  header: string
  get: (r: T) => string | number
}
type PopoverState<T> = { x: number; y: number; titulo: string; columnas: PopCol<T>[]; filas: T[] } | null

function abrirPopover<T>(
  set: (p: PopoverState<T>) => void,
  e: { clientX?: number; clientY?: number } | undefined,
  titulo: string,
  columnas: PopCol<T>[],
  filas: T[]
) {
  if (!filas.length) return
  const cx = e?.clientX ?? window.innerWidth / 2
  const cy = e?.clientY ?? window.innerHeight / 2
  set({
    x: Math.max(8, Math.min(cx, window.innerWidth - 304)),
    y: Math.max(8, Math.min(cy, window.innerHeight - 288)),
    titulo,
    columnas,
    filas,
  })
}

function PopoverDetalle<T>({
  popover,
  onClose,
  getKey,
  onFilaClick,
}: {
  popover: PopoverState<T>
  onClose: () => void
  getKey: (r: T) => string | number
  onFilaClick?: (r: T) => void
}) {
  if (!popover) return null
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="fixed z-50 w-72 rounded-xl border border-border bg-card p-3 shadow-relieve-hover"
        style={{ left: popover.x, top: popover.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-border pb-2">
          <span className="text-xs font-bold text-[var(--cac-azul)]">{popover.titulo}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
        {onFilaClick && popover.filas.length > 0 && (
          <p className="mb-1 text-[10px] text-muted-foreground">Clic en una fila para ver el detalle.</p>
        )}
        <div className="max-h-56 overflow-y-auto rounded-md">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="franja-institucional text-left text-white">
                {popover.columnas.map((c) => (
                  <th key={c.header} className="px-2 py-1.5 font-semibold">
                    {c.header}
                  </th>
                ))}
                {onFilaClick && <th className="px-1 py-1.5" />}
              </tr>
            </thead>
            <tbody>
              {popover.filas.map((f) => (
                <tr
                  key={getKey(f)}
                  className={`border-t border-border/60 ${onFilaClick ? 'cursor-pointer hover:bg-accent' : ''}`}
                  onClick={() => onFilaClick?.(f)}
                >
                  {popover.columnas.map((c) => (
                    <td key={c.header} className="px-2 py-1 align-top">
                      {String(c.get(f) ?? '') || '—'}
                    </td>
                  ))}
                  {onFilaClick && (
                    <td className="px-1 py-1 align-middle text-muted-foreground">
                      <ChevronRight className="size-3" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {popover.filas.length === 0 && <p className="py-2 text-center text-muted-foreground">Sin registros.</p>}
        </div>
      </div>
    </div>
  )
}

function diaSemanaLunes0(iso: string): number {
  return (new Date(`${iso}T00:00:00`).getDay() + 6) % 7
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function construirCalendarioMes(registros: FilaInspeccion[], y: number, m: number) {
  const primerDia = new Date(y, m, 1)
  const diasEnMes = new Date(y, m + 1, 0).getDate()
  const offset = diaSemanaLunes0(isoDate(primerDia))
  const porDia: Record<number, FilaInspeccion[]> = {}
  registros.forEach((r) => {
    const d = new Date(`${r.fecha_inspeccion}T00:00:00`)
    if (d.getFullYear() === y && d.getMonth() === m) (porDia[d.getDate()] ??= []).push(r)
  })
  const max = Math.max(1, ...Object.values(porDia).map((a) => a.length))
  const celdas: ({ dia: number; registros: FilaInspeccion[] } | null)[] = Array.from({ length: offset }, () => null)
  for (let dia = 1; dia <= diasEnMes; dia++) celdas.push({ dia, registros: porDia[dia] ?? [] })
  return { celdas, max }
}

const CAL_ESCALA = ['var(--muted)', '#B9CCE9', '#7FA0D6', '#3E6DAE', '#0D2D6B']
const COLUMNAS_POPOVER: PopCol<FilaInspeccion>[] = [
  { header: 'Tipo', get: (r) => r.tipos_inspeccion?.nombre ?? '—' },
  { header: 'Empresa', get: (r) => r.empresa ?? '—' },
  { header: 'Fecha', get: (r) => formatearFecha(r.fecha_inspeccion) },
]

// ────────────────────────────────── Página ──────────────────────────────────

export default function InformeEjecutivo() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(true)
  const [filas, setFilas] = useState<FilaInspeccion[]>([])
  const [filasPrevias, setFilasPrevias] = useState<FilaInspeccion[]>([])
  const [respuestasOpcion, setRespuestasOpcion] = useState<FilaRespuesta[]>([])
  const [ultimaPorCategoria, setUltimaPorCategoria] = useState<Map<string, string>>(new Map())

  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [empresas, setEmpresas] = useState<string[]>([])
  const [sedes, setSedes] = useState<string[]>([])
  const [tipoId, setTipoId] = useState(TODOS)
  const [empresa, setEmpresa] = useState(TODOS)
  const [sede, setSede] = useState(TODOS)
  const [estado, setEstado] = useState(TODOS)
  const [soloUrgentes, setSoloUrgentes] = useState(false)

  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10))
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    return d.toISOString().slice(0, 10)
  })

  const [mesCal, setMesCal] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const [popover, setPopover] = useState<PopoverState<FilaInspeccion>>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('tipos_inspeccion').select('*').eq('activo', true).order('orden'),
      supabase.from('empresas').select('nombre').eq('activo', true).order('orden'),
      supabase.from('sedes').select('nombre').eq('activo', true).order('orden'),
    ]).then(([tiposRes, empresasRes, sedesRes]) => {
      setTipos((tiposRes.data ?? []) as TipoInspeccion[])
      setEmpresas((empresasRes.data ?? []).map((e) => e.nombre))
      setSedes((sedesRes.data ?? []).map((s) => s.nombre))
    })
  }, [])

  useEffect(() => {
    setCargando(true)
    const dias = Math.max(1, Math.round((parseISO(hasta).getTime() - parseISO(desde).getTime()) / 86400000) + 1)
    const prevHasta = format(addDays(parseISO(desde), -1), 'yyyy-MM-dd')
    const prevDesde = format(addDays(parseISO(prevHasta), -(dias - 1)), 'yyyy-MM-dd')

    let consultaActual = supabase
      .from('inspecciones')
      .select('id,empresa,sede,fecha_inspeccion,estado,urgente,created_at,tipo_inspeccion_id,tipos_inspeccion(codigo,nombre)')
      .gte('fecha_inspeccion', desde)
      .lte('fecha_inspeccion', hasta)
    let consultaPrevia = supabase
      .from('inspecciones')
      .select('id,empresa,sede,fecha_inspeccion,estado,urgente,created_at,tipo_inspeccion_id,tipos_inspeccion(codigo,nombre)')
      .gte('fecha_inspeccion', prevDesde)
      .lte('fecha_inspeccion', prevHasta)
    let consultaHistorico = supabase
      .from('inspecciones')
      .select('tipo_inspeccion_id,fecha_inspeccion,tipos_inspeccion(codigo)')
      .eq('estado', 'completada')

    if (tipoId !== TODOS) {
      consultaActual = consultaActual.eq('tipo_inspeccion_id', tipoId)
      consultaPrevia = consultaPrevia.eq('tipo_inspeccion_id', tipoId)
    }
    if (empresa !== TODOS) {
      consultaActual = consultaActual.eq('empresa', empresa)
      consultaPrevia = consultaPrevia.eq('empresa', empresa)
      consultaHistorico = consultaHistorico.eq('empresa', empresa)
    }
    if (sede !== TODOS) {
      consultaActual = consultaActual.eq('sede', sede)
      consultaPrevia = consultaPrevia.eq('sede', sede)
      consultaHistorico = consultaHistorico.eq('sede', sede)
    }
    if (estado !== TODOS) {
      consultaActual = consultaActual.eq('estado', estado)
      consultaPrevia = consultaPrevia.eq('estado', estado)
    }
    if (soloUrgentes) {
      consultaActual = consultaActual.eq('urgente', true)
      consultaPrevia = consultaPrevia.eq('urgente', true)
    }

    Promise.all([
      consultaActual.order('fecha_inspeccion', { ascending: true }).limit(3000),
      consultaPrevia.limit(3000),
      consultaHistorico.order('fecha_inspeccion', { ascending: false }).limit(3000),
    ]).then(([actualRes, prevRes, historicoRes]) => {
      const actual = (actualRes.data ?? []) as unknown as FilaInspeccion[]
      setFilas(actual)
      setFilasPrevias((prevRes.data ?? []) as unknown as FilaInspeccion[])

      const ultima = new Map<string, string>()
      for (const r of (historicoRes.data ?? []) as unknown as { fecha_inspeccion: string; tipos_inspeccion: { codigo: string } | null }[]) {
        const catId = obtenerCategoriaSST(r.tipos_inspeccion?.codigo ?? '')?.id
        if (catId && !ultima.has(catId)) ultima.set(catId, r.fecha_inspeccion)
      }
      setUltimaPorCategoria(ultima)

      const ids = actual.map((f) => f.id)
      if (ids.length === 0) {
        setRespuestasOpcion([])
        setCargando(false)
        return
      }
      supabase
        .from('respuestas_inspeccion')
        .select('valor,inspeccion_id,preguntas!inner(tipo_campo)')
        .eq('preguntas.tipo_campo', 'opcion')
        .in('inspeccion_id', ids)
        .then(({ data }) => {
          setRespuestasOpcion((data ?? []) as unknown as FilaRespuesta[])
          setCargando(false)
        })
    })
  }, [desde, hasta, tipoId, empresa, sede, estado, soloUrgentes])

  // ── Resumen del periodo ──
  const totalActual = filas.length
  const totalPrevio = filasPrevias.length
  const variacion = totalPrevio === 0 ? (totalActual > 0 ? 100 : 0) : Math.round(((totalActual - totalPrevio) / totalPrevio) * 100)

  const rangoAnterior = useMemo(() => {
    const dias = Math.max(1, Math.round((parseISO(hasta).getTime() - parseISO(desde).getTime()) / 86400000) + 1)
    const prevHasta = format(addDays(parseISO(desde), -1), 'yyyy-MM-dd')
    const prevDesde = format(addDays(parseISO(prevHasta), -(dias - 1)), 'yyyy-MM-dd')
    return { prevDesde, prevHasta }
  }, [desde, hasta])

  // ── Serie temporal ──
  const serieTemporal = useMemo(() => {
    const dias = Math.max(1, Math.round((parseISO(hasta).getTime() - parseISO(desde).getTime()) / 86400000) + 1)
    const porAgrupacion = dias > 21
    const conteo = new Map<string, number>()
    for (const f of filas) {
      const clave = porAgrupacion ? format(parseISO(`${f.fecha_inspeccion}-01`.slice(0, 7) + '-01'), 'yyyy-MM') : f.fecha_inspeccion
      conteo.set(clave, (conteo.get(clave) ?? 0) + 1)
    }
    return Array.from(conteo.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([clave, total]) => ({
        clave,
        label: porAgrupacion ? format(parseISO(`${clave}-01`), 'MMM yyyy', { locale: es }) : format(parseISO(clave), 'd MMM', { locale: es }),
        total,
      }))
  }, [filas, desde, hasta])

  // ── Cumplimiento ──
  const cumplimiento = useMemo(() => {
    let conforme = 0
    let noConforme = 0
    for (const r of respuestasOpcion) {
      if (!r.valor) continue
      if (CONFORME.has(r.valor)) conforme++
      else if (NO_CONFORME.has(r.valor)) noConforme++
    }
    const total = conforme + noConforme
    const pct = total === 0 ? 100 : Math.round((conforme / total) * 100)
    return { pct, conforme, noConforme, total }
  }, [respuestasOpcion])
  const colorCumplimiento = cumplimiento.pct >= 90 ? 'var(--exito)' : cumplimiento.pct >= 75 ? 'var(--advertencia)' : 'var(--error)'

  // ── Distribución por ronda (anillos) ──
  const porRonda = useMemo(() => {
    const conteo = new Map<string, FilaInspeccion[]>()
    for (const f of filas) {
      const catId = obtenerCategoriaSST(f.tipos_inspeccion?.codigo ?? '')?.id
      if (!catId) continue
      const lista = conteo.get(catId) ?? []
      lista.push(f)
      conteo.set(catId, lista)
    }
    return CATEGORIAS_SST.map((c) => ({ categoria: c, registros: conteo.get(c.id) ?? [] }))
      .filter((r) => r.registros.length > 0)
      .sort((a, b) => b.registros.length - a.registros.length)
  }, [filas])

  // ── Calendario ──
  const cal = useMemo(() => construirCalendarioMes(filas, mesCal.y, mesCal.m), [filas, mesCal])

  // ── Alertas ──
  const rondasVencidas = useMemo(() => {
    const hoy = new Date(hasta)
    return CATEGORIAS_SST.filter((c) => c.frecuencia.startsWith('Mensual')).map((c) => {
      const ultima = ultimaPorCategoria.get(c.id) ?? null
      const dias = ultima ? Math.round((hoy.getTime() - new Date(ultima).getTime()) / 86400000) : null
      return { categoria: c, ultima, dias, vencida: dias === null || dias > VENTANA_VENCIMIENTO_DIAS }
    }).filter((r) => r.vencida)
  }, [ultimaPorCategoria, hasta])

  const urgentesPeriodo = useMemo(() => filas.filter((f) => f.urgente), [filas])

  const borradoresViejos = useMemo(() => {
    const hoy = parseISO(hasta).getTime()
    return filas.filter((f) => f.estado === 'borrador' && Math.round((hoy - parseISO(f.fecha_inspeccion).getTime()) / 86400000) > VENTANA_BORRADOR_DIAS)
  }, [filas, hasta])

  // ── Ranking de hallazgos por empresa ──
  const rankingEmpresas = useMemo(() => {
    const porInspeccion = new Map(filas.map((f) => [f.id, f]))
    const conteo = new Map<string, number>()
    for (const r of respuestasOpcion) {
      if (!r.valor || !NO_CONFORME.has(r.valor)) continue
      const insp = porInspeccion.get(r.inspeccion_id)
      const empresa = insp?.empresa ?? 'Sin empresa'
      conteo.set(empresa, (conteo.get(empresa) ?? 0) + 1)
    }
    return Array.from(conteo.entries())
      .map(([empresa, hallazgos]) => ({ empresa, hallazgos }))
      .sort((a, b) => b.hallazgos - a.hallazgos)
      .slice(0, 6)
  }, [filas, respuestasOpcion])

  return (
    <div className="flex flex-col lg:h-[calc(100vh-7.25rem)] lg:overflow-hidden">
      <PageHeader titulo="Informe Ejecutivo" />

      <FilterBar className="mb-3 shrink-0">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={tipoId} onValueChange={setTipoId}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
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
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
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
        <label className="flex items-center gap-2 pb-1.5 text-xs">
          <Checkbox checked={soloUrgentes} onCheckedChange={(v) => setSoloUrgentes(v === true)} />
          Solo urgentes
        </label>
      </FilterBar>

      {cargando ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Fila 1 */}
          <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-3">
            <Card>
              <CardContent className="flex h-full flex-col justify-center gap-1 p-4">
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Inspecciones del periodo
                  <span
                    className="cursor-help text-muted-foreground/70"
                    title={`% = (Inspecciones del periodo actual − Inspecciones del periodo anterior) ÷ Inspecciones del periodo anterior × 100.`}
                  >
                    <HelpCircle className="size-3" />
                  </span>
                </div>
                <div className="text-3xl font-extrabold tabular text-[var(--cac-azul)]">{totalActual}</div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${variacion >= 0 ? 'text-[var(--exito)]' : 'text-[var(--error)]'}`}
                >
                  {variacion >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {variacion >= 0 ? '+' : ''}
                  {variacion}% vs. periodo anterior ({totalPrevio})
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Periodo anterior: {formatearFecha(rangoAnterior.prevDesde)} – {formatearFecha(rangoAnterior.prevHasta)} (misma duración, inmediatamente antes)
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tendencia</div>
                <ResponsiveContainer width="100%" height={84}>
                  <BarChart data={serieTemporal} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} formatter={(v: number) => [v, 'Inspecciones']} />
                    <Bar dataKey="total" fill="var(--cac-azul)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex h-full flex-col items-center justify-center gap-0.5 p-3">
                <div className="mb-0.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cumplimiento del checklist
                  <span
                    className="cursor-help text-muted-foreground/70"
                    title="% = Cumple ÷ (Cumple + No Cumple) × 100. No incluye las respuestas 'No Aplica'."
                  >
                    <HelpCircle className="size-3" />
                  </span>
                </div>
                <AnilloSimple pct={cumplimiento.pct} color={colorCumplimiento} tamano={80} grosor={9}>
                  <span className="text-base font-extrabold tabular" style={{ color: colorCumplimiento }}>
                    {cumplimiento.pct}%
                  </span>
                </AnilloSimple>
                <p className="text-center text-[11px] text-muted-foreground">
                  {cumplimiento.conforme} conformes · {cumplimiento.noConforme} no conformes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fila 2 */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-3 lg:items-stretch">
            <Card>
              <CardContent className="flex h-full flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calendario de actividad</div>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      className="rounded px-1.5 py-0.5 hover:bg-accent"
                      onClick={() => setMesCal((s) => (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }))}
                    >
                      ‹
                    </button>
                    <span className="w-20 text-center font-medium capitalize">{format(new Date(mesCal.y, mesCal.m, 1), 'MMM yyyy', { locale: es })}</span>
                    <button
                      className="rounded px-1.5 py-0.5 hover:bg-accent"
                      onClick={() => setMesCal((s) => (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }))}
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="mt-1 grid flex-1 grid-cols-7 content-center gap-1">
                  {cal.celdas.map((c, i) => {
                    if (!c) return <div key={i} />
                    const n = c.registros.length
                    const nivel = n === 0 ? 0 : Math.min(4, Math.ceil((n / cal.max) * 4))
                    return (
                      <div
                        key={i}
                        className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded text-[10px] font-medium leading-none ${n ? 'cursor-pointer' : ''}`}
                        style={{ background: CAL_ESCALA[nivel], color: nivel >= 3 ? 'white' : 'var(--foreground)' }}
                        onClick={(e) => n && abrirPopover(setPopover, e, `${c.dia} de ${format(new Date(mesCal.y, mesCal.m, 1), 'MMMM', { locale: es })} · ${n} inspección(es)`, COLUMNAS_POPOVER, c.registros)}
                      >
                        <span>{c.dia}</span>
                        {n > 0 && <span className="text-[8px] font-bold opacity-90">{n}</span>}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex h-full flex-col items-center gap-2 p-4">
                <div className="self-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">Distribución por ronda</div>
                <AnillosConcentricos
                  tamano={132}
                  grosor={11}
                  datos={porRonda.map((r) => ({ nombre: r.categoria.nombre, valor: r.registros.length, color: COLOR_HEX_BLOQUE[r.categoria.color] }))}
                  onSegmentClick={(nombre, e) => {
                    const r = porRonda.find((x) => x.categoria.nombre === nombre)
                    if (r) abrirPopover(setPopover, e, nombre, COLUMNAS_POPOVER, r.registros)
                  }}
                />
                <div className="grid w-full flex-1 grid-cols-1 content-start gap-1 overflow-y-auto text-xs">
                  {porRonda.map((r) => (
                    <button
                      key={r.categoria.id}
                      onClick={(e) => abrirPopover(setPopover, e, r.categoria.nombre, COLUMNAS_POPOVER, r.registros)}
                      className="flex items-center justify-between gap-2 rounded px-1.5 py-0.5 text-left hover:bg-accent"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: COLOR_HEX_BLOQUE[r.categoria.color] }} />
                        <span className="truncate">{r.categoria.nombre}</span>
                      </span>
                      <span className="shrink-0 font-semibold tabular">{r.registros.length}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex min-h-0 flex-col gap-3">
              <Card className="min-h-0 flex-1">
                <CardContent className="flex h-full flex-col space-y-2 overflow-y-auto p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alertas</div>

                  {rondasVencidas.length === 0 && urgentesPeriodo.length === 0 && borradoresViejos.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">Sin alertas activas.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {rondasVencidas.map((r) => (
                        <div key={r.categoria.id} className="flex items-start gap-2 rounded-lg bg-[var(--advertencia-suave)] p-2 text-xs">
                          <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-[var(--advertencia)]" />
                          <span>
                            <strong>{r.categoria.nombre}</strong> sin inspección {r.dias === null ? 'registrada' : `hace ${r.dias} días`} (ronda mensual).
                          </span>
                        </div>
                      ))}
                      {urgentesPeriodo.length > 0 && (
                        <button
                          onClick={(e) => abrirPopover(setPopover, e, `Urgentes del periodo (${urgentesPeriodo.length})`, COLUMNAS_POPOVER, urgentesPeriodo)}
                          className="flex w-full items-start gap-2 rounded-lg bg-[var(--error-suave)] p-2 text-left text-xs hover:brightness-95"
                        >
                          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[var(--error)]" />
                          <span>
                            <strong>{urgentesPeriodo.length}</strong> inspección(es) marcadas urgentes en el periodo.
                          </span>
                        </button>
                      )}
                      {borradoresViejos.length > 0 && (
                        <button
                          onClick={(e) => abrirPopover(setPopover, e, `Borradores sin cerrar (${borradoresViejos.length})`, COLUMNAS_POPOVER, borradoresViejos)}
                          className="flex w-full items-start gap-2 rounded-lg bg-[var(--neutro-suave)] p-2 text-left text-xs hover:brightness-95"
                        >
                          <FileClock className="mt-0.5 size-3.5 shrink-0 text-[var(--neutro)]" />
                          <span>
                            <strong>{borradoresViejos.length}</strong> borrador(es) con más de {VENTANA_BORRADOR_DIAS} días sin finalizar.
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="min-h-0 flex-1">
                <CardContent className="flex h-full flex-col p-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Empresas con más hallazgos "No Cumple"</div>
                  {rankingEmpresas.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">Sin hallazgos registrados en el periodo.</p>
                  ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <ResponsiveContainer width="100%" height={Math.max(90, rankingEmpresas.length * 26)}>
                        <BarChart data={rankingEmpresas} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="empresa" width={110} tick={{ fontSize: 10.5 }} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} formatter={(v: number) => [v, 'Hallazgos']} />
                          <Bar dataKey="hallazgos" fill="var(--error)" radius={[0, 6, 6, 0]}>
                            <LabelList dataKey="hallazgos" position="right" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--foreground)' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <p className="shrink-0 text-center text-[10px] text-muted-foreground">
            ¿Buscas una inspección puntual? Consulta el{' '}
            <Link to="/inspecciones" className="font-medium text-[var(--cac-azul)] hover:underline">
              Historial
            </Link>
            .
          </p>
        </div>
      )}

      <PopoverDetalle
        popover={popover}
        onClose={() => setPopover(null)}
        getKey={(r) => r.id}
        onFilaClick={(r) => navigate(`/inspecciones/${r.id}`)}
      />
    </div>
  )
}
