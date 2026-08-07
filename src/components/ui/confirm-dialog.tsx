import { TriangleAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'
import { Button } from './button'

export function ConfirmDialog({
  open,
  titulo,
  descripcion,
  cargando,
  onConfirm,
  onCancel,
  textoConfirmar = 'Eliminar',
}: {
  open: boolean
  titulo: string
  descripcion: string
  cargando?: boolean
  onConfirm: () => void
  onCancel: () => void
  textoConfirmar?: string
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-[var(--error)]" />
            {titulo}
          </DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" cargando={cargando} onClick={onConfirm}>
            {textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
