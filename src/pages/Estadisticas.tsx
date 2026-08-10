import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileSpreadsheet, FileDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { obtenerCategoriaSST, COLOR_HEX_BLOQUE } from '@/domain/categoriasSST'
import { formatearFecha } from '@/lib/utils'
import { exportarExcel, exportarListaPDF } from '@/lib/exportar'
import { PageHeader, FilterBar } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type FilaInspeccion = {
  id: string
  empresa: string | null
  sede: string | null
  fecha_inspeccion: string
  estado: string
  urgente: boolean
  tipos_inspeccion: { codigo: string; nombre: string } | null
}

type FilaRespuesta = { valor: string | null; inspeccion_id: string }

const TODOS = '__todos__'
const PALETA_PIE = ['#0D2D6B', '#0B7A43', '#8A3F05', '#5219A8', '#0B5D56', '#A61B12', '#64748B']
const CONFORME = new Set(['Cumple', 'Sí'])
const NO_CONFORME = new Set(['No Cumple', 'No'])

export default function Estadisticas() {
  const [cargando, setCargando] = useState(true)
  const [filas, setFilas] = useState<FilaInspeccion[]>([])
  const [respuestasOpcion, setRespuestasOpcion] = useState<FilaRespuesta[]>([])
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [empresas, setEmpresas] = useState<string[]>([])
  const [sedes, setSedes] = useState<string[]>([])

  const [tipoId, setTipoId] = useState(TODOS)
  const [empresa, setEmpresa] = useState(TODOS)
  const [sede, setSede] = useState(TODOS)
  const [estado, setEstado] = useState(TODOS)
  const [soloUrgentes, setSoloUrgentes] = useState(false)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

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
    let consulta = supabase
      .from('inspecciones')
      .select('id,empresa,sede,fecha_inspeccion,estado,urgente,tipos_inspeccion(codigo,nombre)')
      .order('fecha_inspeccion', { ascending: true })
      .limit(2000)

    if (tipoId !== TODOS) consulta = consulta.eq('tipo_inspeccion_id', tipoId)
    if (empresa !== TODOS) consulta = consulta.eq('empresa', empresa)
    if (sede !== TODOS) consulta = consulta.eq('sede', sede)
    if (estado !== TODOS) consulta = consulta.eq('estado', estado)
    if (soloUrgentes) consulta = consulta.eq('urgente', true)
    if (desde) consulta = consulta.gte('fecha_inspeccion', desde)
    if (hasta) consulta = consulta.lte('fecha_inspeccion', hasta)

    consulta.then(({ data }) => {
      const actual = (data ?? []) as unknown as FilaInspeccion[]
      setFilas(actual)
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
        .then(({ data: respuestas }) => {
          setRespuestasOpcion((respuestas ?? []) as unknown as FilaRespuesta[])
          setCargando(false)
        })
    })
  }, [tipoId, empresa, sede, estado, soloUrgentes, desde, hasta])

  const subtituloFiltros = useMemo(() => {
    const partes: string[] = []
    partes.push(`Tipo: ${tipoId === TODOS ? 'Todos' : (tipos.find((t) => t.id === tipoId)?.nombre ?? 'Todos')}`)
    partes.push(`Empresa: ${empresa === TODOS ? 'Todas' : empresa}`)
    partes.push(`Sede: ${sede === TODOS ? 'Todas' : sede}`)
    partes.push(`Estado: ${estado === TODOS ? 'Todos' : estado === 'completada' ? 'Completada' : 'Borrador'}`)
    if (soloUrgentes) partes.push('Solo urgentes')
    if (desde) partes.push(`Desde: ${formatearFecha(desde)}`)
    if (hasta) partes.push(`Hasta: ${formatearFecha(hasta)}`)
    return partes.join(' · ')
  }, [tipoId, tipos, empresa, sede, estado, soloUrgentes, desde, hasta])

  const porTipo = useMemo(() => {
    const conteo = new Map<string, { nombre: string; codigo: string; total: number }>()
    for (const f of filas) {
      const t = f.tipos_inspeccion
      if (!t) continue
      const actual = conteo.get(t.codigo) ?? { nombre: t.nombre, codigo: t.codigo, total: 0 }
      actual.total += 1
      conteo.set(t.codigo, actual)
    }
    return Array.from(conteo.values()).sort((a, b) => b.total - a.total)
  }, [filas])

  const cumplimientoPorMes = useMemo(() => {
    const porInspeccion = new Map(filas.map((f) => [f.id, f]))
    const acumulado = new Map<string, { conforme: number; noConforme: number; noAplica: number }>()
    for (const r of respuestasOpcion) {
      if (!r.valor) continue
      const insp = porInspeccion.get(r.inspeccion_id)
      if (!insp) continue
      const mes = insp.fecha_inspeccion.slice(0, 7)
      const actual = acumulado.get(mes) ?? { conforme: 0, noConforme: 0, noAplica: 0 }
      if (CONFORME.has(r.valor)) actual.conforme += 1
      else if (NO_CONFORME.has(r.valor)) actual.noConforme += 1
      else actual.noAplica += 1
      acumulado.set(mes, actual)
    }
    return Array.from(acumulado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, c]) => {
        const total = c.conforme + c.noConforme + c.noAplica
        const pctConforme = total > 0 ? Math.round((c.conforme / total) * 100) : 0
        const pctNoConforme = total > 0 ? Math.round((c.noConforme / total) * 100) : 0
        return {
          mes,
          label: format(parseISO(`${mes}-01`), 'MMM yyyy', { locale: es }),
          conforme: c.conforme,
          noConforme: c.noConforme,
          noAplica: c.noAplica,
          pctConforme,
          pctNoConforme,
          pctNoAplica: Math.max(0, 100 - pctConforme - pctNoConforme),
        }
      })
  }, [filas, respuestasOpcion])

  const porEmpresa = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const f of filas) {
      const nombre = f.empresa ?? 'Sin empresa'
      conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1)
    }
    return Array.from(conteo.entries())
      .map(([empresa, total]) => ({ empresa, total }))
      .sort((a, b) => b.total - a.total)
  }, [filas])

  const totalFilas = filas.length

  const tablaPorTipoYEstado = useMemo(() => {
    const filasTabla = tipos.map((t) => {
      const deEsteTipo = filas.filter((f) => f.tipos_inspeccion?.codigo === t.codigo)
      const completadas = deEsteTipo.filter((f) => f.estado === 'completada').length
      const borradores = deEsteTipo.filter((f) => f.estado === 'borrador').length
      const urgentes = deEsteTipo.filter((f) => f.urgente).length
      return { nombre: t.nombre, completadas, borradores, urgentes, total: deEsteTipo.length }
    })
    return filasTabla.filter((f) => f.total > 0)
  }, [tipos, filas])

  return (
    <div>
      <PageHeader
        titulo="Estadísticas"
        acciones={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={tablaPorTipoYEstado.length === 0}
              onClick={() =>
                exportarExcel({
                  nombreArchivo: 'estadisticas_inspecciones',
                  titulo: 'Estadísticas de inspecciones',
                  subtitulo: subtituloFiltros,
                  columnas: [
                    { header: 'Tipo de inspección', key: 'nombre', width: 36 },
                    { header: 'Completadas', key: 'completadas', width: 14 },
                    { header: 'Borradores', key: 'borradores', width: 14 },
                    { header: 'Urgentes', key: 'urgentes', width: 12 },
                    { header: 'Total', key: 'total', width: 10 },
                  ],
                  filas: tablaPorTipoYEstado,
                })
              }
            >
              <FileSpreadsheet />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={tablaPorTipoYEstado.length === 0}
              onClick={() =>
                exportarListaPDF({
                  nombreArchivo: 'Estadísticas de inspecciones',
                  titulo: 'Estadísticas de inspecciones',
                  subtitulo: subtituloFiltros,
                  columnas: ['Tipo de inspección', 'Completadas', 'Borradores', 'Urgentes', 'Total'],
                  filas: tablaPorTipoYEstado.map((f) => [f.nombre, f.completadas, f.borradores, f.urgentes, f.total]),
                })
              }
            >
              <FileDown />
              PDF
            </Button>
          </>
        }
      />

      <FilterBar>
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={tipoId} onValueChange={setTipoId}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-36" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-36" />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <Checkbox checked={soloUrgentes} onCheckedChange={(v) => setSoloUrgentes(v === true)} />
          Solo urgentes
        </label>
      </FilterBar>

      {cargando ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : filas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No hay inspecciones con estos filtros.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Por tipo de inspección</div>
              <Card>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porTipo} layout="vertical" margin={{ left: 0, right: 28, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 10.5 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }}
                        formatter={(v: number) => [
                          `${v} (${totalFilas > 0 ? Math.round((v / totalFilas) * 100) : 0}% del total)`,
                          'Inspecciones',
                        ]}
                      />
                      <Bar dataKey="total" name="Inspecciones" radius={[0, 6, 6, 0]}>
                        {porTipo.map((t) => (
                          <Cell key={t.codigo} fill={COLOR_HEX_BLOQUE[obtenerCategoriaSST(t.codigo)?.color ?? 'azul']} />
                        ))}
                        <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--foreground)' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Distribución por empresa</div>
              <Card>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={porEmpresa}
                        dataKey="total"
                        nameKey="empresa"
                        outerRadius={95}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                        style={{ fontSize: 11 }}
                      >
                        {porEmpresa.map((_, i) => (
                          <Cell key={i} fill={PALETA_PIE[i % PALETA_PIE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }}
                        formatter={(v: number, name: string) => [
                          `${v} (${totalFilas > 0 ? Math.round((v / totalFilas) * 100) : 0}% del total)`,
                          name,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">% Cumplimiento mensual</div>
              <Card>
                <CardContent className="p-4">
                  {cumplimientoPorMes.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                      Sin respuestas de cumplimiento en el periodo.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={cumplimientoPorMes} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }}
                          formatter={(v: number, name: string) => [`${v}%`, name]}
                          labelFormatter={(label: string) => `Mes: ${label}`}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="pctConforme" name="Cumple" stackId="pct" fill="var(--exito)" />
                        <Bar dataKey="pctNoConforme" name="No Cumple" stackId="pct" fill="var(--error)" />
                        <Bar dataKey="pctNoAplica" name="No Aplica" stackId="pct" fill="var(--neutro)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Resumen por tipo</div>
              <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="franja-institucional text-left text-xs text-white">
                      <th className="px-3 py-2.5 font-semibold">Tipo de inspección</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Completadas</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Borradores</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Urgentes</th>
                      <th className="px-3 py-2.5 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaPorTipoYEstado.map((f, i) => (
                      <tr
                        key={f.nombre}
                        className="border-b border-border/60 last:border-0"
                        style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}
                      >
                        <td className="px-3 py-2">{f.nombre}</td>
                        <td className="px-3 py-2 text-right tabular">{f.completadas}</td>
                        <td className="px-3 py-2 text-right tabular">{f.borradores}</td>
                        <td className="px-3 py-2 text-right tabular">{f.urgentes}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular">{f.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
