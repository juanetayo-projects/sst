/** Marca de campo obligatorio. */
export function Obligatorio() {
  return (
    <span className="text-[var(--error)]" title="Campo obligatorio" aria-hidden>
      {' '}
      *
    </span>
  )
}
