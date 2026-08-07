import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardPlus, CalendarClock, FileClock, CheckCircle2, TriangleAlert, Eye } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { formatearFecha } from '@/lib/utils'
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

export default function DashboardPage() {
  const { perfil } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [metricas, setMetricas] = useState<Metricas>({ hoy: 0, borradores: 0, completadas: 0, urgentes: 0 })
  const [ultimas, setUltimas] = useState<UltimaInspeccion[]>([])

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
    ]).then(([hoy, borradores, completadas, urgentes, ultimasRes]) => {
      setMetricas({
        hoy: hoy.count ?? 0,
        borradores: borradores.count ?? 0,
        completadas: completadas.count ?? 0,
        urgentes: urgentes.count ?? 0,
      })
      setUltimas((ultimasRes.data ?? []) as unknown as UltimaInspeccion[])
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
        <MetricCard titulo="Hoy" valor={metricas.hoy} icono={<CalendarClock className="size-5 opacity-80" />} />
        <MetricCard titulo="Borradores" valor={metricas.borradores} icono={<FileClock className="size-5 opacity-80" />} />
        <MetricCard titulo="Completadas" valor={metricas.completadas} icono={<CheckCircle2 className="size-5 opacity-80" />} />
        <MetricCard titulo="Urgentes" valor={metricas.urgentes} icono={<TriangleAlert className="size-5 opacity-80" />} />
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
  )
}
