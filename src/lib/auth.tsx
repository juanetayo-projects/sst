import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'

export type Perfil = {
  id: string
  email: string
  nombre_completo: string
  role: 'admin' | 'inspector' | 'encuestador'
  activo: boolean
}

type AuthCtx = {
  session: Session | null
  perfil: Perfil | null
  /** IDs de `domain/modulosApp.ts` que el usuario puede ver. `null` = sin restricción (admin, o sin filas en `permisos_modulo`). */
  modulosPermitidos: Set<string> | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ session: null, perfil: null, modulosPermitidos: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [modulosPermitidos, setModulosPermitidos] = useState<Set<string> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
        if (data.session) cargarPerfil(data.session.user.id)
      })
      .finally(() => setLoading(false))

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion)
      if (nuevaSesion) cargarPerfil(nuevaSesion.user.id)
      else {
        setPerfil(null)
        setModulosPermitidos(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function cargarPerfil(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (!data) return
    setPerfil(data as Perfil)
    if (data.role === 'admin') {
      setModulosPermitidos(null)
      return
    }
    const { data: permisos } = await supabase.from('permisos_modulo').select('modulo').eq('profile_id', uid)
    // Sin filas = sin restricción (ve todos los módulos) — mismo criterio que permisos_ronda_categoria.
    setModulosPermitidos(permisos && permisos.length > 0 ? new Set(permisos.map((p) => p.modulo)) : null)
  }

  return <Ctx.Provider value={{ session, perfil, modulosPermitidos, loading }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
