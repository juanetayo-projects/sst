import { Badge } from '@/components/ui/badge'
import type { Pregunta } from '@/domain/inspecciones'

const POSITIVOS = new Set(['Cumple', 'Sí'])
const NEGATIVOS = new Set(['No Cumple', 'No'])

export function RespuestaLinea({ pregunta, valor }: { pregunta: Pregunta; valor: string | undefined }) {
  if (!valor) return null

  if (pregunta.tipo_campo === 'opcion' || pregunta.tipo_campo === 'booleano') {
    const tono = POSITIVOS.has(valor) ? 'exito' : NEGATIVOS.has(valor) ? 'error' : 'neutro'
    return (
      <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
        <span className="flex-1 text-sm">{pregunta.texto}</span>
        <Badge tono={tono}>{valor}</Badge>
      </div>
    )
  }

  return (
    <div className="border-b border-border/60 py-1.5 last:border-0">
      <div className="text-xs text-muted-foreground">{pregunta.texto}</div>
      <div className="text-sm">{valor}</div>
    </div>
  )
}
