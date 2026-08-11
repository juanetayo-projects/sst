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
import { CATEGORIAS_SST, COLOR_HEX_BLOQUE, obtenerCategoriaSST, type CategoriaSST } from '@/domain/categoriasSST'
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

function TarjetaSeleccion({
  color,
  icono: Icono,
  imagenIcono,
  titulo,
  subtitulo,
  onClick,
}: {
  color: CategoriaSST['color']
  icono?: LucideIcon
  imagenIcono?: string
  titulo: string
  subtitulo?: string
  onClick: () => void
}) {
  const acento = COLOR_HEX_BLOQUE[color]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bloque-${color} tarjeta-categoria group flex h-full min-w-0 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--bloque-acento)] sm:p-5`}
    >
      {/* Insignia circular con tinte suave del color de categoría — sin bandas internas */}
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 sm:size-16"
        style={{ backgroundColor: 'var(--bloque-fondo)' }}
      >
        {imagenIcono ? (
          <img src={imagenIcono} alt="" className="size-8 object-contain sm:size-9" />
        ) : Icono ? (
          <Icono className="size-7 sm:size-8" style={{ color: acento }} strokeWidth={1.75} />
        ) : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-start">
        <span className="block text-sm font-semibold leading-snug text-foreground sm:text-base">{titulo}</span>
        {subtitulo && <p className="mt-1 line-clamp-3 text-xs leading-snug text-muted-foreground sm:text-[13px]">{subtitulo}</p>}
      </div>
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
      <h1 className="mb-1 text-xl font-semibold text-[var(--cac-azul)]">Nueva inspección</h1>
      <p className="mb-3 text-sm text-muted-foreground">Registra una nueva inspección de seguridad y salud en el trabajo.</p>

      <Card>
        <CardContent className="p-4 sm:p-8">
          {grupoActivo ? (
            <div className="mb-4 flex items-start gap-3 border-b border-border pb-3">
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
            <div className="mb-4 flex items-start gap-3 border-b border-border pb-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--cac-azul)] text-sm font-bold text-white">
                1
              </span>
              <div>
                <h2 className="text-base font-bold text-[var(--cac-azul)]">¿Qué inspección desea realizar?</h2>
                <p className="text-sm text-muted-foreground">Selecciona la ronda de seguridad a la que corresponde.</p>
              </div>
            </div>
          )}

          {cargando ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
          ) : grupoActivo ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {grupoActivo.tipos.map((tipo) => (
                <TarjetaSeleccion
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
              {grupos.map((grupo) => (
                <TarjetaSeleccion
                  key={grupo.categoria.id}
                  color={grupo.categoria.color}
                  imagenIcono={`${import.meta.env.BASE_URL}images/iconos-categorias/${grupo.categoria.iconoImg}`}
                  titulo={grupo.categoria.nombre}
                  subtitulo={grupo.categoria.objetivo}
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
