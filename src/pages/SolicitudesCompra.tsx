import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSpreadsheet, PackageCheck, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { formatearFecha } from '@/lib/utils'
import { exportarExcel } from '@/lib/exportar'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { PageHeader, FilterBar, MetricCard } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'

type Solicitud = {
  id: string
  fecha: string
  tipo_elemento: string
  cantidad: number
  observacion: string | null
  estado: 'pendiente' | 'solicitado' | 'recibido'
  inspeccion_id: string
  inspecciones: { empresa: string | null; sede: string | null; tipo_inspeccion_id: string; tipos_inspeccion: { nombre: string } | null } | null
}

const TODOS = '__todos__'
const TONO_ESTADO = { pendiente: 'advertencia', solicitado: 'info', recibido: 'exito' } as const
const ETIQUETA_ESTADO = { pendiente: 'Pendiente', solicitado: 'Solicitado', recibido: 'Recibido' } as const

export default function SolicitudesCompra() {
  const { perfil } = useAuth()
  const esAdmin = perfil?.role === 'admin'

  const [filas, setFilas] = useState<Solicitud[]>([])
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [tipoId, setTipoId] = useState(TODOS)
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    supabase.from('tipos_inspeccion').select('*').eq('activo', true).order('orden').then(({ data }) => setTipos((data ?? []) as TipoInspeccion[]))
  }, [])

  function cargar() {
    setCargando(true)
    let q = supabase
      .from('solicitudes_compra_item')
      .select('id,fecha,tipo_elemento,cantidad,observacion,estado,inspeccion_id,inspecciones(empresa,sede,tipo_inspeccion_id,tipos_inspeccion(nombre))')
      .order('fecha', { ascending: false })
    if (estadoFiltro !== TODOS) q = q.eq('estado', estadoFiltro)
    if (desde) q = q.gte('fecha', desde)
    if (hasta) q = q.lte('fecha', hasta)
    q.then(({ data }) => {
      let resultado = (data ?? []) as unknown as Solicitud[]
      if (tipoId !== TODOS) resultado = resultado.filter((r) => r.inspecciones?.tipo_inspeccion_id === tipoId)
      setFilas(resultado)
      setCargando(false)
    })
  }

  useEffect(cargar, [tipoId, estadoFiltro, desde, hasta])

  const resumen = useMemo(() => {
    const pendientes = filas.filter((f) => f.estado === 'pendiente').length
    const solicitadas = filas.filter((f) => f.estado === 'solicitado').length
    const recibidas = filas.filter((f) => f.estado === 'recibido').length
    return { total: filas.length, pendientes, solicitadas, recibidas }
  }, [filas])

  function alternarSeleccion(id: string) {
    setSeleccionadas((prev) => {
      const copia = new Set(prev)
      if (copia.has(id)) copia.delete(id)
      else copia.add(id)
      return copia
    })
  }

  async function generarExcel() {
    const items = filas.filter((f) => seleccionadas.has(f.id))
    if (items.length === 0) return
    setGenerando(true)
    await exportarExcel({
      nombreArchivo: 'solicitudes_compra',
      titulo: 'Solicitudes de compra — SST',
      subtitulo: `${items.length} ítem(s) · generado ${formatearFecha(new Date().toISOString())}`,
      columnas: [
        { header: 'Fecha', key: 'fecha', width: 12 },
        { header: 'Ronda', key: 'ronda', width: 30 },
        { header: 'Empresa', key: 'empresa', width: 20 },
        { header: 'Sede', key: 'sede', width: 22 },
        { header: 'Elemento', key: 'elemento', width: 30 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Observación', key: 'observacion', width: 34 },
      ],
      filas: items.map((f) => ({
        fecha: formatearFecha(f.fecha),
        ronda: f.inspecciones?.tipos_inspeccion?.nombre ?? '—',
        empresa: f.inspecciones?.empresa ?? '—',
        sede: f.inspecciones?.sede ?? '—',
        elemento: f.tipo_elemento,
        cantidad: f.cantidad,
        observacion: f.observacion ?? '',
      })),
    })

    const idsPendientes = items.filter((f) => f.estado === 'pendiente').map((f) => f.id)
    if (idsPendientes.length > 0) {
      await supabase.from('solicitudes_compra_item').update({ estado: 'solicitado' }).in('id', idsPendientes)
    }
    setGenerando(false)
    setSeleccionadas(new Set())
    setMensaje({ tipo: 'exito', titulo: 'Excel generado', texto: `Se exportaron ${items.length} ítem(s)${idsPendientes.length > 0 ? ` y se marcaron ${idsPendientes.length} como "Solicitado"` : ''}.` })
    cargar()
  }

  async function marcarRecibido(id: string) {
    await supabase.from('solicitudes_compra_item').update({ estado: 'recibido' }).eq('id', id)
    cargar()
  }

  return (
    <div>
      <PageHeader
        titulo="Solicitudes de compra"
        acciones={
          esAdmin && (
            <Button size="sm" disabled={seleccionadas.size === 0} cargando={generando} onClick={generarExcel}>
              <FileSpreadsheet />
              Generar Excel para Compras {seleccionadas.size > 0 ? `(${seleccionadas.size})` : ''}
            </Button>
          )
        }
      />
      <p className="mb-4 text-sm text-muted-foreground">
        Elementos registrados desde cada ronda de inspección para reponer o adquirir. Selecciona los que vas a enviar y genera el Excel para
        Compras — quedan marcados como "Solicitado" automáticamente.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard titulo="Total" valor={resumen.total} icono={ShoppingCart} color="azul" />
        <MetricCard titulo="Pendientes" valor={resumen.pendientes} icono={ShoppingCart} color="ambar" />
        <MetricCard titulo="Solicitadas" valor={resumen.solicitadas} icono={ShoppingCart} color="verde" />
        <MetricCard titulo="Recibidas" valor={resumen.recibidas} icono={PackageCheck} color="verde" />
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
              <SelectItem value="solicitado">Solicitado</SelectItem>
              <SelectItem value="recibido">Recibido</SelectItem>
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
                {esAdmin && (
                  <th className="w-8 px-3 py-2.5">
                    <Checkbox
                      checked={filas.length > 0 && seleccionadas.size === filas.length}
                      onCheckedChange={(v) => setSeleccionadas(v === true ? new Set(filas.map((f) => f.id)) : new Set())}
                    />
                  </th>
                )}
                <th className="px-3 py-2.5 font-semibold">Fecha</th>
                <th className="px-3 py-2.5 font-semibold">Ronda</th>
                <th className="px-3 py-2.5 font-semibold">Empresa / Sede</th>
                <th className="px-3 py-2.5 font-semibold">Elemento</th>
                <th className="px-3 py-2.5 font-semibold">Cant.</th>
                <th className="px-3 py-2.5 font-semibold">Observación</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                {esAdmin && <th className="px-3 py-2.5 font-semibold"></th>}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={f.id} className="border-b border-border/60 last:border-0" style={{ backgroundColor: i % 2 ? 'var(--fila-impar)' : 'var(--fila-par)' }}>
                  {esAdmin && (
                    <td className="px-3 py-2">
                      <Checkbox checked={seleccionadas.has(f.id)} onCheckedChange={() => alternarSeleccion(f.id)} />
                    </td>
                  )}
                  <td className="px-3 py-2">{formatearFecha(f.fecha)}</td>
                  <td className="px-3 py-2">
                    <Link to={`/inspecciones/${f.inspeccion_id}`} className="hover:underline">
                      {f.inspecciones?.tipos_inspeccion?.nombre ?? '—'}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {f.inspecciones?.empresa ?? '—'} {f.inspecciones?.sede ? `· ${f.inspecciones.sede}` : ''}
                  </td>
                  <td className="px-3 py-2">{f.tipo_elemento}</td>
                  <td className="px-3 py-2 text-right tabular">{f.cantidad}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.observacion ?? '—'}</td>
                  <td className="px-3 py-2">
                    <Badge tono={TONO_ESTADO[f.estado]}>{ETIQUETA_ESTADO[f.estado]}</Badge>
                  </td>
                  {esAdmin && (
                    <td className="px-3 py-2">
                      {f.estado === 'solicitado' && (
                        <Button variant="ghost" size="icon" title="Marcar recibido" onClick={() => marcarRecibido(f.id)}>
                          <PackageCheck className="size-3.5 text-[var(--exito)]" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={esAdmin ? 9 : 7} className="px-3 py-6 text-center text-muted-foreground">
                    Sin solicitudes con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
