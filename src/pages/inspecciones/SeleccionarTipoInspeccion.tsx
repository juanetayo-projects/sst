import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Card, CardContent } from '@/components/ui/card'

const ICONOS: Record<string, typeof Flame> = {
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

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-[var(--cac-azul)]">Nueva inspección</h1>
      <p className="mb-5 text-sm text-muted-foreground">Selecciona el tipo de inspección a realizar.</p>

      {cargando ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tipos.map((tipo) => {
            const Icono = ICONOS[tipo.codigo] ?? ShieldAlert
            return (
              <Link key={tipo.id} to={`/inspecciones/nueva/${tipo.codigo}`}>
                <Card className="tarjeta-acceso h-full transition-transform hover:-translate-y-0.5">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cac-azul-50)] text-[var(--cac-azul)]">
                      <Icono className="size-5" />
                    </div>
                    <span className="text-sm font-medium leading-snug">{tipo.nombre}</span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
