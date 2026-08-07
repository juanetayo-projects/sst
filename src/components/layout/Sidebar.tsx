import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardPlus, History, Users, Settings2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inspecciones/nueva', label: 'Nueva Inspección', icon: ClipboardPlus, end: false },
  { to: '/inspecciones', label: 'Historial', icon: History, end: true },
]

const NAV_ADMIN = [
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/catalogos', label: 'Catálogos', icon: Settings2 },
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
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[var(--cac-azul)] text-white'
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function Sidebar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { perfil } = useAuth()
  const { pathname } = useLocation()
  const enAdmin = pathname.startsWith('/admin')

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCerrar} aria-hidden />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0',
          abierto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="franja-institucional flex items-center justify-center px-4 py-4">
          <img
            src={`${import.meta.env.BASE_URL}images/logo_cacsb_blanc.png`}
            alt="CAC Santa Bárbara"
            className="h-9"
          />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <ItemNav key={item.to} {...item} onClick={onCerrar} />
          ))}

          {perfil?.role === 'admin' && (
            <Accordion type="single" collapsible defaultValue={enAdmin ? 'admin' : undefined} className="pt-1">
              <AccordionItem value="admin">
                <AccordionTrigger className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:no-underline">
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
