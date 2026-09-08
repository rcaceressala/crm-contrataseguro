import { prisma } from '@/lib/prisma'
import { PropertyCard } from '@/components/site/PropertyCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parcelas disponibles',
  description: 'Explora los lotes disponibles en Reserva Mirador Santa Cruz. Parcelas desde 5.000 m² en Isla Yáquil.',
}

export const revalidate = 60

export default async function ParcelasPage() {
  const properties = await prisma.property.findMany({
    orderBy: [
      { status: 'asc' },
      { title:  'asc' },
    ],
  })

  const disponibles = properties.filter((p) => p.status === 'DISPONIBLE').length
  const reservadas  = properties.filter((p) => p.status === 'RESERVADA').length
  const vendidas    = properties.filter((p) => p.status === 'VENDIDA').length

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-[#1a3a2a] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Parcelas del proyecto</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {disponibles} parcelas disponibles · Desde 5.000 m² · Vista panorámica al valle
          </p>
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              {disponibles} disponibles
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              {reservadas} reservadas
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              {vendidas} vendidas
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {properties.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No hay parcelas disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
