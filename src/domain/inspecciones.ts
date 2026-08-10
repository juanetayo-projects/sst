import { supabase } from '@/lib/supabase'

export type TipoCampo = 'select' | 'texto' | 'fecha' | 'booleano' | 'opcion'
export type TipoRespuesta = 'cumple_no_cumple_na' | 'si_no_na'

export type TipoInspeccion = {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  tipo_respuesta: TipoRespuesta
  requiere_trabajo: boolean
  tiene_hallazgos: boolean
  orden: number
  activo: boolean
}

export type CategoriaPregunta = {
  id: string
  tipo_inspeccion_id: string
  nombre: string
  color: string
  orden: number
  condicion_campo: string | null
  condicion_valor: string | null
}

export type Pregunta = {
  id: string
  tipo_inspeccion_id: string
  categoria_id: string | null
  texto: string
  tipo_campo: TipoCampo
  opciones: string[] | null
  orden: number
  obligatoria: boolean
  activa: boolean
}

export const OPCIONES_RESPUESTA: Record<TipoRespuesta, string[]> = {
  cumple_no_cumple_na: ['Cumple', 'No Cumple', 'No Aplica'],
  si_no_na: ['Sí', 'No', 'No Aplica'],
}

export const OPCIONES_BOOLEANO = ['Sí', 'No']

/** Umbral de `orden` a partir del cual una pregunta de encabezado (categoria_id null) es de cierre. */
const ORDEN_CIERRE = 900

export type EstructuraInspeccion = {
  tipo: TipoInspeccion
  categorias: CategoriaPregunta[]
  encabezado: Pregunta[]
  cierre: Pregunta[]
  porCategoria: Map<string, Pregunta[]>
}

export async function cargarEstructuraInspeccion(codigo: string): Promise<EstructuraInspeccion> {
  const { data: tipo, error: errorTipo } = await supabase
    .from('tipos_inspeccion')
    .select('*')
    .eq('codigo', codigo)
    .single()
  if (errorTipo || !tipo) throw new Error('Tipo de inspección no encontrado')

  const [{ data: categorias, error: errorCat }, { data: preguntas, error: errorPreg }] = await Promise.all([
    supabase
      .from('categorias_pregunta')
      .select('*')
      .eq('tipo_inspeccion_id', tipo.id)
      .order('orden'),
    supabase
      .from('preguntas')
      .select('*')
      .eq('tipo_inspeccion_id', tipo.id)
      .eq('activa', true)
      .order('orden'),
  ])
  if (errorCat) throw errorCat
  if (errorPreg) throw errorPreg

  const todasPreguntas = (preguntas ?? []) as Pregunta[]
  const encabezado = todasPreguntas.filter((p) => p.categoria_id === null && p.orden < ORDEN_CIERRE)
  const cierre = todasPreguntas.filter((p) => p.categoria_id === null && p.orden >= ORDEN_CIERRE)

  const porCategoria = new Map<string, Pregunta[]>()
  for (const p of todasPreguntas) {
    if (p.categoria_id === null) continue
    const lista = porCategoria.get(p.categoria_id) ?? []
    lista.push(p)
    porCategoria.set(p.categoria_id, lista)
  }

  return {
    tipo: tipo as TipoInspeccion,
    categorias: (categorias ?? []) as CategoriaPregunta[],
    encabezado,
    cierre,
    porCategoria,
  }
}

/** Igual que `cargarEstructuraInspeccion`, pero por id de tipo e incluyendo preguntas inactivas — para el editor admin. */
export async function cargarEstructuraAdmin(tipoId: string): Promise<Omit<EstructuraInspeccion, 'tipo'>> {
  const [{ data: categorias, error: errorCat }, { data: preguntas, error: errorPreg }] = await Promise.all([
    supabase.from('categorias_pregunta').select('*').eq('tipo_inspeccion_id', tipoId).order('orden'),
    supabase.from('preguntas').select('*').eq('tipo_inspeccion_id', tipoId).order('orden'),
  ])
  if (errorCat) throw errorCat
  if (errorPreg) throw errorPreg

  const todasPreguntas = (preguntas ?? []) as Pregunta[]
  const encabezado = todasPreguntas.filter((p) => p.categoria_id === null && p.orden < ORDEN_CIERRE)
  const cierre = todasPreguntas.filter((p) => p.categoria_id === null && p.orden >= ORDEN_CIERRE)

  const porCategoria = new Map<string, Pregunta[]>()
  for (const p of todasPreguntas) {
    if (p.categoria_id === null) continue
    const lista = porCategoria.get(p.categoria_id) ?? []
    lista.push(p)
    porCategoria.set(p.categoria_id, lista)
  }

  return { categorias: (categorias ?? []) as CategoriaPregunta[], encabezado, cierre, porCategoria }
}

/** Una categoría condicional solo se muestra si la pregunta de encabezado que la controla tiene ese valor exacto. */
export function categoriaEsVisible(
  categoria: CategoriaPregunta,
  encabezado: Pregunta[],
  respuestas: Record<string, string>
): boolean {
  if (!categoria.condicion_campo) return true
  const preguntaControl = encabezado.find((p) => p.texto === categoria.condicion_campo)
  if (!preguntaControl) return true
  return respuestas[preguntaControl.id] === categoria.condicion_valor
}

const ORDEN_VALOR_RESPUESTA = ['Cumple', 'Sí', 'No Cumple', 'No', 'No Aplica']

export type DistribucionRespuesta = { valor: string; cantidad: number; pct: number }

/** Cantidad y % de respuestas por tipo (Cumple/No Cumple/No Aplica, Sí/No), para las preguntas de opción/booleano de un grupo. */
export function calcularDistribucionRespuestas(preguntas: Pregunta[], respuestas: Record<string, string>): DistribucionRespuesta[] {
  const conteo = new Map<string, number>()
  for (const p of preguntas) {
    if (p.tipo_campo !== 'opcion' && p.tipo_campo !== 'booleano') continue
    const valor = respuestas[p.id]
    if (!valor) continue
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1)
  }

  const total = Array.from(conteo.values()).reduce((a, b) => a + b, 0)
  if (total === 0) return []

  return Array.from(conteo.entries())
    .sort(([a], [b]) => {
      const ia = ORDEN_VALOR_RESPUESTA.indexOf(a)
      const ib = ORDEN_VALOR_RESPUESTA.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    .map(([valor, cantidad]) => ({ valor, cantidad, pct: Math.round((cantidad / total) * 100) }))
}

/** Detecta las preguntas de cierre estándar (A1-A4) para poblar las columnas dedicadas de `inspecciones`. */
export function mapearCierreAColumnas(cierre: Pregunta[], respuestas: Record<string, string>) {
  let fortalezas: string | null = null
  let hallazgos: string | null = null
  let urgente = false
  let responsable: string | null = null

  for (const p of cierre) {
    const valor = respuestas[p.id]
    if (!valor) continue
    const texto = p.texto.toUpperCase()
    if (texto.includes('FORTALEZA')) fortalezas = valor
    else if (texto.includes('HALLAZGO')) hallazgos = valor
    else if (texto.includes('URGENTE')) urgente = valor === 'Sí'
    else if (texto.includes('RESPONSABLE DE LA INSPECCION')) responsable = valor
  }

  return { fortalezas, hallazgos, urgente, responsable }
}
