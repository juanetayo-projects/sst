import { cn } from '@/lib/utils'

const TONOS_POSITIVOS = new Set(['Cumple', 'Sí'])
const TONOS_NEGATIVOS = new Set(['No Cumple', 'No'])

export function SegmentoOpciones({
  opciones,
  valor,
  onChange,
  invalido,
}: {
  opciones: string[]
  valor: string
  onChange: (valor: string) => void
  invalido?: boolean
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 overflow-hidden rounded-md border text-xs',
        invalido ? 'border-[var(--error)]' : 'border-input'
      )}
      role="radiogroup"
    >
      {opciones.map((op) => {
        const activo = valor === op
        return (
          <button
            key={op}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(op)}
            className={cn(
              'whitespace-nowrap border-r border-input px-2.5 py-1.5 font-medium transition-colors last:border-r-0',
              activo
                ? TONOS_POSITIVOS.has(op)
                  ? 'bg-[var(--exito)] text-white'
                  : TONOS_NEGATIVOS.has(op)
                    ? 'bg-[var(--error)] text-white'
                    : 'bg-[var(--neutro)] text-white'
                : 'bg-card text-muted-foreground hover:bg-accent'
            )}
          >
            {op}
          </button>
        )
      })}
    </div>
  )
}
