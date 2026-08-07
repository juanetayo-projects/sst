import { useEffect, useState, type FormEvent } from 'react'
import { Plus, KeyRound, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { PageHeader } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { SkeletonTabla } from '@/components/ui/skeleton'
import { PasswordStrengthMeter, CampoConfirmarPassword } from '@/components/ui/password-strength'

type Perfil = {
  id: string
  email: string
  nombre_completo: string
  role: 'admin' | 'inspector'
  activo: boolean
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
  const [role, setRole] = useState<'admin' | 'inspector'>('inspector')
  const [creando, setCreando] = useState(false)

  const [reseteando, setReseteando] = useState<Perfil | null>(null)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('')
  const [guardandoReset, setGuardandoReset] = useState(false)

  const [aEliminar, setAEliminar] = useState<Perfil | null>(null)
  const [eliminando, setEliminando] = useState(false)

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
      setMensaje({ tipo: 'error', titulo: 'No se pudo crear el usuario', texto: error.message })
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

  async function cambiarRol(u: Perfil, nuevoRole: 'admin' | 'inspector') {
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
      setMensaje({ tipo: 'error', titulo: 'No se pudo restablecer', texto: error.message })
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
      const esFK = error.message?.toLowerCase().includes('foreign key')
      setMensaje({
        tipo: 'error',
        titulo: 'No se pudo eliminar',
        texto: esFK
          ? 'Este usuario tiene inspecciones registradas y no puede eliminarse. Desactívalo en su lugar.'
          : error.message,
      })
      return
    }
    cargar()
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
                      <Select value={u.role} onValueChange={(v) => cambiarRol(u, v as 'admin' | 'inspector')}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="inspector">Inspector</SelectItem>
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
            <DialogHeader>
              <DialogTitle>Nuevo usuario</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
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
                <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'inspector')}>
                  <SelectTrigger id="nuevo-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspector">Inspector</SelectItem>
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
            <DialogHeader>
              <DialogTitle>Restablecer contraseña</DialogTitle>
            </DialogHeader>
            <p className="mt-1 text-sm text-muted-foreground">{reseteando?.nombre_completo}</p>
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

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
