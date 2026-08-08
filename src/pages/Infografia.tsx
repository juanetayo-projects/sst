import { PageHeader } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'

export default function Infografia() {
  return (
    <div>
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
    </div>
  )
}
