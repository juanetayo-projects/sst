import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

export default function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [recuperarAbierto, setRecuperarAbierto] = useState(false)
  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setEntrando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setEntrando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo iniciar sesión', texto: 'Correo o contraseña incorrectos.' })
    }
  }

  async function enviarRecuperacion(e: FormEvent) {
    e.preventDefault()
    setEnviandoRecuperar(true)
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}#/reset-password`,
    })
    setEnviandoRecuperar(false)
    setRecuperarAbierto(false)
    setEmailRecuperar('')
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo enviar el correo', texto: error.message })
    } else {
      setMensaje({
        tipo: 'exito',
        titulo: 'Correo enviado',
        texto: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      })
    }
  }

  return (
    <div className="fondo-institucional-oscuro flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center justify-center rounded-3xl bg-white/10 p-4 shadow-relieve-oscuro">
          <img
            src={`${import.meta.env.BASE_URL}images/logo_cacsb_blanc.png`}
            alt="CAC Santa Bárbara"
            className="h-14"
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-white">
          <ShieldCheck className="size-4" />
          <h1 className="text-sm font-semibold">Sistema de Inspecciones SST</h1>
        </div>
        <p className="text-xs text-white/60">Clínica de Alta Complejidad Santa Bárbara</p>
      </div>

      <main className="w-full max-w-sm">
        <div className="superficie-azul rounded-2xl p-6">
          <form onSubmit={entrar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@cacsantabarbara.co"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" cargando={entrando} className="w-full">
              Iniciar Sesión
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setRecuperarAbierto(true)}
            className="mt-4 w-full text-center text-xs text-[var(--cac-azul-contraste)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </main>

      <Dialog open={recuperarAbierto} onOpenChange={setRecuperarAbierto}>
        <DialogContent className="max-w-sm">
          <form onSubmit={enviarRecuperacion}>
            <DialogHeader>
              <DialogTitle>Recuperar contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="email-recuperar">Correo electrónico</Label>
              <Input
                id="email-recuperar"
                type="email"
                required
                value={emailRecuperar}
                onChange={(e) => setEmailRecuperar(e.target.value)}
                placeholder="nombre@cacsantabarbara.co"
              />
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setRecuperarAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={enviandoRecuperar}>
                Enviar enlace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
