import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pregunta } from '@/domain/inspecciones'
import { ETIQUETA_TIPO_BOTIQUIN, leerAtributosBotiquin } from '@/lib/botiquines'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Obligatorio } from '@/components/ui/obligatorio'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type BotiquinInventario = {
  codigo: string
  sede: string | null
  ubicacion: string | null
  tipoEtiqueta: string
}

/**
 * Reemplaza los 3 campos de encabezado de texto libre de la ronda de Botiquines
 * (Código/Tipo/Ubicación) por un selector del inventario: al elegir el código,
 * Tipo y Ubicación se autocompletan y quedan de solo lectura — mismo patrón que CamposExtintor.
 */
export function CamposBotiquin({
  preguntaCodigo,
  preguntaTipo,
  preguntaUbicacion,
  sede,
  respuestas,
  onChange,
  faltantes,
}: {
  preguntaCodigo: Pregunta
  preguntaTipo: Pregunta
  preguntaUbicacion: Pregunta
  sede: string
  respuestas: Record<string, string>
  onChange: (preguntaId: string, valor: string) => void
  faltantes: Set<string>
}) {
  const [inventario, setInventario] = useState<BotiquinInventario[]>([])

  useEffect(() => {
    supabase
      .from('inventario_equipos')
      .select('codigo,sede,ubicacion,atributos')
      .eq('tipo_equipo', 'botiquin')
      .eq('activo', true)
      .order('codigo')
      .then(({ data }) =>
        setInventario(
          ((data ?? []) as { codigo: string; sede: string | null; ubicacion: string | null; atributos: unknown }[]).map((i) => ({
            codigo: i.codigo,
            sede: i.sede,
            ubicacion: i.ubicacion,
            tipoEtiqueta: ETIQUETA_TIPO_BOTIQUIN[leerAtributosBotiquin(i.atributos).tipo_botiquin],
          }))
        )
      )
  }, [])

  const codigoActual = respuestas[preguntaCodigo.id] ?? ''
  const opciones = sede ? inventario.filter((i) => i.sede === sede || i.codigo === codigoActual) : inventario
  // Si el valor guardado ya no existe en el inventario (dato anterior a esta función), se conserva como opción.
  const opcionesFinal = codigoActual && !opciones.some((i) => i.codigo === codigoActual) ? [{ codigo: codigoActual, sede: null, ubicacion: null, tipoEtiqueta: '' }, ...opciones] : opciones

  function elegirCodigo(codigo: string) {
    onChange(preguntaCodigo.id, codigo)
    const item = inventario.find((i) => i.codigo === codigo)
    onChange(preguntaTipo.id, item?.tipoEtiqueta ?? '')
    onChange(preguntaUbicacion.id, item?.ubicacion ?? '')
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
        <Label className="text-xs text-muted-foreground">{preguntaUbicacion.texto}</Label>
        <Input value={respuestas[preguntaUbicacion.id] ?? ''} disabled placeholder="Se completa según el código" />
      </div>
    </>
  )
}
