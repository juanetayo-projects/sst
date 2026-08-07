import { ChevronDown } from 'lucide-react'
import { CampoDinamico } from './CampoDinamico'
import { irASeccion } from './NavSecciones'
import type { CategoriaPregunta, Pregunta, TipoRespuesta } from '@/domain/inspecciones'

export function BloqueCategoria({
  categoria,
  numero,
  preguntas,
  tipoRespuesta,
  respuestas,
  faltantes,
  onCambiar,
  siguiente,
}: {
  categoria: CategoriaPregunta
  numero?: number
  preguntas: Pregunta[]
  tipoRespuesta: TipoRespuesta
  respuestas: Record<string, string>
  faltantes: Set<string>
  onCambiar: (preguntaId: string, valor: string) => void
  siguiente?: { id: string; nombre: string } | null
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
      <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
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
      {siguiente && (
        <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => irASeccion(siguiente.id)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:brightness-95"
            style={{ backgroundColor: 'var(--bloque-fondo)', color: 'var(--bloque-acento)' }}
          >
            Siguiente: {siguiente.nombre}
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
