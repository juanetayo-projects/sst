import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatearFecha } from '@/lib/utils'
import { estadoVencimiento, ETIQUETA_VENCIMIENTO, TONO_VENCIMIENTO, type EstadoVencimiento } from '@/lib/inventario'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SkeletonTabla } from '@/components/ui/skeleton'

type Extintor = {
  id: string
  codigo: string
  sede: string | null
  ubicacion: string | null
  tipo: string | null
  capacidad: string | null
  fecha_vencimiento: string | null
}

const TODOS = '__todos__'
const ORDEN_ESTADO: Record<EstadoVencimiento, number> = { vencido: 0, proximo: 1, vigente: 2, sin_fecha: 3 }

export default function Vencimientos() {
  const [items, setItems] = useState<Extintor[]>([])
  const [cargando, setCargando] = useState(true)
  const [sede, setSede] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)

  useEffect(() => {
    supabase
      .from('inventario_extintores')
      .select('id,codigo,sede,ubicacion,tipo,capacidad,fecha_vencimiento')
      .eq('activo', true)
      .then(({ data }) => {
        setItems((data ?? []) as Extintor[])
        setCargando(false)
      })
  }, [])

  const sedes = useMemo(() => Array.from(new Set(items.map((i) => i.sede).filter((s): s is string => !!s))).sort(), [items])

  const filtrados = useMemo(() => {
    return items
      .filter((i) => sede === TODOS || i.sede === sede)
      .filter((i) => estadoFiltro === TODOS || estadoVencimiento(i.fecha_vencimiento) === estadoFiltro)
      .sort((a, b) => {
        const oa = ORDEN_ESTADO[estadoVencimiento(a.fecha_vencimiento)]
        const ob = ORDEN_ESTADO[estadoVencimiento(b.fecha_vencimiento)]
        if (oa !== ob) return oa - ob
        return (a.fecha_vencimiento ?? '9999').localeCompare(b.fecha_vencimiento ?? '9999')
      })
  }, [items, sede, estadoFiltro])

  const resumen = useMemo(() => {
    const vencidos = items.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vencido').length
    const proximos = items.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'proximo').length
    const vigentes = items.filter((i) => estadoVencimiento(i.fecha_vencimiento) === 'vigente').length
    return { total: items.length, vencidos, proximos, vigentes }
  }, [items])

  return (
    <div>
      <PageHeader titulo="Vencimientos de extintores" />
      <p className="mb-4 text-sm text-muted-foreground">
        Seguimiento de la fecha de vencimiento de cada extintor del inventario, para anticipar el recambio antes de que quede vencido. El
        inventario se administra en{' '}
        <Link to="/admin/inventario" className="font-medium text-[var(--cac-azul)] hover:underline">
          Administración → Inventario
        </Link>
        .
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Total extintores" valor={resumen.total} icono={Flame} color="azul" />
        <MetricCard titulo="Vencidos" valor={resumen.vencidos} icono={Flame} color="rojo" />
        <MetricCard titulo="Próximos a vencer" valor={resumen.proximos} icono={Flame} color="ambar" />
        <MetricCard titulo="Vigentes" valor={resumen.vigentes} icono={Flame} color="verde" />
      </div>

      <FilterBar>
        <div className="space-y-1.5">
          <Label className="text-xs">Sede</Label>
          <Select value={sede} onValueChange={setSede}>
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
            <SkeletonTabla filas={8} columnas={6} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="franja-institucional text-left text-xs text-white">
                <th className="px-3 py-2.5 font-semibold">Código</th>
                <th className="px-3 py-2.5 font-semibold">Sede</th>
                <th className="px-3 py-2.5 font-semibold">Ubicación</th>
                <th className="px-3 py-2.5 font-semibold">Tipo</th>
                <th className="px-3 py-2.5 font-semibold">Vencimiento</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((i, idx) => {
                const estado = estadoVencimiento(i.fecha_vencimiento)
                return (
                  <tr key={i.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: idx % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                    <td className="px-3 py-2 font-medium">{i.codigo}</td>
                    <td className="px-3 py-2 text-muted-foreground">{i.sede ?? '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{i.ubicacion ?? '—'}</td>
                    <td className="px-3 py-2">{i.tipo ?? '—'}</td>
                    <td className="px-3 py-2">{formatearFecha(i.fecha_vencimiento)}</td>
                    <td className="px-3 py-2">
                      <Badge tono={TONO_VENCIMIENTO[estado]}>{ETIQUETA_VENCIMIENTO[estado]}</Badge>
                    </td>
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    Sin registros con estos filtros.
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
