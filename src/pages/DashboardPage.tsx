import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardPlus, CalendarClock, FileClock, CheckCircle2, TriangleAlert, Eye, Flame } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { formatearFecha } from '@/lib/utils'
import { obtenerCategoriaSST, COLOR_HEX_BLOQUE } from '@/domain/categoriasSST'
import { estadoVencimiento, diasParaVencer, ETIQUETA_VENCIMIENTO, TONO_VENCIMIENTO } from '@/lib/inventario'
import { MetricCard } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SkeletonTabla } from '@/components/ui/skeleton'

type UltimaInspeccion = {
  id: string
  fecha_inspeccion: string
  estado: string
  urgente: boolean
  tipos_inspeccion: { nombre: string } | null
  profiles: { nombre_completo: string } | null
}

type Metricas = { hoy: number; borradores: number; completadas: number; urgentes: number }
type ConteoPorTipo = { codigo: string; nombre: string; total: number }
type ExtintorAlerta = { id: string; codigo: string; empresa: string | null; sede: string | null; ubicacion: string | null; fecha_vencimiento: string | null }

const TODOS = '__todos__'

export default function DashboardPage() {
  const { perfil } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [metricas, setMetricas] = useState<Metricas>({ hoy: 0, borradores: 0, completadas: 0, urgentes: 0 })
  const [ultimas, setUltimas] = useState<UltimaInspeccion[]>([])
  const [porTipo, setPorTipo] = useState<ConteoPorTipo[]>([])
  const [extintoresAlerta, setExtintoresAlerta] = useState<ExtintorAlerta[]>([])
  const [empresaFiltro, setEmpresaFiltro] = useState(TODOS)
  const [sedeFiltro, setSedeFiltro] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState('proximo')

  useEffect(() => {
    const hoyISO = new Date().toISOString().slice(0, 10)
    const en30dias = new Date()
    en30dias.setDate(en30dias.getDate() + 30)

    Promise.all([
      supabase.from('inspecciones').select('id', { count: 'exact', head: true }).eq('fecha_inspeccion', hoyISO),
      supabase.from('inspecciones').select('id', { count: 'exact', head: true }).eq('estado', 'borrador'),
      supabase.from('inspecciones').select('id', { count: 'exact', head: true }).eq('estado', 'completada'),
      supabase.from('inspecciones').select('id', { count: 'exact', head: true }).eq('urgente', true),
      supabase
        .from('inspecciones')
        .select('id,fecha_inspeccion,estado,urgente,tipos_inspeccion(nombre),profiles(nombre_completo)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('tipos_inspeccion').select('codigo,nombre').eq('activo', true).order('orden'),
      supabase.from('inspecciones').select('tipos_inspeccion(codigo)'),
      supabase
        .from('inventario_equipos')
        .select('id,codigo,empresa,sede,ubicacion,fecha_vencimiento')
        .eq('tipo_equipo', 'extintor')
        .eq('activo', true)
        .lte('fecha_vencimiento', en30dias.toISOString().slice(0, 10))
        .order('fecha_vencimiento'),
    ]).then(([hoy, borradores, completadas, urgentes, ultimasRes, tiposRes, todasRes, extintoresRes]) => {
      setMetricas({
        hoy: hoy.count ?? 0,
        borradores: borradores.count ?? 0,
        completadas: completadas.count ?? 0,
        urgentes: urgentes.count ?? 0,
      })
      setUltimas((ultimasRes.data ?? []) as unknown as UltimaInspeccion[])
      setExtintoresAlerta((extintoresRes.data ?? []) as ExtintorAlerta[])

      const conteo = new Map<string, number>()
      for (const t of tiposRes.data ?? []) conteo.set(t.codigo, 0)
      for (const fila of (todasRes.data ?? []) as unknown as { tipos_inspeccion: { codigo: string } | null }[]) {
        const codigo = fila.tipos_inspeccion?.codigo
        if (codigo) conteo.set(codigo, (conteo.get(codigo) ?? 0) + 1)
      }
      setPorTipo((tiposRes.data ?? []).map((t) => ({ codigo: t.codigo, nombre: t.nombre, total: conteo.get(t.codigo) ?? 0 })))

      setCargando(false)
    })
  }, [])

  const empresasExtintores = useMemo(
    () => Array.from(new Set(extintoresAlerta.map((e) => e.empresa).filter((v): v is string => !!v))).sort(),
    [extintoresAlerta]
  )
  const sedesExtintores = useMemo(
    () => Array.from(new Set(extintoresAlerta.map((e) => e.sede).filter((v): v is string => !!v))).sort(),
    [extintoresAlerta]
  )
  const extintoresFiltrados = useMemo(
    () =>
      extintoresAlerta
        .filter((e) => empresaFiltro === TODOS || e.empresa === empresaFiltro)
        .filter((e) => sedeFiltro === TODOS || e.sede === sedeFiltro)
        .filter((e) => estadoFiltro === TODOS || estadoVencimiento(e.fecha_vencimiento) === estadoFiltro),
    [extintoresAlerta, empresaFiltro, sedeFiltro, estadoFiltro]
  )
  const extintoresPorCodigo = useMemo(
    () =>
      extintoresFiltrados.map((e) => {
        const dias = diasParaVencer(e.fecha_vencimiento) ?? 0
        return { codigo: e.codigo, dias: Math.abs(dias), estado: estadoVencimiento(e.fecha_vencimiento) }
      }),
    [extintoresFiltrados]
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--cac-azul)]">
            Hola, {perfil?.nombre_completo?.split(' ')[0] ?? '—'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Bienvenido al Sistema de Inspecciones de Seguridad y Salud en el Trabajo.
          </p>
        </div>
        <Button asChild>
          <Link to="/inspecciones/nueva">
            <ClipboardPlus />
            Nueva inspección
          </Link>
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <MetricCard compacto titulo="Hoy" valor={metricas.hoy} icono={CalendarClock} color="azul" />
        <MetricCard compacto titulo="Borradores" valor={metricas.borradores} icono={FileClock} color="ambar" />
        <MetricCard compacto titulo="Completadas" valor={metricas.completadas} icono={CheckCircle2} color="verde" />
        <MetricCard compacto titulo="Urgentes" valor={metricas.urgentes} icono={TriangleAlert} color="rojo" />
      </div>

      {extintoresAlerta.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--cac-azul)]">
                <Flame className="size-4" />
                Extintores vencidos o próximos a vencer
              </div>
              <Link to="/vencimientos" className="text-xs font-medium text-[var(--cac-azul)] hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todas las empresas</SelectItem>
                  {empresasExtintores.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todas las sedes</SelectItem>
                  {sedesExtintores.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger className="h-7 w-32 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Vencidos y próximos</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                  <SelectItem value="proximo">Próximos a vencer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border/60">
                <table className="w-full text-xs">
                  <thead className="sticky top-0">
                    <tr className="franja-institucional text-left text-white">
                      <th className="px-2.5 py-1.5 font-semibold">Código</th>
                      <th className="px-2.5 py-1.5 font-semibold">Empresa / Sede</th>
                      <th className="px-2.5 py-1.5 font-semibold">Vencimiento</th>
                      <th className="px-2.5 py-1.5 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extintoresFiltrados.map((e, i) => {
                      const estado = estadoVencimiento(e.fecha_vencimiento)
                      return (
                        <tr key={e.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                          <td className="px-2.5 py-1 font-medium">{e.codigo}</td>
                          <td className="px-2.5 py-1 text-muted-foreground">
                            {e.empresa ?? 'Sin empresa'} {e.sede ? `· ${e.sede}` : ''}
                          </td>
                          <td className="px-2.5 py-1">{formatearFecha(e.fecha_vencimiento)}</td>
                          <td className="px-2.5 py-1">
                            <Badge tono={TONO_VENCIMIENTO[estado]}>{ETIQUETA_VENCIMIENTO[estado]}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                    {extintoresFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                          Sin extintores con estos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Días vencidos / por vencer, por código</div>
                <ResponsiveContainer width="100%" height={Math.max(160, extintoresPorCodigo.length * 22)}>
                  <BarChart data={extintoresPorCodigo} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10.5 }} />
                    <YAxis type="category" dataKey="codigo" width={70} tick={{ fontSize: 10.5 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }}
                      formatter={(v: number, _n, item) => [`${v} día(s)`, ETIQUETA_VENCIMIENTO[(item.payload as { estado: keyof typeof ETIQUETA_VENCIMIENTO }).estado]]}
                    />
                    <Bar dataKey="dias" radius={[0, 4, 4, 0]}>
                      {extintoresPorCodigo.map((e) => (
                        <Cell key={e.codigo} fill={e.estado === 'vencido' ? 'var(--error)' : 'var(--advertencia)'} />
                      ))}
                      <LabelList dataKey="dias" position="right" style={{ fontSize: 10, fontWeight: 600, fill: 'var(--foreground)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Inspecciones por tipo</div>
          <Card>
            <CardContent className="p-4">
              {porTipo.every((t) => t.total === 0) && !cargando ? (
                <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
                  Aún no hay inspecciones registradas para graficar.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={porTipo} layout="vertical" margin={{ left: 0, right: 28, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 10.5 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }}
                      formatter={(v: number) => {
                        const total = porTipo.reduce((acc, t) => acc + t.total, 0)
                        return [`${v} (${total > 0 ? Math.round((v / total) * 100) : 0}% del total)`, 'Inspecciones']
                      }}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                      {porTipo.map((t) => (
                        <Cell key={t.codigo} fill={COLOR_HEX_BLOQUE[obtenerCategoriaSST(t.codigo)?.color ?? 'azul']} />
                      ))}
                      <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--foreground)' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Últimas inspecciones</div>
          <Card>
            {cargando ? (
              <div className="p-4">
                <SkeletonTabla filas={5} columnas={4} />
              </div>
            ) : ultimas.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Aún no se han registrado inspecciones.</div>
            ) : (
              <div className="divide-y divide-border/60">
                {ultimas.map((u) => (
                  <Link
                    key={u.id}
                    to={`/inspecciones/${u.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{u.tipos_inspeccion?.nombre ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatearFecha(u.fecha_inspeccion)} · {u.profiles?.nombre_completo ?? '—'}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {u.urgente && <Badge tono="error">Urgente</Badge>}
                      <Badge tono={u.estado === 'completada' ? 'exito' : 'neutro'}>
                        {u.estado === 'completada' ? 'Completada' : 'Borrador'}
                      </Badge>
                      <Eye className="size-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
