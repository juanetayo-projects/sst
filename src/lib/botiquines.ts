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

/**
 * Un elemento del catálogo administrable `catalogo_elementos_botiquin` (Administración → Catálogos).
 * El contenido inicial (10 elementos) se sembró desde la Resolución 705 de 2007 (Min. Protección
 * Social) — el admin puede agregar/quitar elementos desde ahí; ya no vive hardcodeado en el código.
 */
export type ElementoBotiquin = {
  id: string
  nombre: string
  cantidad: string | null
  forma: FormaIcono
}

/** Ficha del botiquín guardada en `inventario_equipos.atributos` para tipo_equipo='botiquin'. */
export type AtributosBotiquin = {
  tipo_botiquin: TipoBotiquin
  /** IDs de `catalogo_elementos_botiquin` marcados como faltantes/vencidos en la última ronda — pendientes de reponer. */
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
