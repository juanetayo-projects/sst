import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ListChecks } from 'lucide-react'
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

const TODOS = '__todos__'
const hoyISO = new Date().toISOString().slice(0, 10)

function esVencido(c: Compromiso) {
  return c.estado === 'pendiente' && c.fecha_compromiso < hoyISO
}

function EstadoBadge({ c }: { c: Compromiso }) {
  if (c.estado === 'cumplido') return <Badge tono="exito">Cumplido</Badge>
  if (esVencido(c)) return <Badge tono="error">Vencido</Badge>
  return <Badge tono="advertencia">Pendiente</Badge>
}

export default function Compromisos() {
  const { session } = useAuth()

  const [filas, setFilas] = useState<Compromiso[]>([])
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)

  const [tipoId, setTipoId] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  useEffect(() => {
    supabase.from('tipos_inspeccion').select('*').eq('activo', true).order('orden').then(({ data }) => setTipos((data ?? []) as TipoInspeccion[]))
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

  return (
    <div>
      <PageHeader titulo="Compromisos de ronda" />
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
                    {c.estado === 'pendiente' && session && (
                      <Button variant="ghost" size="icon" title="Marcar cumplido" onClick={() => marcarCumplido(c.id)}>
                        <CheckCircle2 className="size-3.5 text-[var(--exito)]" />
                      </Button>
                    )}
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
    </div>
  )
}
