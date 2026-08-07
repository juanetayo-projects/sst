import type { ColorBloque } from '@/domain/categoriasSST'

export type Seccion = {
  id: string
  nombre: string
  color: ColorBloque
}

export function NavSecciones({ secciones }: { secciones: Seccion[] }) {
  if (secciones.length < 2) return null

  return (
    <nav
      aria-label="Secciones del formulario"
      className="sticky top-[52px] z-10 -mx-1 flex gap-1.5 overflow-x-auto rounded-xl border border-border bg-card/95 p-1.5 shadow-relieve-sm backdrop-blur"
    >
      {secciones.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`bloque-${s.color} flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors hover:brightness-95`}
          style={{
            backgroundColor: 'var(--bloque-fondo)',
            borderColor: 'var(--bloque-borde)',
            color: 'var(--bloque-acento)',
          }}
        >
          <span
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: 'var(--bloque-acento)' }}
          >
            {i + 1}
          </span>
          {s.nombre}
        </a>
      ))}
    </nav>
  )
}
