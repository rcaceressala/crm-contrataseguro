import Link from 'next/link'
import Image from 'next/image'
import type { Property, PropertyStatus } from '@prisma/client'

interface PropertyCardProps {
  property: Pick<Property, 'id' | 'title' | 'slug' | 'price' | 'area' | 'location' | 'status' | 'images'>
}

const statusConfig: Record<PropertyStatus, { label: string; color: string }> = {
  DISPONIBLE: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
  RESERVADA:  { label: 'Reservada',  color: 'bg-yellow-100 text-yellow-800' },
  VENDIDA:    { label: 'Vendida',    color: 'bg-gray-100 text-gray-600' },
}

export function PropertyCard({ property }: PropertyCardProps) {
  const status = statusConfig[property.status]
  const price  = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(property.price)
  const area   = new Intl.NumberFormat('es-CL').format(property.area)
  const img    = property.images?.[0] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'

  return (
    <Link
      href={`/parcelas/${property.slug}`}
      className={`group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#1a3a2a]/40 hover:shadow-md transition-all ${property.status === 'VENDIDA' ? 'opacity-70' : ''}`}
    >
      {/* Imagen */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={img} alt={property.title}
          fill className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-[#1a3a2a] transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {property.location}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-[#1a3a2a]">{price}</div>
            <div className="text-sm text-gray-500">{area} m²</div>
          </div>
          {property.status === 'DISPONIBLE' && (
            <span className="text-sm text-[#b8860b] font-medium group-hover:underline">
              Ver detalles →
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
