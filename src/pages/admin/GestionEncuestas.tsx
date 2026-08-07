import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TipoInspeccion, TipoRespuesta } from '@/domain/inspecciones'
import { PageHeader } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'

const DIACRITICOS = new RegExp('[̀-ͯ]', 'g')

function generarCodigo(nombre: string) {
  return nombre
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50)
}

export default function GestionEncuestas() {
  const [tipos, setTipos] = useState<TipoInspeccion[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoRespuesta, setTipoRespuesta] = useState<TipoRespuesta>('cumple_no_cumple_na')
  const [creando, setCreando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje>(null)
  const [codigoNuevo, setCodigoNuevo] = useState<string | null>(null)

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

  async function crear(e: FormEvent) {
    e.preventDefault()
    const codigo = generarCodigo(nombre)
    if (!codigo) return
    if (tipos.some((t) => t.codigo === codigo)) {
      setMensaje({
        tipo: 'error',
        titulo: 'Código duplicado',
        texto: 'Ya existe una encuesta con un código muy similar. Cambia el nombre.',
      })
      return
    }
    setCreando(true)
    const { error } = await supabase.from('tipos_inspeccion').insert({
      codigo,
      nombre,
      descripcion: descripcion || null,
      tipo_respuesta: tipoRespuesta,
      orden: tipos.length + 1,
    })
    setCreando(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo crear', texto: error.message })
      return
    }
    setModalAbierto(false)
    setNombre('')
    setDescripcion('')
    setTipoRespuesta('cumple_no_cumple_na')
    setCodigoNuevo(codigo)
    cargar()
  }

  return (
    <div>
      <PageHeader
        titulo="Encuestas"
        acciones={
          <Button size="sm" onClick={() => setModalAbierto(true)}>
            <Plus />
            Nueva encuesta
          </Button>
        }
      />
      <p className="mb-4 -mt-2 text-sm text-muted-foreground">
        Cada encuesta es un tipo de inspección: su encabezado, sus categorías y sus preguntas. Entra a una para
        editarla.
      </p>

      {cargando ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tipos.map((t) => (
            <Link key={t.id} to={`/admin/encuestas/${t.codigo}`}>
              <Card className="h-full transition-transform hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cac-azul-50)] text-[var(--cac-azul)]">
                    <ClipboardList className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.nombre}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge tono={t.activo ? 'exito' : 'neutro'}>{t.activo ? 'Activa' : 'Inactiva'}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {t.tipo_respuesta === 'si_no_na' ? 'Sí / No / N.A.' : 'Cumple / No Cumple / N.A.'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-md">
          <form onSubmit={crear}>
            <DialogHeader>
              <DialogTitle>Nueva encuesta</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-encuesta">Nombre</Label>
                <Input id="nombre-encuesta" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                {nombre && (
                  <p className="text-[11px] text-muted-foreground">
                    Código interno: <code>{generarCodigo(nombre)}</code>
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descripcion-encuesta">Descripción (opcional)</Label>
                <Textarea
                  id="descripcion-encuesta"
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de respuesta para las preguntas de checklist</Label>
                <Select value={tipoRespuesta} onValueChange={(v) => setTipoRespuesta(v as TipoRespuesta)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cumple_no_cumple_na">Cumple / No Cumple / No Aplica</SelectItem>
                    <SelectItem value="si_no_na">Sí / No / No Aplica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={creando}>
                Crear y continuar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />

      {codigoNuevo && (
        <Dialog open onOpenChange={() => setCodigoNuevo(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Encuesta creada</DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-sm text-muted-foreground">
              Ahora agrégale sus categorías y preguntas.
            </p>
            <DialogFooter className="mt-5">
              <Button asChild>
                <Link to={`/admin/encuestas/${codigoNuevo}`}>Ir al editor</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
