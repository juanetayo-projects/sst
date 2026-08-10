import { PageHeader } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'

export default function Infografia() {
  return (
    <div className="space-y-4">
      <PageHeader titulo="Infografía" />
      <Card>
        <CardContent className="flex justify-center p-4 sm:p-6">
          <img
            src={`${import.meta.env.BASE_URL}images/clasificacion_rondas.webp`}
            alt="Clasificación de Rondas de Inspección SST"
            className="animate-infografia w-full rounded-xl shadow-relieve"
          />
        </CardContent>
      </Card>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-[var(--cac-azul)]">Modelo de Gestión SST</h2>
        <Card>
          <CardContent className="flex justify-center p-4 sm:p-6">
            <img
              src={`${import.meta.env.BASE_URL}images/modelo_gestion_v1.png`}
              alt="Modelo de Gestión SST"
              className="animate-infografia w-full rounded-xl shadow-relieve"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
