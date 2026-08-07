import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, type LucideIcon } from 'lucide-react'
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
import { CATEGORIAS_SST, GRADIENTES_BLOQUE, obtenerCategoriaSST, type CategoriaSST } from '@/domain/categoriasSST'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  emergencias: 'Camillas, botiquines y demás equipos de respuesta.',
  extintores: 'Carga vigente, señalización y estado físico.',
  orden_aseo: 'Orden, aseo y condiciones seguras del área.',
  sustancias_quimicas: 'Almacenamiento, rotulado y manejo seguro.',
  epp: 'Disponibilidad, uso correcto y estado de los EPP.',
  vehiculos_preoperacional: 'Revisión antes de iniciar el recorrido.',
  alturas_verificacion: 'Verificación general previa al trabajo.',
  alturas_preoperacional: 'Estado de equipos para trabajo en alturas.',
  escalera: 'Condiciones seguras antes de su uso.',
  andamios: 'Montaje, estabilidad y certificación.',
}

function TarjetaBanda({
  color,
  icono: Icono,
  titulo,
  subtitulo,
  onClick,
}: {
  color: CategoriaSST['color']
  icono: LucideIcon
  titulo: string
  subtitulo?: string
  onClick: () => void
}) {
  const [desde, hasta] = GRADIENTES_BLOQUE[color]
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-w-0 flex-col items-center gap-2 rounded-2xl p-3.5 text-center text-white shadow-relieve-sm transition-all hover:-translate-y-0.5 hover:shadow-relieve sm:p-4"
      style={{ background: `linear-gradient(145deg, ${desde}, ${hasta})` }}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-relieve-oscuro-hundido transition-transform group-hover:scale-105 sm:size-12">
        <Icono className="size-5 sm:size-6" strokeWidth={1.75} />
      </div>
      <span className="text-[11px] font-bold uppercase leading-tight tracking-wide sm:text-xs">{titulo}</span>
      {subtitulo && <p className="hidden text-[11px] leading-snug text-white/85 sm:block">{subtitulo}</p>}
    </button>
  )
}

export default function SeleccionarTipoInspeccion() {
  const navigate = useNavigate()
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoriaId, setCategoriaId] = useState<string | null>(null)

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

  const grupoActivo = grupos.find((g) => g.categoria.id === categoriaId) ?? null

  function elegirCategoria(grupo: (typeof grupos)[number]) {
    if (grupo.tipos.length === 1) {
      navigate(`/inspecciones/nueva/${grupo.tipos[0].codigo}`)
    } else {
      setCategoriaId(grupo.categoria.id)
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-[var(--cac-azul)]">Nueva inspección</h1>
      <p className="mb-5 text-sm text-muted-foreground">Registra una nueva inspección de seguridad y salud en el trabajo.</p>

      <Card>
        <CardContent className="p-5 sm:p-6">
          {grupoActivo ? (
            <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
              <button
                type="button"
                onClick={() => setCategoriaId(null)}
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                aria-label="Volver a categorías"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div>
                <h2 className="text-sm font-bold text-[var(--cac-azul)]">
                  ¿Qué inspección de {grupoActivo.categoria.nombre.toLowerCase()} vas a realizar?
                </h2>
                <p className="text-xs text-muted-foreground">{grupoActivo.categoria.objetivo}</p>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--cac-azul)] text-sm font-bold text-white">
                1
              </span>
              <div>
                <h2 className="text-sm font-bold text-[var(--cac-azul)]">¿Qué inspección desea realizar?</h2>
                <p className="text-xs text-muted-foreground">Selecciona la ronda de seguridad a la que corresponde.</p>
              </div>
            </div>
          )}

          {cargando ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
          ) : grupoActivo ? (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
              {grupoActivo.tipos.map((tipo) => (
                <TarjetaBanda
                  key={tipo.id}
                  color={grupoActivo.categoria.color}
                  icono={ICONOS[tipo.codigo] ?? ShieldAlert}
                  titulo={tipo.nombre}
                  subtitulo={REFERENCIA_TIPO[tipo.codigo]}
                  onClick={() => navigate(`/inspecciones/nueva/${tipo.codigo}`)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
              {grupos.map((grupo) => (
                <TarjetaBanda
                  key={grupo.categoria.id}
                  color={grupo.categoria.color}
                  icono={grupo.categoria.icono}
                  titulo={grupo.categoria.nombre}
                  subtitulo={grupo.categoria.frecuencia}
                  onClick={() => elegirCategoria(grupo)}
                />
              ))}
            </div>
          )}

          {grupoActivo && (
            <div className="mt-5 flex justify-start border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => setCategoriaId(null)}>
                <ChevronLeft />
                Volver a categorías
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
