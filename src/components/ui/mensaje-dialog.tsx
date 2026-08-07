import { CheckCircle2, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'

export type Mensaje = { tipo: 'exito' | 'error'; titulo: string; texto: string } | null

/** Modal de éxito/error reutilizable — ningún mensaje del sistema va en texto plano. */
export function MensajeDialog({ mensaje, onClose }: { mensaje: Mensaje; onClose: () => void }) {
  return (
    <Dialog open={mensaje !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mensaje?.tipo === 'exito' ? (
              <CheckCircle2 className="size-5 text-[var(--exito)]" />
            ) : (
              <XCircle className="size-5 text-[var(--error)]" />
            )}
            {mensaje?.titulo}
          </DialogTitle>
          <DialogDescription>{mensaje?.texto}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
