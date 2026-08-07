import { cn } from '@/lib/utils'

export type FortalezaPassword = {
  puntaje: number
  etiqueta: string
  color: string
}

const NIVELES: Omit<FortalezaPassword, 'puntaje'>[] = [
  { etiqueta: 'Muy débil', color: 'var(--error)' },
  { etiqueta: 'Débil', color: 'var(--error)' },
  { etiqueta: 'Aceptable', color: 'var(--advertencia)' },
  { etiqueta: 'Fuerte', color: 'var(--exito)' },
  { etiqueta: 'Muy fuerte', color: 'var(--exito)' },
]

export function evaluarFortalezaPassword(password: string): FortalezaPassword {
  let puntos = 0
  if (password.length >= 8) puntos++
  if (password.length >= 12) puntos++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) puntos++
  if (/\d/.test(password)) puntos++
  if (/[^A-Za-z0-9]/.test(password)) puntos++

  const puntaje = Math.min(puntos, 4)
  return { puntaje, ...NIVELES[puntaje] }
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const { puntaje, etiqueta, color } = evaluarFortalezaPassword(password)

  return (
    <div className="space-y-1 pt-0.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full bg-muted transition-colors duration-200"
            style={{ backgroundColor: i <= puntaje - 1 ? color : undefined }}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>
        {etiqueta}
      </p>
    </div>
  )
}

export function passwordEsDebil(password: string): boolean {
  return evaluarFortalezaPassword(password).puntaje === 0
}

export function CampoConfirmarPassword({
  password,
  confirmar,
  className,
}: {
  password: string
  confirmar: string
  className?: string
}) {
  if (!confirmar) return null
  const coincide = password === confirmar
  return (
    <p className={cn('text-xs font-medium', coincide ? 'text-[var(--exito)]' : 'text-[var(--error)]', className)}>
      {coincide ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.'}
    </p>
  )
}
