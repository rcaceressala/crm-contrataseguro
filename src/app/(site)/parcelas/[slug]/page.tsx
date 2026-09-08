import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ContactForm } from '@/components/site/ContactForm'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await prisma.property.findUnique({ where: { slug: params.slug } })
  if (!property) return { title: 'Parcela no encontrada' }
  const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(property.price)
  return {
    title: property.title,
    description: `${property.title} — ${property.area} m² — ${price}. ${property.description ?? ''}`,
  }
}

export const revalidate = 60

export default async function PropertyDetailPage({ params }: Props) {
  const property = await prisma.property.findUnique({ where: { slug: params.slug } })
  if (!property) notFound()

  const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(property.price)
  const area  = new Intl.NumberFormat('es-CL').format(property.area)

  const statusConfig = {
    DISPONIBLE: { label: 'Disponible',   color: 'bg-green-100 text-green-800' },
    RESERVADA:  { label: 'Reservada',    color: 'bg-yellow-100 text-yellow-800' },
    VENDIDA:    { label: 'Vendida',      color: 'bg-gray-100 text-gray-600' },
  }
  const status = statusConfig[property.status]

  const waMessage = `Hola, me interesa la ${property.title} (${area} m² — ${price}). ¿Podrían darme más información?`

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-[#1a3a2a]">Inicio</a>
          <span>/</span>
          <a href="/parcelas" className="hover:text-[#1a3a2a]">Parcelas</a>
          <span>/</span>
          <span className="text-[#1a3a2a] font-medium">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda — galería + info */}
          <div className="lg:col-span-2">
            {/* Galería */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  <div className="relative h-80">
                    <Image
                      src={property.images[0]} alt={`${property.title} principal`}
                      fill className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                    />
                  </div>
                  {property.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 p-2">
                      {property.images.slice(1, 4).map((img, i) => (
                        <div key={i} className="relative h-28 rounded-lg overflow-hidden">
                          <Image src={img} alt={`${property.title} ${i + 2}`} fill className="object-cover" sizes="200px" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-gray-100 flex items-center justify-center text-gray-400">Sin imágenes</div>
              )}
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${status.color}`}>
                    {status.label}
                  </span>
                  <h1 className="text-3xl font-bold text-[#1a3a2a]">{property.title}</h1>
                  <p className="text-gray-500 mt-2 flex items-center gap-1">
                    📍 {property.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#1a3a2a]">{price}</div>
                  <div className="text-gray-500 text-sm">{area} m²</div>
                </div>
              </div>

              {property.description && (
                <p className="text-gray-600 leading-relaxed mb-6">{property.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 p-6 bg-[#f5f5f0] rounded-xl">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Superficie</div>
                  <div className="font-semibold text-[#1a3a2a]">{area} m²</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Precio</div>
                  <div className="font-semibold text-[#1a3a2a]">{price}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Ubicación</div>
                  <div className="font-semibold text-[#1a3a2a]">{property.location}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Estado</div>
                  <div className="font-semibold text-[#1a3a2a]">{status.label}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha — formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              {property.status === 'DISPONIBLE' ? (
                <>
                  <h2 className="font-semibold text-[#1a3a2a] text-xl mb-2">Consultar por esta parcela</h2>
                  <p className="text-sm text-gray-500 mb-6">Completa el formulario y te contactamos en menos de 24 horas.</p>
                  <ContactForm
                    preselectedProperty={property.id}
                    properties={[{ id: property.id, title: property.title, slug: property.slug }]}
                  />
                  <div className="mt-4">
                    <WhatsAppButton variant="inline" message={waMessage} label="Consultar por WhatsApp" />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏷️</div>
                  <h3 className="font-semibold text-gray-700 mb-2">Parcela {status.label}</h3>
                  <p className="text-sm text-gray-500 mb-6">Esta parcela no está disponible, pero tenemos otras opciones similares.</p>
                  <a href="/parcelas" className="block text-center bg-[#1a3a2a] text-white font-semibold py-3 rounded-lg hover:bg-[#2d5a3f] transition-colors">
                    Ver parcelas disponibles
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
