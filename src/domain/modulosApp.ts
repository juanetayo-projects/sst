import {
  ClipboardPlus,
  History,
  CalendarClock,
  Flame,
  Archive,
  ShoppingCart,
  ListChecks,
  BarChart3,
  Gauge,
  Image,
  type LucideIcon,
} from 'lucide-react'

export type ModuloApp = {
  id: string
  nombre: string
  icono: LucideIcon
}

/**
 * Catálogo de módulos/opciones asignables por usuario (tabla `permisos_modulo`), análogo a
 * `CATEGORIAS_SST` para permisos por ronda. Dashboard queda fuera a propósito: es la página de
 * inicio y siempre debe verse. Al agregar una página nueva al grupo "Rondas" del sidebar, agréguese
 * aquí también para que sea asignable.
 */
export const MODULOS_APP: ModuloApp[] = [
  { id: 'nueva-inspeccion', nombre: 'Nueva Inspección', icono: ClipboardPlus },
  { id: 'historial', nombre: 'Historial', icono: History },
  { id: 'programacion', nombre: 'Programación', icono: CalendarClock },
  { id: 'vencimientos', nombre: 'Vencimientos', icono: Flame },
  { id: 'inventario', nombre: 'Inventario', icono: Archive },
  { id: 'solicitudes-compra', nombre: 'Solicitudes de Compra', icono: ShoppingCart },
  { id: 'compromisos', nombre: 'Compromisos', icono: ListChecks },
  { id: 'estadisticas', nombre: 'Estadísticas', icono: BarChart3 },
  { id: 'informe-ejecutivo', nombre: 'Informe Ejecutivo', icono: Gauge },
  { id: 'infografia', nombre: 'Infografía', icono: Image },
]
