import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { PasswordStrengthMeter, CampoConfirmarPassword } from '@/components/ui/password-strength'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setMensaje({ tipo: 'error', titulo: 'Contraseña muy corta', texto: 'Debe tener al menos 8 caracteres.' })
      return
    }
    if (password !== confirmar) {
      setMensaje({ tipo: 'error', titulo: 'Las contraseñas no coinciden', texto: 'Verifica ambos campos.' })
      return
    }
    setGuardando(true)
    const { error } = await supabase.auth.updateUser({ password })
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo actualizar', texto: error.message })
    } else {
      setMensaje({ tipo: 'exito', titulo: 'Contraseña actualizada', texto: 'Ya puedes iniciar sesión con tu nueva contraseña.' })
      setTimeout(() => navigate('/', { replace: true }), 1500)
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
      </div>

      <main className="w-full max-w-sm">
        <div className="superficie-azul rounded-2xl p-6">
          <h1 className="mb-6 text-center text-sm font-semibold text-[var(--cac-azul)]">
            Establecer nueva contraseña
          </h1>
          <form onSubmit={guardar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nueva">Nueva contraseña</Label>
              <Input
                id="nueva"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={password} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar">Confirmar contraseña</Label>
              <Input
                id="confirmar"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
              <CampoConfirmarPassword password={password} confirmar={confirmar} />
            </div>
            <Button type="submit" cargando={guardando} className="w-full">
              Guardar contraseña
            </Button>
          </form>
        </div>
      </main>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}
