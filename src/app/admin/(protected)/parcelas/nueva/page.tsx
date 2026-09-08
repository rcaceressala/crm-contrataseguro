import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PropertyForm } from '@/components/admin/PropertyForm'

export default async function NuevaParcelaPage() {
  const session = await auth()
  const role = session?.user.role

  if (role !== 'ADMIN' && role !== 'SUPERVISOR') redirect('/admin/parcelas')

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <a href="/admin/parcelas" className="text-sm text-gray-400 hover:text-gray-600">← Parcelas</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Agregar parcela</h1>
      </div>

      <PropertyForm />
    </div>
  )
}
