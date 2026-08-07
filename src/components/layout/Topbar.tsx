import { Menu, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export function Topbar({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  const { perfil } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <button
        type="button"
        onClick={onAbrirMenu}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="hidden text-sm font-semibold text-[var(--cac-azul)] md:block">
        Sistema de Inspecciones SST
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent">
          <div className="flex size-7 items-center justify-center rounded-full bg-[var(--cac-azul-50)] text-[var(--cac-azul)]">
            <User className="size-4" />
          </div>
          <span className="hidden font-medium sm:inline">{perfil?.nombre_completo ?? '…'}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span>{perfil?.nombre_completo}</span>
            <Badge tono={perfil?.role === 'admin' ? 'info' : 'neutro'} className="w-fit">
              {perfil?.role === 'admin' ? 'Administrador' : 'Inspector'}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
