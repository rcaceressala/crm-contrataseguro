import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; color: string }> = {
  DISPONIBLE: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
  RESERVADA:  { label: 'Reservada',  color: 'bg-yellow-100 text-yellow-800' },
  VENDIDA:    { label: 'Vendida',    color: 'bg-gray-100 text-gray-600' },
}

export default async function ParcelasAdminPage() {
  const session = await auth()
  const canCreate = session?.user.role === 'ADMIN' || session?.user.role === 'SUPERVISOR'

  const properties = await prisma.property.findMany({
    orderBy: [{ status: 'asc' }, { title: 'asc' }],
    include: { _count: { select: { leads: true, sales: true } } },
  })

  const fmt = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  const disponibles = properties.filter((p) => p.status === 'DISPONIBLE').length
  const reservadas  = properties.filter((p) => p.status === 'RESERVADA').length
  const vendidas    = properties.filter((p) => p.status === 'VENDIDA').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Parcelas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{properties.length} en total</p>
        </div>
        {canCreate && (
          <Link
            href="/admin/parcelas/nueva"
            className="text-sm bg-[#1a3a2a] hover:bg-[#2d5a3f] text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar parcela
          </Link>
        )}
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Disponibles', value: disponibles, color: 'text-green-600' },
          { label: 'Reservadas',  value: reservadas,  color: 'text-yellow-600' },
          { label: 'Vendidas',    value: vendidas,    color: 'text-gray-600' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{s.label}</div>
            <div className={`text-3xl font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {properties.map((p) => {
          const st  = statusConfig[p.status]
          const img = p.images?.[0] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'
          return (
            <Link
              key={p.id} href={`/admin/parcelas/${p.id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow block"
            >
              <div className="relative h-44">
                <Image src={img} alt={p.title} fill className="object-cover" sizes="400px" />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <span className="text-sm font-bold text-[#1a3a2a]">{fmt(p.price)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">📍 {p.location}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Intl.NumberFormat('es-CL').format(p.area)} m²</span>
                  <div className="flex gap-3">
                    <span>👥 {p._count.leads} leads</span>
                    {p._count.sales > 0 && <span>✅ vendida</span>}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
