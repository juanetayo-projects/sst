import { useEffect, useState, type FormEvent } from 'react'
import { Plus, KeyRound, Trash2, ShieldCheck, UserPlus, LayoutGrid } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { PageHeader } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'
import { PasswordStrengthMeter, CampoConfirmarPassword } from '@/components/ui/password-strength'
import { CATEGORIAS_SST } from '@/domain/categoriasSST'
import { MODULOS_APP } from '@/domain/modulosApp'

type Perfil = {
  id: string
  email: string
  nombre_completo: string
  role: 'admin' | 'inspector' | 'encuestador'
  activo: boolean
}

/**
 * `supabase.functions.invoke` deja en `error.message` el texto genérico "Edge Function returned a
 * non-2xx status code" — el mensaje real que la función sí envía va en el cuerpo de `error.context`.
 */
async function mensajeErrorEdge(error: unknown): Promise<string> {
  const err = error as { message?: string; context?: Response }
  if (err?.context) {
    try {
      const body = await err.context.clone().json()
      if (body?.error) return body.error as string
    } catch {
      // sin cuerpo JSON legible — se usa el mensaje genérico de abajo
    }
  }
  return err?.message ?? 'Error desconocido'
}

export default function Usuarios() {
  const { perfil: perfilPropio } = useAuth()
  const [usuarios, setUsuarios] = useState<Perfil[]>([])
  const [cargando, setCargando] = useState(true)

  const [modalNuevo, setModalNuevo] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [role, setRole] = useState<'admin' | 'inspector' | 'encuestador'>('inspector')
  const [creando, setCreando] = useState(false)

  const [reseteando, setReseteando] = useState<Perfil | null>(null)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('')
  const [guardandoReset, setGuardandoReset] = useState(false)

  const [aEliminar, setAEliminar] = useState<Perfil | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const [permisosDe, setPermisosDe] = useState<Perfil | null>(null)
  const [categoriasPermitidas, setCategoriasPermitidas] = useState<Set<string>>(new Set())
  const [cargandoPermisos, setCargandoPermisos] = useState(false)
  const [guardandoPermisos, setGuardandoPermisos] = useState(false)

  const [modulosDe, setModulosDe] = useState<Perfil | null>(null)
  const [modulosPermitidos, setModulosPermitidos] = useState<Set<string>>(new Set())
  const [cargandoModulos, setCargandoModulos] = useState(false)
  const [guardandoModulos, setGuardandoModulos] = useState(false)

  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from('profiles')
      .select('*')
      .order('nombre_completo')
      .then(({ data }) => {
        setUsuarios((data ?? []) as Perfil[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  async function crearUsuario(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmarPassword) {
      setMensaje({ tipo: 'error', titulo: 'Las contraseñas no coinciden', texto: 'Verifica ambos campos.' })
      return
    }
    setCreando(true)
    const { error } = await supabase.functions.invoke('admin-usuarios', {
      body: { accion: 'crear', email, password, nombre_completo: nombreCompleto, role },
    })
    setCreando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo crear el usuario', texto: await mensajeErrorEdge(error) })
      return
    }
    setModalNuevo(false)
    setEmail('')
    setPassword('')
    setConfirmarPassword('')
    setNombreCompleto('')
    setRole('inspector')
    setMensaje({ tipo: 'exito', titulo: 'Usuario creado', texto: `${nombreCompleto} ya puede iniciar sesión.` })
    cargar()
  }

  async function cambiarRol(u: Perfil, nuevoRole: 'admin' | 'inspector' | 'encuestador') {
    await supabase.from('profiles').update({ role: nuevoRole }).eq('id', u.id)
    cargar()
  }

  async function alternarActivo(u: Perfil) {
    if (u.id === perfilPropio?.id) return
    await supabase.from('profiles').update({ activo: !u.activo }).eq('id', u.id)
    cargar()
  }

  async function resetearPassword(e: FormEvent) {
    e.preventDefault()
    if (!reseteando) return
    if (nuevaPassword !== confirmarNuevaPassword) {
      setMensaje({ tipo: 'error', titulo: 'Las contraseñas no coinciden', texto: 'Verifica ambos campos.' })
      return
    }
    setGuardandoReset(true)
    const { error } = await supabase.functions.invoke('admin-usuarios', {
      body: { accion: 'reset', id: reseteando.id, password: nuevaPassword },
    })
    setGuardandoReset(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo restablecer', texto: await mensajeErrorEdge(error) })
      return
    }
    setReseteando(null)
    setNuevaPassword('')
    setConfirmarNuevaPassword('')
    setMensaje({ tipo: 'exito', titulo: 'Contraseña actualizada', texto: 'La nueva contraseña ya está activa.' })
  }

  async function eliminarUsuario() {
    if (!aEliminar) return
    setEliminando(true)
    const { error } = await supabase.functions.invoke('admin-usuarios', {
      body: { accion: 'eliminar', id: aEliminar.id },
    })
    setEliminando(false)
    setAEliminar(null)
    if (error) {
      const detalle = await mensajeErrorEdge(error)
      const esFK = detalle.toLowerCase().includes('foreign key')
      setMensaje({
        tipo: 'error',
        titulo: 'No se pudo eliminar',
        texto: esFK
          ? 'Este usuario tiene inspecciones registradas y no puede eliminarse. Desactívalo en su lugar.'
          : detalle,
      })
      return
    }
    cargar()
  }

  function abrirPermisos(u: Perfil) {
    setPermisosDe(u)
    setCargandoPermisos(true)
    supabase
      .from('permisos_ronda_categoria')
      .select('categoria_sst')
      .eq('profile_id', u.id)
      .then(({ data }) => {
        setCategoriasPermitidas(new Set((data ?? []).map((r) => r.categoria_sst)))
        setCargandoPermisos(false)
      })
  }

  async function guardarPermisos() {
    if (!permisosDe) return
    setGuardandoPermisos(true)
    await supabase.from('permisos_ronda_categoria').delete().eq('profile_id', permisosDe.id)
    if (categoriasPermitidas.size > 0) {
      const filas = Array.from(categoriasPermitidas).map((categoria_sst) => ({
        profile_id: permisosDe.id,
        categoria_sst,
      }))
      const { error } = await supabase.from('permisos_ronda_categoria').insert(filas)
      if (error) {
        setGuardandoPermisos(false)
        setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
        return
      }
    }
    setGuardandoPermisos(false)
    setPermisosDe(null)
    setMensaje({ tipo: 'exito', titulo: 'Permisos actualizados', texto: `Se guardaron los permisos de ${permisosDe.nombre_completo}.` })
  }

  function abrirModulos(u: Perfil) {
    setModulosDe(u)
    setCargandoModulos(true)
    supabase
      .from('permisos_modulo')
      .select('modulo')
      .eq('profile_id', u.id)
      .then(({ data }) => {
        setModulosPermitidos(new Set((data ?? []).map((r) => r.modulo)))
        setCargandoModulos(false)
      })
  }

  async function guardarModulos() {
    if (!modulosDe) return
    setGuardandoModulos(true)
    await supabase.from('permisos_modulo').delete().eq('profile_id', modulosDe.id)
    if (modulosPermitidos.size > 0) {
      const filas = Array.from(modulosPermitidos).map((modulo) => ({ profile_id: modulosDe.id, modulo }))
      const { error } = await supabase.from('permisos_modulo').insert(filas)
      if (error) {
        setGuardandoModulos(false)
        setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
        return
      }
    }
    setGuardandoModulos(false)
    setModulosDe(null)
    setMensaje({ tipo: 'exito', titulo: 'Accesos actualizados', texto: `Se guardaron los accesos de ${modulosDe.nombre_completo}.` })
  }

  return (
    <div>
      <PageHeader
        titulo="Usuarios"
        acciones={
          <Button size="sm" onClick={() => setModalNuevo(true)}>
            <Plus />
            Nuevo usuario
          </Button>
        }
      />

      <Card className="overflow-x-auto">
        {cargando ? (
          <div className="p-4">
            <SkeletonTabla filas={4} columnas={5} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Correo</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esUsuarioActual = u.id === perfilPropio?.id
                return (
                  <tr key={u.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      {u.nombre_completo}
                      {esUsuarioActual && (
                        <Badge tono="info" className="ml-2">
                          Tú
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                    <td className="px-3 py-2">
                      <Select value={u.role} onValueChange={(v) => cambiarRol(u, v as 'admin' | 'inspector' | 'encuestador')}>
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="inspector">Inspector</SelectItem>
                          <SelectItem value="encuestador">Encuestador</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => alternarActivo(u)}
                        disabled={esUsuarioActual}
                        className="disabled:cursor-not-allowed"
                      >
                        <Badge tono={u.activo ? 'exito' : 'neutro'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Permisos por ronda" onClick={() => abrirPermisos(u)}>
                          <ShieldCheck className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Accesos a módulos" onClick={() => abrirModulos(u)}>
                          <LayoutGrid className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setReseteando(u)}>
                          <KeyRound className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={esUsuarioActual}
                          onClick={() => setAEliminar(u)}
                        >
                          <Trash2 className="size-3.5 text-[var(--error)]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
        <DialogContent className="max-w-sm">
          <form onSubmit={crearUsuario}>
            <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
              <UserPlus className="size-5 text-white" />
              <DialogTitle className="text-white">Nuevo usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="nuevo-nombre">Nombre completo</Label>
                <Input id="nuevo-nombre" required value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nuevo-email">Correo electrónico</Label>
                <Input id="nuevo-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nuevo-password">Contraseña temporal</Label>
                <Input
                  id="nuevo-password"
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrengthMeter password={password} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nuevo-password-confirmar">Confirmar contraseña</Label>
                <Input
                  id="nuevo-password-confirmar"
                  type="text"
                  required
                  minLength={8}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                />
                <CampoConfirmarPassword password={password} confirmar={confirmarPassword} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nuevo-role">Rol</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'inspector' | 'encuestador')}>
                  <SelectTrigger id="nuevo-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="encuestador">Encuestador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalNuevo(false)
                  setPassword('')
                  setConfirmarPassword('')
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" cargando={creando}>
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reseteando !== null}
        onOpenChange={(v) => {
          if (!v) {
            setReseteando(null)
            setNuevaPassword('')
            setConfirmarNuevaPassword('')
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <form onSubmit={resetearPassword}>
            <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
              <KeyRound className="size-5 text-white" />
              <DialogTitle className="text-white">Restablecer contraseña</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{reseteando?.nombre_completo}</p>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="password-reset">Nueva contraseña</Label>
              <Input
                id="password-reset"
                type="text"
                required
                minLength={8}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={nuevaPassword} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password-reset-confirmar">Confirmar contraseña</Label>
              <Input
                id="password-reset-confirmar"
                type="text"
                required
                minLength={8}
                value={confirmarNuevaPassword}
                onChange={(e) => setConfirmarNuevaPassword(e.target.value)}
              />
              <CampoConfirmarPassword password={nuevaPassword} confirmar={confirmarNuevaPassword} />
            </div>
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReseteando(null)
                  setNuevaPassword('')
                  setConfirmarNuevaPassword('')
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" cargando={guardandoReset}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={aEliminar !== null}
        titulo={`Eliminar a "${aEliminar?.nombre_completo}"`}
        descripcion="Perderá el acceso de inmediato. Si tiene inspecciones registradas, prefiere desactivarlo en la tabla en su lugar."
        cargando={eliminando}
        onConfirm={eliminarUsuario}
        onCancel={() => setAEliminar(null)}
      />

      <Dialog open={permisosDe !== null} onOpenChange={(v) => !v && setPermisosDe(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
            <ShieldCheck className="size-5 text-white" />
            <DialogTitle className="text-white">Permisos por ronda</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{permisosDe?.nombre_completo}</p>
          {cargandoPermisos ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 rounded-lg border border-border bg-accent/40 p-2.5 text-sm font-medium">
                <Checkbox
                  checked={categoriasPermitidas.size === 0}
                  onCheckedChange={(v) => setCategoriasPermitidas(v === true ? new Set() : new Set(CATEGORIAS_SST.map((c) => c.id)))}
                />
                Todas las rondas
              </label>
              <p className="text-xs text-muted-foreground">
                O elige puntualmente a qué rondas tiene acceso para iniciar inspecciones:
              </p>
              <div className="space-y-1.5">
                {CATEGORIAS_SST.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={categoriasPermitidas.size > 0 && categoriasPermitidas.has(c.id)}
                      onCheckedChange={(v) =>
                        setCategoriasPermitidas((prev) => {
                          const copia = new Set(prev.size === 0 ? CATEGORIAS_SST.map((cc) => cc.id) : prev)
                          if (v === true) copia.add(c.id)
                          else copia.delete(c.id)
                          return copia
                        })
                      }
                    />
                    <c.icono className="size-3.5 text-muted-foreground" />
                    {c.nombre}
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={() => setPermisosDe(null)}>
              Cancelar
            </Button>
            <Button type="button" cargando={guardandoPermisos} onClick={guardarPermisos}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modulosDe !== null} onOpenChange={(v) => !v && setModulosDe(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="franja-institucional -m-6 mb-4 flex-row items-center gap-2 space-y-0 rounded-t-xl p-4">
            <LayoutGrid className="size-5 text-white" />
            <DialogTitle className="text-white">Accesos a módulos</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{modulosDe?.nombre_completo}</p>
          {cargandoModulos ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Cargando…</div>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 rounded-lg border border-border bg-accent/40 p-2.5 text-sm font-medium">
                <Checkbox
                  checked={modulosPermitidos.size === 0}
                  onCheckedChange={(v) => setModulosPermitidos(v === true ? new Set() : new Set(MODULOS_APP.map((m) => m.id)))}
                />
                Todos los módulos
              </label>
              <p className="text-xs text-muted-foreground">
                O elige puntualmente qué opciones del menú "Rondas" puede ver este usuario (Dashboard siempre es visible):
              </p>
              <div className="space-y-1.5">
                {MODULOS_APP.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={modulosPermitidos.size > 0 && modulosPermitidos.has(m.id)}
                      onCheckedChange={(v) =>
                        setModulosPermitidos((prev) => {
                          const copia = new Set(prev.size === 0 ? MODULOS_APP.map((mm) => mm.id) : prev)
                          if (v === true) copia.add(m.id)
                          else copia.delete(m.id)
                          return copia
                        })
                      }
                    />
                    <m.icono className="size-3.5 text-muted-foreground" />
                    {m.nombre}
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={() => setModulosDe(null)}>
              Cancelar
            </Button>
            <Button type="button" cargando={guardandoModulos} onClick={guardarModulos}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
