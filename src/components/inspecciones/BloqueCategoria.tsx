import { CampoDinamico } from './CampoDinamico'
import type { CategoriaPregunta, Pregunta, TipoRespuesta } from '@/domain/inspecciones'

export function BloqueCategoria({
  categoria,
  numero,
  preguntas,
  tipoRespuesta,
  respuestas,
  faltantes,
  onCambiar,
}: {
  categoria: CategoriaPregunta
  numero?: number
  preguntas: Pregunta[]
  tipoRespuesta: TipoRespuesta
  respuestas: Record<string, string>
  faltantes: Set<string>
  onCambiar: (preguntaId: string, valor: string) => void
}) {
  return (
    <div id={`categoria-${categoria.id}`} className={`bloque-datos bloque-${categoria.color} scroll-mt-28 p-4`}>
      <div className="bloque-titulo mb-2 flex items-center gap-1.5">
        {numero !== undefined && (
          <span
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: 'var(--bloque-acento)' }}
          >
            {numero}
          </span>
        )}
        {categoria.nombre}
      </div>
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
