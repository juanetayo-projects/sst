import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import {
  Flame,
  Sparkles,
  FlaskConical,
  HardHat,
  Truck,
  Mountain,
  Cable,
  Milestone,
  Blocks,
  ShieldAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { CATEGORIAS_SST, COLOR_HEX_BLOQUE, obtenerCategoriaSST } from '@/domain/categoriasSST'
import { Card, CardContent } from '@/components/ui/card'

const ICONOS: Record<string, LucideIcon> = {
  emergencias: ShieldAlert,
  extintores: Flame,
  orden_aseo: Sparkles,
  sustancias_quimicas: FlaskConical,
  epp: HardHat,
  vehiculos_preoperacional: Truck,
  alturas_verificacion: Mountain,
  alturas_preoperacional: Cable,
  escalera: Milestone,
  andamios: Blocks,
}

/** Texto de referencia corto por tipo — qué evalúa cada inspección, mostrado bajo el título de su tarjeta. */
const REFERENCIA_TIPO: Record<string, string> = {
  emergencias: 'Disponibilidad y buen estado de camillas, botiquines y demás equipos de respuesta.',
  extintores: 'Carga vigente, señalización y condiciones físicas de los extintores del área.',
  orden_aseo: 'Orden, aseo y condiciones seguras de instalaciones y áreas de trabajo.',
  sustancias_quimicas: 'Almacenamiento, rotulado y manejo seguro de sustancias químicas.',
  epp: 'Disponibilidad, uso correcto y estado de los Elementos de Protección Personal.',
  vehiculos_preoperacional: 'Revisión preoperacional del vehículo antes de iniciar su recorrido.',
  alturas_verificacion: 'Lista de verificación general previa a un trabajo en alturas.',
  alturas_preoperacional: 'Estado de los equipos y sistemas usados en trabajo en alturas.',
  escalera: 'Condiciones seguras de escaleras de tijera o verticales antes de su uso.',
  andamios: 'Montaje, estabilidad y certificación de andamios antes de su uso.',
}

export default function SeleccionarTipoInspeccion() {
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('tipos_inspeccion')
      .select('*')
      .eq('activo', true)
      .order('orden')
      .then(({ data }) => {
        setTipos((data ?? []) as TipoInspeccion[])
        setCargando(false)
      })
  }, [])

  const grupos = CATEGORIAS_SST.map((cat) => ({
    categoria: cat,
    tipos: tipos.filter((t) => obtenerCategoriaSST(t.codigo)?.id === cat.id),
  })).filter((g) => g.tipos.length > 0)

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-[var(--cac-azul)]">Nueva inspección</h1>
      <p className="mb-5 text-sm text-muted-foreground">Registra una nueva inspección de seguridad y salud en el trabajo.</p>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--cac-azul)] text-sm font-bold text-white">
              1
            </span>
            <div>
              <h2 className="text-sm font-bold text-[var(--cac-azul)]">¿Qué inspección desea realizar?</h2>
              <p className="text-xs text-muted-foreground">Selecciona el tipo que mejor corresponda a la ronda que vas a ejecutar.</p>
            </div>
          </div>

          {cargando ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <div className="space-y-6">
              {grupos.map(({ categoria, tipos: tiposGrupo }) => (
                <div key={categoria.id}>
                  <div className="mb-2.5 flex items-baseline gap-1.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {categoria.nombre}
                    </h3>
                    <span className="text-[11px] text-muted-foreground/70">· {categoria.frecuencia}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tiposGrupo.map((tipo) => {
                      const Icono = ICONOS[tipo.codigo] ?? ShieldAlert
                      const acento = COLOR_HEX_BLOQUE[categoria.color]
                      return (
                        <Link key={tipo.id} to={`/inspecciones/nueva/${tipo.codigo}`}>
                          <Card
                            relieve={false}
                            className="tarjeta-acceso h-full text-center transition-all hover:-translate-y-0.5"
                          >
                            <CardContent className="flex flex-col items-center gap-2 p-5">
                              <div
                                className={`bloque-${categoria.color} flex size-14 shrink-0 items-center justify-center rounded-full`}
                                style={{ backgroundColor: 'var(--bloque-fondo)' }}
                              >
                                <Icono className="size-6" style={{ color: acento }} strokeWidth={1.75} />
                              </div>
                              <span className="text-sm font-semibold leading-snug">{tipo.nombre}</span>
                              <p className="text-xs leading-snug text-muted-foreground">
                                {REFERENCIA_TIPO[tipo.codigo]}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
