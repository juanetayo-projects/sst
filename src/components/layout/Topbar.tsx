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
    <header className="fondo-sidebar sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-[0_4px_14px_-4px_rgba(13,45,107,0.45)]">
      <button
        type="button"
        onClick={onAbrirMenu}
        className="rounded-md p-1.5 text-white/85 hover:bg-white/10 hover:text-white md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="hidden text-sm font-semibold text-white md:block">
        Sistema de Inspecciones SST
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white hover:bg-white/10">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/15 text-white">
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
