import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardPlus,
  History,
  Users,
  Settings2,
  ClipboardList,
  BarChart3,
  Gauge,
  Image,
  CalendarClock,
  Archive,
  Flame,
  ShoppingCart,
  ListChecks,
  HeartPulse,
  ClipboardCheck,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, modulo: null as string | null },
  { to: '/inspecciones/nueva', label: 'Nueva Inspección', icon: ClipboardPlus, end: false, modulo: 'inspecciones' },
  { to: '/inspecciones', label: 'Historial', icon: History, end: true, modulo: 'inspecciones' },
  { to: '/programacion', label: 'Programación', icon: CalendarClock, end: false, modulo: 'programacion' },
  { to: '/vencimientos', label: 'Vencimientos', icon: Flame, end: true, modulo: 'vencimientos' },
  { to: '/inventario', label: 'Inventario', icon: Archive, end: true, modulo: 'inventario' },
  { to: '/solicitudes-compra', label: 'Solicitudes de Compra', icon: ShoppingCart, end: true, modulo: 'solicitudes-compra' },
  { to: '/compromisos', label: 'Compromisos', icon: ListChecks, end: true, modulo: 'compromisos' },
  { to: '/estadisticas', label: 'Estadísticas', icon: BarChart3, end: true, modulo: 'estadisticas' },
  { to: '/informe-ejecutivo', label: 'Informe Ejecutivo', icon: Gauge, end: true, modulo: 'informe-ejecutivo' },
  { to: '/infografia', label: 'Infografía', icon: Image, end: true, modulo: 'infografia' },
]

const NAV_ADMIN = [
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/catalogos', label: 'Catálogos', icon: Settings2 },
  { to: '/admin/encuestas', label: 'Encuestas', icon: ClipboardList },
]

function ItemNav({
  to,
  label,
  icon: Icon,
  end,
  onClick,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  onClick: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-white/15 text-white shadow-relieve-oscuro-hundido'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function Sidebar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { perfil, modulosPermitidos } = useAuth()
  const { pathname } = useLocation()
  const enAdmin = pathname.startsWith('/admin')

  const itemsVisibles = NAV_ITEMS.filter((item) => item.to !== '/informe-ejecutivo' || perfil?.role !== 'encuestador').filter(
    (item) => !item.modulo || !modulosPermitidos || modulosPermitidos.has(item.modulo)
  )

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCerrar} aria-hidden />
      )}
      <aside
        className={cn(
          'fondo-sidebar fixed inset-y-0 left-0 z-50 flex w-60 flex-col shadow-[10px_0_30px_-12px_rgba(13,45,107,0.5)] transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0',
          abierto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col items-center gap-1 border-b border-white/15 px-4 py-5 text-center">
          <img
            src={`${import.meta.env.BASE_URL}images/logo_cacsb_blanc.webp`}
            alt="CAC Santa Bárbara"
            className="h-10"
          />
          <span className="mt-1.5 text-sm font-bold text-white">Inspecciones SST</span>
          <span className="text-[10px] uppercase tracking-wider text-white/60">
            Seguridad y Salud en el Trabajo
          </span>
        </div>

        <nav className="scroll-sutil-oscuro flex-1 space-y-1 overflow-y-auto p-3">
          <Accordion type="multiple" defaultValue={['rondas']}>
            <AccordionItem value="rondas" className="border-none">
              <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white hover:no-underline [&>svg]:text-white/60">
                <span className="flex items-center gap-2.5">
                  <ClipboardCheck className="size-4 shrink-0" />
                  RONDAS
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 pb-0 pl-2">
                {itemsVisibles.map((item) => (
                  <ItemNav key={item.to} {...item} onClick={onCerrar} />
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="arl" className="border-none">
              <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white hover:no-underline [&>svg]:text-white/60">
                <span className="flex items-center gap-2.5">
                  <HeartPulse className="size-4 shrink-0" />
                  ARL
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pl-2">
                <p className="px-3 py-2 text-xs leading-relaxed text-white/50">
                  Próximamente: radicar, aprobación, reportes y estadísticas de ARL.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {perfil?.role === 'admin' && (
            <Accordion type="single" collapsible defaultValue={enAdmin ? 'admin' : undefined} className="pt-1">
              <AccordionItem value="admin" className="border-none">
                <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white hover:no-underline [&>svg]:text-white/60">
                  Administración
                </AccordionTrigger>
                <AccordionContent className="space-y-1 pb-0 pl-2">
                  {NAV_ADMIN.map((item) => (
                    <ItemNav key={item.to} {...item} end onClick={onCerrar} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </nav>
      </aside>
    </>
  )
}
