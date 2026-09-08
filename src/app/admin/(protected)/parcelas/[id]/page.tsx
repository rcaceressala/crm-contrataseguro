import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { DeletePropertyButton } from '@/components/admin/DeletePropertyButton'

export default async function ParcelaDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const role = session?.user.role

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { _count: { select: { leads: true, sales: true } } },
  })

  if (!property) notFound()

  const canEdit   = role === 'ADMIN' || role === 'SUPERVISOR'
  const canDelete = role === 'ADMIN'

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <a href="/admin/parcelas" className="text-sm text-gray-400 hover:text-gray-600">← Parcelas</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">{property.title}</h1>
        <p className="text-sm text-gray-500">
          {property._count.leads} leads · {property._count.sales > 0 ? 'vendida' : 'sin venta registrada'}
        </p>
      </div>

      {canEdit ? (
        <PropertyForm property={property} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-600">
          <p>No tienes permisos para editar parcelas.</p>
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between"><dt className="text-gray-400">Ubicación</dt><dd>{property.location}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Precio</dt><dd>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(property.price)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Área</dt><dd>{property.area} m²</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Estado</dt><dd>{property.status}</dd></div>
          </dl>
        </div>
      )}

      {canDelete && (
        <DeletePropertyButton propertyId={property.id} propertyTitle={property.title} />
      )}
    </div>
  )
}
