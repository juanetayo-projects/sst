import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Obligatorio } from '@/components/ui/obligatorio'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SegmentoOpciones } from './SegmentoOpciones'
import { OPCIONES_RESPUESTA, OPCIONES_BOOLEANO, type Pregunta, type TipoRespuesta } from '@/domain/inspecciones'

export function CampoDinamico({
  pregunta,
  tipoRespuesta,
  valor,
  onChange,
  invalido,
}: {
  pregunta: Pregunta
  tipoRespuesta: TipoRespuesta
  valor: string
  onChange: (valor: string) => void
  invalido?: boolean
}) {
  if (pregunta.tipo_campo === 'opcion' || pregunta.tipo_campo === 'booleano') {
    const opciones = pregunta.tipo_campo === 'opcion' ? OPCIONES_RESPUESTA[tipoRespuesta] : OPCIONES_BOOLEANO
    return (
      <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
        <span className="flex-1 text-sm">
          {pregunta.texto}
          {pregunta.obligatoria && <Obligatorio />}
        </span>
        <SegmentoOpciones opciones={opciones} valor={valor} onChange={onChange} invalido={invalido} />
      </div>
    )
  }

  const esTextoLargo = pregunta.orden >= 900 || /observaci/i.test(pregunta.texto)

  return (
    <div className="space-y-1.5 py-1.5">
      <Label className="text-xs text-muted-foreground">
        {pregunta.texto}
        {pregunta.obligatoria && <Obligatorio />}
      </Label>
      {pregunta.tipo_campo === 'select' ? (
        <Select value={valor} onValueChange={onChange}>
          <SelectTrigger aria-invalid={invalido}>
            <SelectValue placeholder="Selecciona…" />
          </SelectTrigger>
          <SelectContent>
            {(pregunta.opciones ?? []).map((op) => (
              <SelectItem key={op} value={op}>
                {op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : pregunta.tipo_campo === 'fecha' ? (
        <Input type="date" value={valor} onChange={(e) => onChange(e.target.value)} aria-invalid={invalido} />
      ) : esTextoLargo ? (
        <Textarea value={valor} onChange={(e) => onChange(e.target.value)} aria-invalid={invalido} rows={2} />
      ) : (
        <Input value={valor} onChange={(e) => onChange(e.target.value)} aria-invalid={invalido} />
      )}
    </div>
  )
}
