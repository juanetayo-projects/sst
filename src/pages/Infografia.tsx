import { useState } from 'react'
import { PageHeader } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const GRAFICOS = [
  { id: 'modelo_gestion', titulo: 'Modelo de Gestión SST', archivo: 'images/modelo_gestion_v1.png' },
  { id: 'clasificacion_rondas', titulo: 'Clasificación de Rondas de Inspección SST', archivo: 'images/clasificacion_rondas.webp' },
]

export default function Infografia() {
  const [seleccionado, setSeleccionado] = useState(GRAFICOS[0].id)
  const grafico = GRAFICOS.find((g) => g.id === seleccionado) ?? GRAFICOS[0]

  return (
    <div>
      <PageHeader titulo="Infografía" />
      <div className="mb-4 max-w-xs space-y-1.5">
        <Label className="text-xs">Gráfico</Label>
        <Select value={seleccionado} onValueChange={setSeleccionado}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {GRAFICOS.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card key={grafico.id}>
        <CardContent className="flex justify-center p-4 sm:p-6">
          <img
            src={`${import.meta.env.BASE_URL}${grafico.archivo}`}
            alt={grafico.titulo}
            className="animate-infografia w-full rounded-xl shadow-relieve"
          />
        </CardContent>
      </Card>
    </div>
  )
}
