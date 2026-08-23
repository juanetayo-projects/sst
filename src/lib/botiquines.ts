export type TipoBotiquin = 'A' | 'B' | 'C'

export const ETIQUETA_TIPO_BOTIQUIN: Record<TipoBotiquin, string> = {
  A: 'Tipo A',
  B: 'Tipo B',
  C: 'Tipo C',
}

export const DESCRIPCION_TIPO_BOTIQUIN: Record<TipoBotiquin, string> = {
  A: 'Botiquín portátil de área — el que se distribuye por piso/servicio.',
  B: 'Botiquín del Área de Primeros Auxilios (establecimientos de 2.000-15.000 m²) — contiene lo del Tipo A más elementos de inmovilización y signos vitales.',
  C: 'Botiquín del Área de Primeros Auxilios para establecimientos de más de 15.000 m² — cantidades ampliadas sobre el Tipo B.',
}

export type FormaIcono = 'caja' | 'frasco' | 'rollo' | 'paquete'

export type ElementoBotiquin = {
  id: string
  nombre: string
  cantidad: string
  forma: FormaIcono
  color: string
}

/**
 * Contenido mínimo del botiquín Tipo A según la Resolución 705 de 2007 (Min. Protección Social) —
 * el tipo de botiquín que se distribuye por piso/servicio en la clínica. Los botiquines Tipo B/C
 * (Área de Primeros Auxilios centralizada) amplían esta lista; ver `DESCRIPCION_TIPO_BOTIQUIN`.
 */
export const CONTENIDO_BOTIQUIN_TIPO_A: ElementoBotiquin[] = [
  { id: 'gasas', nombre: 'Gasas limpias', cantidad: '1 paquete x20', forma: 'paquete', color: '#E8F0FE' },
  { id: 'esparadrapo', nombre: 'Esparadrapo de tela 4"', cantidad: '1 rollo', forma: 'rollo', color: '#FDECEA' },
  { id: 'bajalenguas', nombre: 'Bajalenguas', cantidad: '1 paquete x20', forma: 'paquete', color: '#FEF6E0' },
  { id: 'guantes', nombre: 'Guantes de látex', cantidad: '1 caja x100', forma: 'caja', color: '#E8F5E9' },
  { id: 'venda_elastica', nombre: 'Vendas elásticas (2", 3", 5")', cantidad: '1 c/u', forma: 'rollo', color: '#FDECEA' },
  { id: 'venda_algodon', nombre: 'Vendas de algodón (3"x5yda)', cantidad: '2', forma: 'rollo', color: '#EDE7F6' },
  { id: 'yodopovidona', nombre: 'Yodopovidona', cantidad: '1 frasco x120ml', forma: 'frasco', color: '#FFF3E0' },
  { id: 'solucion_salina', nombre: 'Solución salina', cantidad: '2 x 250-500cc', forma: 'frasco', color: '#E1F5FE' },
  { id: 'termometro', nombre: 'Termómetro digital', cantidad: '1', forma: 'caja', color: '#E8F0FE' },
  { id: 'alcohol', nombre: 'Alcohol antiséptico', cantidad: '1 frasco x275ml', forma: 'frasco', color: '#F3E5F5' },
]

/** Ficha del botiquín guardada en `inventario_equipos.atributos` para tipo_equipo='botiquin'. */
export type AtributosBotiquin = {
  tipo_botiquin: TipoBotiquin
  /** IDs de `CONTENIDO_BOTIQUIN_TIPO_A` marcados como faltantes/vencidos en la última ronda — pendientes de reponer. */
  elementos_faltantes: string[]
}

export const ATRIBUTOS_BOTIQUIN_VACIO: AtributosBotiquin = { tipo_botiquin: 'A', elementos_faltantes: [] }

export function leerAtributosBotiquin(atributos: unknown): AtributosBotiquin {
  const a = (atributos ?? {}) as Partial<AtributosBotiquin>
  return {
    tipo_botiquin: a.tipo_botiquin ?? 'A',
    elementos_faltantes: Array.isArray(a.elementos_faltantes) ? a.elementos_faltantes : [],
  }
}
