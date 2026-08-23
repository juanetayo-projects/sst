import type { FormaIcono } from '@/lib/botiquines'

const PALETA: Record<FormaIcono, { claro: string; medio: string; oscuro: string }> = {
  caja: { claro: '#DCEBFF', medio: '#A9C7F5', oscuro: '#6E9BE0' },
  paquete: { claro: '#E3F5E1', medio: '#A9DDA0', oscuro: '#6EBB63' },
  frasco: { claro: '#FFE9D6', medio: '#F5C48A', oscuro: '#E0A24E' },
  rollo: { claro: '#FFE0E6', medio: '#F5A3B3', oscuro: '#E0637C' },
}

/** Cubo isométrico de 3 caras — usado para "caja" (cúbico) y "paquete" (aplanado). */
function Caja({ plano, colores }: { plano: boolean; colores: { claro: string; medio: string; oscuro: string } }) {
  const alto = plano ? 8 : 14
  const yBase = 20 + alto
  return (
    <>
      <polygon points="20,4 34,12 20,20 6,12" fill={colores.claro} stroke="#00000022" strokeWidth="0.5" />
      <polygon points={`6,12 20,20 20,${yBase} 6,${yBase - 8}`} fill={colores.medio} stroke="#00000022" strokeWidth="0.5" />
      <polygon points={`34,12 20,20 20,${yBase} 34,${yBase - 8}`} fill={colores.oscuro} stroke="#00000022" strokeWidth="0.5" />
    </>
  )
}

/** Cilindro isométrico — usado para "frasco" (alto/angosto) y "rollo" (bajo/ancho). */
function Cilindro({ alto: h, ancho, colores }: { alto: number; ancho: number; colores: { claro: string; medio: string; oscuro: string } }) {
  const cx = 20
  const cy = 12
  const ry = 6
  return (
    <>
      <path d={`M ${cx - ancho} ${cy} A ${ancho} ${ry} 0 1 0 ${cx + ancho} ${cy} L ${cx + ancho} ${cy + h} A ${ancho} ${ry} 0 0 1 ${cx - ancho} ${cy + h} Z`} fill={colores.medio} stroke="#00000022" strokeWidth="0.5" />
      <path d={`M ${cx} ${cy} A ${ancho} ${ry} 0 1 0 ${cx + ancho} ${cy} L ${cx + ancho} ${cy + h} A ${ancho} ${ry} 0 0 1 ${cx} ${cy + h} Z`} fill={colores.oscuro} stroke="#00000022" strokeWidth="0.5" />
      <ellipse cx={cx} cy={cy} rx={ancho} ry={ry} fill={colores.claro} stroke="#00000022" strokeWidth="0.5" />
    </>
  )
}

/** Ícono isométrico simple (caja/paquete/frasco/rollo) para identificar visualmente cada elemento del botiquín. */
export function IconoElementoBotiquin({ forma, size = 32 }: { forma: FormaIcono; size?: number }) {
  const colores = PALETA[forma]
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      {forma === 'caja' && <Caja plano={false} colores={colores} />}
      {forma === 'paquete' && <Caja plano colores={colores} />}
      {forma === 'frasco' && <Cilindro alto={20} ancho={7} colores={colores} />}
      {forma === 'rollo' && <Cilindro alto={12} ancho={11} colores={colores} />}
    </svg>
  )
}
