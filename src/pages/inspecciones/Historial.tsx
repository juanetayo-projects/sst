import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSpreadsheet, FileDown, Eye, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { formatearFecha } from '@/lib/utils'
import { exportarExcel, exportarListaPDF } from '@/lib/exportar'
import { PageHeader, FilterBar } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SkeletonTabla } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

type FilaInspeccion = {
  id: string
  empresa: string | null
  sede: string | null
  lugar: string | null
  fecha_inspeccion: string
  estado: string
  urgente: boolean
  inspector_id: string
  tipos_inspeccion: { nombre: string } | null
  profiles: { nombre_completo: string } | null
}

const TODOS = '__todos__'

export default function Historial() {
  const { perfil } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [filas, setFilas] = useState<FilaInspeccion[]>([])
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [empresas, setEmpresas] = useState<string[]>([])
  const [sedes, setSedes] = useState<string[]>([])
  const [aEliminar, setAEliminar] = useState<FilaInspeccion | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

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

  function cargarFilas() {
    setCargando(true)
    let consulta = supabase
      .from('inspecciones')
      .select('id,empresa,sede,lugar,fecha_inspeccion,estado,urgente,inspector_id,tipos_inspeccion(nombre),profiles(nombre_completo)')
      .order('fecha_inspeccion', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500)

    if (tipoId !== TODOS) consulta = consulta.eq('tipo_inspeccion_id', tipoId)
    if (empresa !== TODOS) consulta = consulta.eq('empresa', empresa)
    if (sede !== TODOS) consulta = consulta.eq('sede', sede)
    if (estado !== TODOS) consulta = consulta.eq('estado', estado)
    if (soloUrgentes) consulta = consulta.eq('urgente', true)
    if (desde) consulta = consulta.gte('fecha_inspeccion', desde)
    if (hasta) consulta = consulta.lte('fecha_inspeccion', hasta)

    consulta.then(({ data }) => {
      setFilas((data ?? []) as unknown as FilaInspeccion[])
      setCargando(false)
    })
  }

  useEffect(cargarFilas, [tipoId, empresa, sede, estado, soloUrgentes, desde, hasta])

  function puedeEditar(f: FilaInspeccion) {
    if (!perfil) return false
    if (perfil.role === 'admin') return true
    return f.inspector_id === perfil.id && f.estado === 'borrador'
  }

  async function eliminarInspeccion() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.from('inspecciones').delete().eq('id', aEliminar.id)
    setEliminando(false)
    setAEliminar(null)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo eliminar', texto: error.message })
      return
    }
    cargarFilas()
  }

  const filasExport = useMemo(
    () =>
      filas.map((f) => ({
        fecha: formatearFecha(f.fecha_inspeccion),
        tipo: f.tipos_inspeccion?.nombre ?? '',
        empresa: f.empresa ?? '',
        sede: f.sede ?? '',
        lugar: f.lugar ?? '',
        inspector: f.profiles?.nombre_completo ?? '',
        estado: f.estado === 'completada' ? 'Completada' : 'Borrador',
        urgente: f.urgente ? 'Sí' : 'No',
      })),
    [filas]
  )

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

  return (
    <div>
      <PageHeader
        titulo="Historial de inspecciones"
        acciones={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={filas.length === 0}
              onClick={() =>
                exportarExcel({
                  nombreArchivo: 'historial_inspecciones',
                  titulo: 'Historial de inspecciones',
                  subtitulo: subtituloFiltros,
                  columnas: [
                    { header: 'Fecha', key: 'fecha', width: 12 },
                    { header: 'Tipo', key: 'tipo', width: 34 },
                    { header: 'Empresa', key: 'empresa', width: 26 },
                    { header: 'Sede', key: 'sede', width: 18 },
                    { header: 'Lugar', key: 'lugar', width: 20 },
                    { header: 'Inspector', key: 'inspector', width: 24 },
                    { header: 'Estado', key: 'estado', width: 14 },
                    { header: 'Urgente', key: 'urgente', width: 10 },
                  ],
                  filas: filasExport,
                })
              }
            >
              <FileSpreadsheet />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filas.length === 0}
              onClick={() =>
                exportarListaPDF({
                  nombreArchivo: 'Historial de inspecciones',
                  titulo: 'Historial de inspecciones',
                  subtitulo: subtituloFiltros,
                  columnas: ['Fecha', 'Tipo', 'Empresa', 'Sede', 'Lugar', 'Inspector', 'Estado', 'Urgente'],
                  filas: filasExport.map((f) => [f.fecha, f.tipo, f.empresa, f.sede, f.lugar, f.inspector, f.estado, f.urgente]),
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

      <Card className="overflow-x-auto">
        {cargando ? (
          <div className="p-4">
            <SkeletonTabla filas={8} columnas={7} />
          </div>
        ) : filas.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No hay inspecciones con estos filtros.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="franja-institucional text-left text-xs text-white">
                <th className="px-3 py-2.5 font-semibold">Fecha</th>
                <th className="px-3 py-2.5 font-semibold">Tipo</th>
                <th className="px-3 py-2.5 font-semibold">Empresa</th>
                <th className="px-3 py-2.5 font-semibold">Sede</th>
                <th className="px-3 py-2.5 font-semibold">Inspector</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                <th className="px-3 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr
                  key={f.id}
                  className="border-b border-border/60 last:border-0"
                  style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}
                >
                  <td className="px-3 py-2 tabular">{formatearFecha(f.fecha_inspeccion)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {f.tipos_inspeccion?.nombre ?? '—'}
                      {f.urgente && <Badge tono="error">Urgente</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2">{f.empresa ?? '—'}</td>
                  <td className="px-3 py-2">{f.sede ?? '—'}</td>
                  <td className="px-3 py-2">{f.profiles?.nombre_completo ?? '—'}</td>
                  <td className="px-3 py-2">
                    <Badge tono={f.estado === 'completada' ? 'exito' : 'neutro'}>
                      {f.estado === 'completada' ? 'Completada' : 'Borrador'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/inspecciones/${f.id}`}
                        className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Ver"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                      {puedeEditar(f) && (
                        <>
                          <Link
                            to={`/inspecciones/${f.id}/editar`}
                            className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            title="Editar"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <button
                            onClick={() => setAEliminar(f)}
                            className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-[var(--error)]"
                            title="Eliminar"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <ConfirmDialog
        open={aEliminar !== null}
        titulo="Eliminar inspección"
        descripcion={`Se eliminará de forma permanente la inspección de "${aEliminar?.tipos_inspeccion?.nombre ?? ''}"${aEliminar?.empresa ? ` en ${aEliminar.empresa}` : ''} del ${aEliminar ? formatearFecha(aEliminar.fecha_inspeccion) : ''}. Esta acción no se puede deshacer.`}
        cargando={eliminando}
        onConfirm={eliminarInspeccion}
        onCancel={() => setAEliminar(null)}
      />

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
