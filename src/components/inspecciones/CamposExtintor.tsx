import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pregunta } from '@/domain/inspecciones'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Obligatorio } from '@/components/ui/obligatorio'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type ExtintorInventario = {
  codigo: string
  sede: string | null
  ubicacion: string | null
  tipo: string | null
  capacidad: string | null
}

/**
 * Reemplaza los 3 campos de encabezado de texto libre de la ronda de Extintores
 * (Código/Tipo/Capacidad) por un selector del inventario: al elegir el código,
 * Tipo y Capacidad se autocompletan y quedan de solo lectura.
 */
export function CamposExtintor({
  preguntaCodigo,
  preguntaTipo,
  preguntaCapacidad,
  sede,
  respuestas,
  onChange,
  faltantes,
}: {
  preguntaCodigo: Pregunta
  preguntaTipo: Pregunta
  preguntaCapacidad: Pregunta
  sede: string
  respuestas: Record<string, string>
  onChange: (preguntaId: string, valor: string) => void
  faltantes: Set<string>
}) {
  const [inventario, setInventario] = useState<ExtintorInventario[]>([])

  useEffect(() => {
    supabase
      .from('inventario_extintores')
      .select('codigo,sede,ubicacion,tipo,capacidad')
      .eq('activo', true)
      .order('codigo')
      .then(({ data }) => setInventario((data ?? []) as ExtintorInventario[]))
  }, [])

  const codigoActual = respuestas[preguntaCodigo.id] ?? ''
  const opciones = sede ? inventario.filter((i) => i.sede === sede || i.codigo === codigoActual) : inventario
  // Si el valor guardado ya no existe en el inventario (dato anterior a esta función), se conserva como opción.
  const opcionesFinal = codigoActual && !opciones.some((i) => i.codigo === codigoActual) ? [{ codigo: codigoActual, sede: null, ubicacion: null, tipo: null, capacidad: null }, ...opciones] : opciones

  function elegirCodigo(codigo: string) {
    onChange(preguntaCodigo.id, codigo)
    const item = inventario.find((i) => i.codigo === codigo)
    onChange(preguntaTipo.id, item?.tipo ?? '')
    onChange(preguntaCapacidad.id, item?.capacidad ?? '')
  }

  return (
    <>
      <div className="space-y-1.5">
        <Label>
          {preguntaCodigo.texto}
          {preguntaCodigo.obligatoria && <Obligatorio />}
        </Label>
        <Select value={codigoActual} onValueChange={elegirCodigo}>
          <SelectTrigger aria-invalid={faltantes.has(preguntaCodigo.id)}>
            <SelectValue placeholder="Selecciona el código…" />
          </SelectTrigger>
          <SelectContent>
            {opcionesFinal.map((i) => (
              <SelectItem key={i.codigo} value={i.codigo}>
                {i.codigo}
                {i.ubicacion ? ` — ${i.ubicacion}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{preguntaTipo.texto}</Label>
        <Input value={respuestas[preguntaTipo.id] ?? ''} disabled placeholder="Se completa según el código" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{preguntaCapacidad.texto}</Label>
        <Input value={respuestas[preguntaCapacidad.id] ?? ''} disabled placeholder="Se completa según el código" />
      </div>
    </>
  )
}
