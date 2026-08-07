import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardPlus, CalendarClock, FileClock, CheckCircle2, TriangleAlert, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { formatearFecha } from '@/lib/utils'
import { obtenerCategoriaSST, COLOR_HEX_BLOQUE } from '@/domain/categoriasSST'
import { MetricCard } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function DashboardPage() {
  const { perfil } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [metricas, setMetricas] = useState<Metricas>({ hoy: 0, borradores: 0, completadas: 0, urgentes: 0 })
  const [ultimas, setUltimas] = useState<UltimaInspeccion[]>([])
  const [porTipo, setPorTipo] = useState<ConteoPorTipo[]>([])

  useEffect(() => {
    const hoyISO = new Date().toISOString().slice(0, 10)

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
    ]).then(([hoy, borradores, completadas, urgentes, ultimasRes, tiposRes, todasRes]) => {
      setMetricas({
        hoy: hoy.count ?? 0,
        borradores: borradores.count ?? 0,
        completadas: completadas.count ?? 0,
        urgentes: urgentes.count ?? 0,
      })
      setUltimas((ultimasRes.data ?? []) as unknown as UltimaInspeccion[])

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

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-[var(--cac-azul)]">
        Hola, {perfil?.nombre_completo?.split(' ')[0] ?? '—'}
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Bienvenido al Sistema de Inspecciones de Seguridad y Salud en el Trabajo.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Hoy" valor={metricas.hoy} icono={CalendarClock} color="azul" />
        <MetricCard titulo="Borradores" valor={metricas.borradores} icono={FileClock} color="ambar" />
        <MetricCard titulo="Completadas" valor={metricas.completadas} icono={CheckCircle2} color="verde" />
        <MetricCard titulo="Urgentes" valor={metricas.urgentes} icono={TriangleAlert} color="rojo" />
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Button asChild>
            <Link to="/inspecciones/nueva">
              <ClipboardPlus />
              Nueva inspección
            </Link>
          </Button>
        </CardContent>
      </Card>

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
                  <BarChart data={porTipo} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 10.5 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }}
                      formatter={(v: number) => [v, 'Inspecciones']}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                      {porTipo.map((t) => (
                        <Cell key={t.codigo} fill={COLOR_HEX_BLOQUE[obtenerCategoriaSST(t.codigo)?.color ?? 'azul']} />
                      ))}
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
