import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type CompromisoLocal = {
  id: string
  descripcion: string
  responsable: string
  fecha_compromiso: string
}

export function nuevoCompromisoLocal(): CompromisoLocal {
  const enUnaSemana = new Date()
  enUnaSemana.setDate(enUnaSemana.getDate() + 7)
  return {
    id: crypto.randomUUID(),
    descripcion: '',
    responsable: '',
    fecha_compromiso: enUnaSemana.toISOString().slice(0, 10),
  }
}

/**
 * Acta de compromisos de la ronda: qué se acordó corregir, quién responde y para cuándo.
 * Se consolida en `/compromisos`, donde se calcula automáticamente si quedó vencido.
 */
export function TablaCompromisos({ filas, onChange }: { filas: CompromisoLocal[]; onChange: (filas: CompromisoLocal[]) => void }) {
  function actualizar(id: string, cambios: Partial<CompromisoLocal>) {
    onChange(filas.map((f) => (f.id === id ? { ...f, ...cambios } : f)))
  }
  function quitar(id: string) {
    onChange(filas.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-2">
      {filas.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left text-xs text-muted-foreground">
                <th className="px-2 py-1.5 font-medium">Descripción del compromiso</th>
                <th className="px-2 py-1.5 font-medium">Responsable</th>
                <th className="w-36 px-2 py-1.5 font-medium">Fecha compromiso</th>
                <th className="w-8 px-1 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className="border-t border-border/60">
                  <td className="px-2 py-1.5">
                    <Input
                      value={f.descripcion}
                      onChange={(e) => actualizar(f.id, { descripcion: e.target.value })}
                      placeholder="Ej. Reponer señalización del pasillo B"
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={f.responsable} onChange={(e) => actualizar(f.id, { responsable: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="date"
                      value={f.fecha_compromiso}
                      onChange={(e) => actualizar(f.id, { fecha_compromiso: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <Button type="button" variant="ghost" size="icon" onClick={() => quitar(f.id)}>
                      <Trash2 className="size-3.5 text-[var(--error)]" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...filas, nuevoCompromisoLocal()])}>
        <Plus className="size-3.5" />
        Agregar compromiso
      </Button>
    </div>
  )
}
