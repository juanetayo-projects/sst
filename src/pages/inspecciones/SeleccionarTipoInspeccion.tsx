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
  grande,
  onClick,
}: {
  color: CategoriaSST['color']
  icono?: LucideIcon
  imagenIcono?: string
  titulo: string
  subtitulo?: string
  grande?: boolean
  onClick: () => void
}) {
  const acento = COLOR_HEX_BLOQUE[color]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bloque-${color} tarjeta-categoria group flex min-w-0 items-center gap-3 rounded-2xl border-2 bg-[var(--bloque-fondo)] p-3 text-left transition-all hover:-translate-y-0.5`}
      style={{ borderColor: 'var(--bloque-borde)' }}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--card)] shadow-sm transition-transform group-hover:scale-105 ${grande ? 'size-12 sm:size-14' : 'size-11 sm:size-12'}`}
      >
        {imagenIcono ? (
          <img src={imagenIcono} alt="" className={grande ? 'size-7 object-contain sm:size-8' : 'size-7 object-contain sm:size-8'} />
        ) : Icono ? (
          <Icono className={grande ? 'size-6 sm:size-7' : 'size-5 sm:size-6'} style={{ color: acento }} strokeWidth={1.75} />
        ) : null}
      </div>
      <div className="min-w-0">
        <span className={`block font-semibold leading-snug ${grande ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>{titulo}</span>
        {subtitulo && (
          <p className={`leading-snug text-muted-foreground ${grande ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'}`}>{subtitulo}</p>
        )}
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
    <div className="mx-auto max-w-[780px]">
      <h1 className="mb-1 text-lg font-semibold text-[var(--cac-azul)]">Nueva inspección</h1>
      <p className="mb-1 text-sm text-muted-foreground">Registra una nueva inspección de seguridad y salud en el trabajo.</p>

      <Card>
        <CardContent className="p-3">
          {grupoActivo ? (
            <div className="mb-2 flex items-start gap-3 border-b border-border pb-2">
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
            <div className="mb-2 flex items-start gap-3 border-b border-border pb-2">
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
            <div className="grid items-start grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 sm:gap-3">
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
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {grupos.slice(0, 3).map((grupo) => (
                  <TarjetaSeleccion
                    key={grupo.categoria.id}
                    color={grupo.categoria.color}
                    imagenIcono={`${import.meta.env.BASE_URL}images/iconos-categorias/${grupo.categoria.iconoImg}`}
                    titulo={grupo.categoria.nombre}
                    grande
                    onClick={() => elegirCategoria(grupo)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {grupos.slice(3).map((grupo) => (
                  <TarjetaSeleccion
                    key={grupo.categoria.id}
                    color={grupo.categoria.color}
                    imagenIcono={`${import.meta.env.BASE_URL}images/iconos-categorias/${grupo.categoria.iconoImg}`}
                    titulo={grupo.categoria.nombre}
                    grande
                    onClick={() => elegirCategoria(grupo)}
                  />
                ))}
              </div>
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
