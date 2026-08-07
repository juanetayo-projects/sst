import { PageHeader } from '@/components/ui'
import { CrudSimple } from '@/components/admin/CrudSimple'

export default function Catalogos() {
  return (
    <div className="space-y-4">
      <PageHeader titulo="Catálogos" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CrudSimple tabla="empresas" titulo="Empresas" />
        <CrudSimple tabla="sedes" titulo="Sedes" />
      </div>
    </div>
  )
}
