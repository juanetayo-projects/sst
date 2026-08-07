import { useEffect, useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TipoInspeccion } from '@/domain/inspecciones'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

export function TiposInspeccionAdmin() {
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState<TipoInspeccion | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  function cargar() {
    setCargando(true)
    supabase
      .from('tipos_inspeccion')
      .select('*')
      .order('orden')
      .then(({ data }) => {
        setTipos((data ?? []) as TipoInspeccion[])
        setCargando(false)
      })
  }

  useEffect(cargar, [])

  function abrirEditar(t: TipoInspeccion) {
    setEditando(t)
    setNombre(t.nombre)
    setDescripcion(t.descripcion ?? '')
  }

  async function alternarActivo(t: TipoInspeccion) {
    await supabase.from('tipos_inspeccion').update({ activo: !t.activo }).eq('id', t.id)
    cargar()
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!editando) return
    setGuardando(true)
    const { error } = await supabase
      .from('tipos_inspeccion')
      .update({ nombre, descripcion: descripcion || null })
      .eq('id', editando.id)
    setGuardando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setEditando(null)
    cargar()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-1 text-sm font-semibold text-[var(--cac-azul)]">Tipos de inspección</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Los 10 tipos están fijos (cada uno tiene su propio catálogo de preguntas). Puedes editar su nombre,
          descripción o desactivarlos para ocultarlos de "Nueva inspección".
        </p>

        {cargando ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Cargando…</div>
        ) : (
          <div className="divide-y divide-border/60">
            {tipos.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm">{t.nombre}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => alternarActivo(t)} className="cursor-pointer">
                    <Badge tono={t.activo ? 'exito' : 'neutro'}>{t.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(t)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={editando !== null} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent className="max-w-md">
          <form onSubmit={guardar}>
            <DialogHeader>
              <DialogTitle>Editar tipo de inspección</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-tipo">Nombre</Label>
                <Input id="nombre-tipo" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descripcion-tipo">Descripción</Label>
                <Textarea id="descripcion-tipo" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </Card>
  )
}
