import { CampoDinamico } from './CampoDinamico'
import type { CategoriaPregunta, Pregunta, TipoRespuesta } from '@/domain/inspecciones'

export function BloqueCategoria({
  categoria,
  preguntas,
  tipoRespuesta,
  respuestas,
  faltantes,
  onCambiar,
}: {
  categoria: CategoriaPregunta
  preguntas: Pregunta[]
  tipoRespuesta: TipoRespuesta
  respuestas: Record<string, string>
  faltantes: Set<string>
  onCambiar: (preguntaId: string, valor: string) => void
}) {
  return (
    <div className={`bloque-datos bloque-${categoria.color} p-4`}>
      <div className="bloque-titulo mb-2">{categoria.nombre}</div>
      <div>
        {preguntas.map((p) => (
          <CampoDinamico
            key={p.id}
            pregunta={p}
            tipoRespuesta={tipoRespuesta}
            valor={respuestas[p.id] ?? ''}
            onChange={(v) => onCambiar(p.id, v)}
            invalido={faltantes.has(p.id)}
          />
        ))}
      </div>
    </div>
  )
}
