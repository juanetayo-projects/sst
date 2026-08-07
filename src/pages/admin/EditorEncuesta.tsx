import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  cargarEstructuraAdmin,
  type TipoInspeccion,
  type CategoriaPregunta,
  type Pregunta,
  type TipoRespuesta,
  type EstructuraInspeccion,
} from '@/domain/inspecciones'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MensajeDialog, type Mensaje } from '@/components/ui/mensaje-dialog'
import { PreguntaModal } from '@/components/admin/PreguntaModal'
import { CategoriaModal } from '@/components/admin/CategoriaModal'

type Estructura = Omit<EstructuraInspeccion, 'tipo'>

const ETIQUETAS_CAMPO: Record<string, string> = {
  opcion: 'Checklist',
  texto: 'Texto',
  select: 'Lista',
  fecha: 'Fecha',
  booleano: 'Sí/No',
}

function siguienteOrden(lista: { orden: number }[], base = 0) {
  return lista.reduce((m, x) => Math.max(m, x.orden), base) + 1
}

type ContextoPregunta = 'encabezado' | 'categoria' | 'cierre'
type ModalPregunta = {
  open: boolean
  pregunta: Pregunta | null
  categoriaId: string | null
  esCategoria: boolean
  contexto: ContextoPregunta
}
type ModalCategoria = { open: boolean; categoria: CategoriaPregunta | null }

export default function EditorEncuesta() {
  const { codigo } = useParams<{ codigo: string }>()
  const navigate = useNavigate()

  const [tipo, setTipo] = useState<TipoInspeccion | null>(null)
  const [estructura, setEstructura] = useState<Estructura | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<Mensaje>(null)

  const [modalPregunta, setModalPregunta] = useState<ModalPregunta>({
    open: false,
    pregunta: null,
    categoriaId: null,
    esCategoria: false,
    contexto: 'encabezado',
  })
  const [modalCategoria, setModalCategoria] = useState<ModalCategoria>({ open: false, categoria: null })
  const [aEliminarPregunta, setAEliminarPregunta] = useState<Pregunta | null>(null)
  const [aEliminarCategoria, setAEliminarCategoria] = useState<CategoriaPregunta | null>(null)
  const [confirmarEliminarTipo, setConfirmarEliminarTipo] = useState(false)
  const [eliminandoTipo, setEliminandoTipo] = useState(false)

  const [editarTipoAbierto, setEditarTipoAbierto] = useState(false)
  const [nombreTipo, setNombreTipo] = useState('')
  const [descripcionTipo, setDescripcionTipo] = useState('')
  const [tipoRespuestaTipo, setTipoRespuestaTipo] = useState<TipoRespuesta>('cumple_no_cumple_na')
  const [activoTipo, setActivoTipo] = useState(true)
  const [guardandoTipo, setGuardandoTipo] = useState(false)

  async function cargar() {
    if (!codigo) return
    setCargando(true)
    const { data: tipoData } = await supabase.from('tipos_inspeccion').select('*').eq('codigo', codigo).single()
    if (!tipoData) {
      setCargando(false)
      return
    }
    setTipo(tipoData as TipoInspeccion)
    const est = await cargarEstructuraAdmin(tipoData.id)
    setEstructura(est)
    setCargando(false)
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo])

  function abrirEditarTipo() {
    if (!tipo) return
    setNombreTipo(tipo.nombre)
    setDescripcionTipo(tipo.descripcion ?? '')
    setTipoRespuestaTipo(tipo.tipo_respuesta)
    setActivoTipo(tipo.activo)
    setEditarTipoAbierto(true)
  }

  async function guardarTipo(e: FormEvent) {
    e.preventDefault()
    if (!tipo) return
    setGuardandoTipo(true)
    const { error } = await supabase
      .from('tipos_inspeccion')
      .update({
        nombre: nombreTipo,
        descripcion: descripcionTipo || null,
        tipo_respuesta: tipoRespuestaTipo,
        activo: activoTipo,
      })
      .eq('id', tipo.id)
    setGuardandoTipo(false)
    if (error) {
      setMensaje({ tipo: 'error', titulo: 'No se pudo guardar', texto: error.message })
      return
    }
    setEditarTipoAbierto(false)
    cargar()
  }

  async function eliminarTipo() {
    if (!tipo) return
    setEliminandoTipo(true)
    const { error } = await supabase.from('tipos_inspeccion').delete().eq('id', tipo.id)
    setEliminandoTipo(false)
    setConfirmarEliminarTipo(false)
    if (error) {
      const esFK = error.message?.toLowerCase().includes('foreign key')
      setMensaje({
        tipo: 'error',
        titulo: 'No se pudo eliminar',
        texto: esFK
          ? 'Esta encuesta tiene inspecciones registradas y no puede eliminarse. Desactívala en su lugar.'
          : error.message,
      })
      return
    }
    navigate('/admin/encuestas')
  }

  async function alternarActivaPregunta(p: Pregunta) {
    await supabase.from('preguntas').update({ activa: !p.activa }).eq('id', p.id)
    cargar()
  }

  async function eliminarPregunta() {
    if (!aEliminarPregunta) return
    await supabase.from('preguntas').delete().eq('id', aEliminarPregunta.id)
    setAEliminarPregunta(null)
    cargar()
  }

  async function eliminarCategoria() {
    if (!aEliminarCategoria) return
    await supabase.from('preguntas').delete().eq('categoria_id', aEliminarCategoria.id)
    await supabase.from('categorias_pregunta').delete().eq('id', aEliminarCategoria.id)
    setAEliminarCategoria(null)
    cargar()
  }

  async function moverPregunta(lista: Pregunta[], index: number, direccion: 1 | -1) {
    const otro = lista[index + direccion]
    const actual = lista[index]
    if (!otro) return
    await Promise.all([
      supabase.from('preguntas').update({ orden: otro.orden }).eq('id', actual.id),
      supabase.from('preguntas').update({ orden: actual.orden }).eq('id', otro.id),
    ])
    cargar()
  }

  async function moverCategoria(index: number, direccion: 1 | -1) {
    if (!estructura) return
    const otro = estructura.categorias[index + direccion]
    const actual = estructura.categorias[index]
    if (!otro) return
    await Promise.all([
      supabase.from('categorias_pregunta').update({ orden: otro.orden }).eq('id', actual.id),
      supabase.from('categorias_pregunta').update({ orden: actual.orden }).eq('id', otro.id),
    ])
    cargar()
  }

  if (cargando) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>
  if (!tipo || !estructura) {
    return <div className="p-8 text-center text-sm text-[var(--error)]">No se encontró la encuesta.</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link to="/admin/encuestas" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-base font-semibold text-[var(--cac-azul)]">{tipo.nombre}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={abrirEditarTipo}>
            <Pencil />
            Editar encuesta
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmarEliminarTipo(true)}>
            <Trash2 />
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
          <Badge tono={tipo.activo ? 'exito' : 'neutro'}>{tipo.activo ? 'Activa' : 'Inactiva'}</Badge>
          <Badge tono="info">{tipo.tipo_respuesta === 'si_no_na' ? 'Sí / No / N.A.' : 'Cumple / No Cumple / N.A.'}</Badge>
          {tipo.descripcion && <span className="text-muted-foreground">{tipo.descripcion}</span>}
        </CardContent>
      </Card>

      {/* Encabezado */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--cac-azul)]">Preguntas de encabezado</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setModalPregunta({ open: true, pregunta: null, categoriaId: null, esCategoria: false, contexto: 'encabezado' })
              }
            >
              <Plus />
              Agregar
            </Button>
          </div>
          {estructura.encabezado.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Sin preguntas de encabezado.</p>
          ) : (
            estructura.encabezado.map((p, i) => (
              <FilaPregunta
                key={p.id}
                pregunta={p}
                esPrimera={i === 0}
                esUltima={i === estructura.encabezado.length - 1}
                onMover={(dir) => moverPregunta(estructura.encabezado, i, dir)}
                onEditar={() =>
                  setModalPregunta({ open: true, pregunta: p, categoriaId: null, esCategoria: false, contexto: 'encabezado' })
                }
                onEliminar={() => setAEliminarPregunta(p)}
                onActivar={() => alternarActivaPregunta(p)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Categorías */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--cac-azul)]">Categorías</h3>
        <Button size="sm" variant="outline" onClick={() => setModalCategoria({ open: true, categoria: null })}>
          <Plus />
          Agregar categoría
        </Button>
      </div>

      {estructura.categorias.map((cat, i) => {
        const preguntasCat = estructura.porCategoria.get(cat.id) ?? []
        return (
          <div key={cat.id} className={`bloque-datos bloque-${cat.color} p-4`}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="bloque-titulo">{cat.nombre}</div>
                {cat.condicion_campo && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Visible si «{cat.condicion_campo}» = «{cat.condicion_valor}»
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => moverCategoria(i, -1)}>
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={i === estructura.categorias.length - 1}
                  onClick={() => moverCategoria(i, 1)}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setModalCategoria({ open: true, categoria: cat })}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setAEliminarCategoria(cat)}>
                  <Trash2 className="size-3.5 text-[var(--error)]" />
                </Button>
              </div>
            </div>

            {preguntasCat.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">Sin preguntas todavía.</p>
            ) : (
              preguntasCat.map((p, i) => (
                <FilaPregunta
                  key={p.id}
                  pregunta={p}
                  esPrimera={i === 0}
                  esUltima={i === preguntasCat.length - 1}
                  onMover={(dir) => moverPregunta(preguntasCat, i, dir)}
                  onEditar={() =>
                    setModalPregunta({ open: true, pregunta: p, categoriaId: cat.id, esCategoria: true, contexto: 'categoria' })
                  }
                  onEliminar={() => setAEliminarPregunta(p)}
                  onActivar={() => alternarActivaPregunta(p)}
                />
              ))
            )}
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() =>
                setModalPregunta({ open: true, pregunta: null, categoriaId: cat.id, esCategoria: true, contexto: 'categoria' })
              }
            >
              <Plus />
              Agregar pregunta
            </Button>
          </div>
        )
      })}

      {/* Cierre */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--cac-azul)]">Cierre de la inspección</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setModalPregunta({ open: true, pregunta: null, categoriaId: null, esCategoria: false, contexto: 'cierre' })
              }
            >
              <Plus />
              Agregar
            </Button>
          </div>
          {estructura.cierre.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Sin preguntas de cierre.</p>
          ) : (
            estructura.cierre.map((p, i) => (
              <FilaPregunta
                key={p.id}
                pregunta={p}
                esPrimera={i === 0}
                esUltima={i === estructura.cierre.length - 1}
                onMover={(dir) => moverPregunta(estructura.cierre, i, dir)}
                onEditar={() =>
                  setModalPregunta({ open: true, pregunta: p, categoriaId: null, esCategoria: false, contexto: 'cierre' })
                }
                onEliminar={() => setAEliminarPregunta(p)}
                onActivar={() => alternarActivaPregunta(p)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <PreguntaModal
        open={modalPregunta.open}
        onClose={() => setModalPregunta((m) => ({ ...m, open: false }))}
        pregunta={modalPregunta.pregunta}
        tipoInspeccionId={tipo.id}
        categoriaId={modalPregunta.categoriaId}
        esCategoria={modalPregunta.esCategoria}
        siguienteOrden={
          modalPregunta.contexto === 'categoria' && modalPregunta.categoriaId
            ? siguienteOrden(estructura.porCategoria.get(modalPregunta.categoriaId) ?? [])
            : modalPregunta.contexto === 'cierre'
              ? siguienteOrden(estructura.cierre, 899)
              : siguienteOrden(estructura.encabezado, 0)
        }
        onGuardado={cargar}
      />

      <CategoriaModal
        open={modalCategoria.open}
        onClose={() => setModalCategoria({ open: false, categoria: null })}
        categoria={modalCategoria.categoria}
        tipoInspeccionId={tipo.id}
        encabezado={estructura.encabezado}
        siguienteOrden={siguienteOrden(estructura.categorias)}
        onGuardado={cargar}
      />

      <ConfirmDialog
        open={aEliminarPregunta !== null}
        titulo="Eliminar pregunta"
        descripcion={`"${aEliminarPregunta?.texto}" se eliminará permanentemente. Las respuestas ya registradas no se verán afectadas.`}
        onConfirm={eliminarPregunta}
        onCancel={() => setAEliminarPregunta(null)}
      />

      <ConfirmDialog
        open={aEliminarCategoria !== null}
        titulo={`Eliminar categoría "${aEliminarCategoria?.nombre}"`}
        descripcion="Se eliminará junto con todas sus preguntas. Las respuestas ya registradas no se verán afectadas."
        onConfirm={eliminarCategoria}
        onCancel={() => setAEliminarCategoria(null)}
      />

      <ConfirmDialog
        open={confirmarEliminarTipo}
        titulo={`Eliminar la encuesta "${tipo.nombre}"`}
        descripcion="Se eliminará junto con todas sus categorías y preguntas. Solo es posible si no tiene inspecciones registradas."
        cargando={eliminandoTipo}
        onConfirm={eliminarTipo}
        onCancel={() => setConfirmarEliminarTipo(false)}
      />

      <Dialog open={editarTipoAbierto} onOpenChange={setEditarTipoAbierto}>
        <DialogContent className="max-w-md">
          <form onSubmit={guardarTipo}>
            <DialogHeader>
              <DialogTitle>Editar encuesta</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-tipo-editar">Nombre</Label>
                <Input id="nombre-tipo-editar" required value={nombreTipo} onChange={(e) => setNombreTipo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descripcion-tipo-editar">Descripción</Label>
                <Textarea
                  id="descripcion-tipo-editar"
                  rows={3}
                  value={descripcionTipo}
                  onChange={(e) => setDescripcionTipo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de respuesta</Label>
                <Select value={tipoRespuestaTipo} onValueChange={(v) => setTipoRespuestaTipo(v as TipoRespuesta)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cumple_no_cumple_na">Cumple / No Cumple / No Aplica</SelectItem>
                    <SelectItem value="si_no_na">Sí / No / No Aplica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={activoTipo} onCheckedChange={(v) => setActivoTipo(v === true)} />
                Activa (visible en "Nueva inspección")
              </label>
            </div>
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => setEditarTipoAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardandoTipo}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MensajeDialog mensaje={mensaje} onClose={() => setMensaje(null)} />
    </div>
  )
}

function FilaPregunta({
  pregunta,
  esPrimera,
  esUltima,
  onMover,
  onEditar,
  onEliminar,
  onActivar,
}: {
  pregunta: Pregunta
  esPrimera: boolean
  esUltima: boolean
  onMover: (direccion: 1 | -1) => void
  onEditar: () => void
  onEliminar: () => void
  onActivar: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 py-2 last:border-0">
      <div className="flex flex-col">
        <button
          type="button"
          disabled={esPrimera}
          onClick={() => onMover(-1)}
          className="text-muted-foreground disabled:opacity-25"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={esUltima}
          onClick={() => onMover(1)}
          className="text-muted-foreground disabled:opacity-25"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-sm', !pregunta.activa && 'text-muted-foreground line-through')}>
          {pregunta.texto}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Badge tono="neutro">{ETIQUETAS_CAMPO[pregunta.tipo_campo] ?? pregunta.tipo_campo}</Badge>
          {pregunta.obligatoria && <Badge tono="info">Obligatoria</Badge>}
        </div>
      </div>
      <button type="button" onClick={onActivar} className="shrink-0">
        <Badge tono={pregunta.activa ? 'exito' : 'neutro'}>{pregunta.activa ? 'Activa' : 'Inactiva'}</Badge>
      </button>
      <Button variant="ghost" size="icon" onClick={onEditar}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onEliminar}>
        <Trash2 className="size-3.5 text-[var(--error)]" />
      </Button>
    </div>
  )
}
