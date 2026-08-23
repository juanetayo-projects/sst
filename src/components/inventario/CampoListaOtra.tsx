import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const OTRA = '__otra__'

/**
 * Select poblado con valores de un catálogo (empresas/sedes) + opción "+ Otra…" que revela un campo
 * de texto libre — para no dejar sin salida el primer registro de una empresa/sede que aún no está
 * en el catálogo general. `esOtra` lo controla el padre para poder resetearlo al abrir el modal.
 */
export function CampoListaOtra({
  id,
  opciones,
  value,
  onChange,
  esOtra,
  onEsOtraChange,
  placeholder,
}: {
  id?: string
  opciones: string[]
  value: string
  onChange: (v: string) => void
  esOtra: boolean
  onEsOtraChange: (v: boolean) => void
  placeholder: string
}) {
  if (esOtra || opciones.length === 0) {
    return <Input id={id} autoFocus={esOtra} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  }
  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => {
        if (v === OTRA) {
          onEsOtraChange(true)
          onChange('')
        } else {
          onChange(v)
        }
      }}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={`Selecciona ${placeholder.toLowerCase()}…`} />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
        <SelectItem value={OTRA}>+ Otra…</SelectItem>
      </SelectContent>
    </Select>
  )
}
