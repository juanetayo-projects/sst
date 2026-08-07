import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function ProtectedRoute({
  children,
  soloAdmin = false,
}: {
  children: React.ReactNode
  soloAdmin?: boolean
}) {
  const { session, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-muted-foreground">
        Cargando…
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (perfil && !perfil.activo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Tu cuenta está inactiva. Contacta al administrador del sistema si crees que esto es un error.
        </p>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </Button>
      </div>
    )
  }
  if (soloAdmin && perfil && perfil.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
