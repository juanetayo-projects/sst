import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type SolicitudLocal = {
  id: string
  fecha: string
  tipo_elemento: string
  cantidad: number
  observacion: string
}

export function nuevaSolicitudLocal(): SolicitudLocal {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    tipo_elemento: '',
    cantidad: 1,
    observacion: '',
  }
}

/**
 * Tabla editable de elementos a solicitar a compras — se diligencia dentro de cada ronda y se
 * consolida en `/solicitudes-compra` para generar el Excel que se envía al área de Compras.
 */
export function TablaSolicitudCompra({ filas, onChange }: { filas: SolicitudLocal[]; onChange: (filas: SolicitudLocal[]) => void }) {
  function actualizar(id: string, cambios: Partial<SolicitudLocal>) {
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
                <th className="px-2 py-1.5 font-medium">Fecha</th>
                <th className="px-2 py-1.5 font-medium">Tipo de elemento</th>
                <th className="w-20 px-2 py-1.5 font-medium">Cantidad</th>
                <th className="px-2 py-1.5 font-medium">Observación</th>
                <th className="w-8 px-1 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className="border-t border-border/60">
                  <td className="px-2 py-1.5">
                    <Input type="date" value={f.fecha} onChange={(e) => actualizar(f.id, { fecha: e.target.value })} className="h-8 text-xs" />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={f.tipo_elemento}
                      onChange={(e) => actualizar(f.id, { tipo_elemento: e.target.value })}
                      placeholder="Ej. Guantes de nitrilo"
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      min={1}
                      value={f.cantidad}
                      onChange={(e) => actualizar(f.id, { cantidad: Number(e.target.value) || 1 })}
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input value={f.observacion} onChange={(e) => actualizar(f.id, { observacion: e.target.value })} className="h-8 text-xs" />
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
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...filas, nuevaSolicitudLocal()])}>
        <Plus className="size-3.5" />
        Agregar ítem
      </Button>
    </div>
  )
}
