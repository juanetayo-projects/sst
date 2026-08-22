const VENTANA_PROXIMO_DIAS = 30

export type EstadoVencimiento = 'vencido' | 'proximo' | 'vigente' | 'sin_fecha'

/** Días (con signo) entre hoy y la fecha de vencimiento: negativo = ya venció, positivo = faltan esos días. */
export function diasParaVencer(fecha: string | null | undefined): number | null {
  if (!fecha) return null
  const hoy = new Date().toISOString().slice(0, 10)
  return Math.round((new Date(`${fecha}T00:00:00`).getTime() - new Date(`${hoy}T00:00:00`).getTime()) / 86400000)
}

/** Estado de vencimiento de un extintor (u otro elemento con fecha límite) a partir de su fecha de vencimiento. */
export function estadoVencimiento(fecha: string | null | undefined): EstadoVencimiento {
  const dias = diasParaVencer(fecha)
  if (dias === null) return 'sin_fecha'
  if (dias < 0) return 'vencido'
  if (dias <= VENTANA_PROXIMO_DIAS) return 'proximo'
  return 'vigente'
}

export const ETIQUETA_VENCIMIENTO: Record<EstadoVencimiento, string> = {
  vencido: 'Vencido',
  proximo: 'Próximo a vencer',
  vigente: 'Vigente',
  sin_fecha: 'Sin fecha',
}

export const COLOR_VENCIMIENTO: Record<EstadoVencimiento, { bg: string; text: string }> = {
  vencido: { bg: 'var(--error-suave)', text: 'var(--error)' },
  proximo: { bg: 'var(--advertencia-suave)', text: '#8a6400' },
  vigente: { bg: 'var(--exito-suave)', text: 'var(--exito)' },
  sin_fecha: { bg: 'var(--neutro-suave)', text: 'var(--neutro)' },
}

/** Tono de `Badge` correspondiente a un estado de vencimiento. */
export const TONO_VENCIMIENTO: Record<EstadoVencimiento, 'error' | 'advertencia' | 'exito' | 'neutro'> = {
  vencido: 'error',
  proximo: 'advertencia',
  vigente: 'exito',
  sin_fecha: 'neutro',
}
