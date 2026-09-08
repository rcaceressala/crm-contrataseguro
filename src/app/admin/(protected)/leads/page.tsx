import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { LeadFiltersBar } from '@/components/admin/LeadFiltersBar'

const statusBadge: Record<string, string> = {
  NUEVO:'bg-blue-100 text-blue-800', CONTACTADO:'bg-yellow-100 text-yellow-800',
  INTERESADO:'bg-green-100 text-green-800', VISITA_AGENDADA:'bg-purple-100 text-purple-800',
  RESERVA:'bg-teal-100 text-teal-800', VENDIDO:'bg-emerald-100 text-emerald-800', PERDIDO:'bg-red-100 text-red-800',
}
const statusLabels: Record<string, string> = {
  NUEVO:'Nuevo', CONTACTADO:'Contactado', INTERESADO:'Interesado',
  VISITA_AGENDADA:'Visita agendada', RESERVA:'Reserva', VENDIDO:'Vendido', PERDIDO:'Perdido',
}
const sourceLabels: Record<string, string> = {
  FACEBOOK_ADS:'Facebook', INSTAGRAM:'Instagram', GOOGLE_ADS:'Google',
  TIKTOK:'TikTok', WHATSAPP:'WhatsApp', ORGANICO:'Orgánico', REFERIDO:'Referido', MANUAL:'Manual',
}
const sourceDots: Record<string, string> = {
  FACEBOOK_ADS:'#4267B2', INSTAGRAM:'#E1306C', GOOGLE_ADS:'#4285F4',
  TIKTOK:'#010101', WHATSAPP:'#25D366', ORGANICO:'#888780', REFERIDO:'#b8860b', MANUAL:'#9ca3af',
}

interface PageProps {
  searchParams: { status?: string; source?: string; search?: string; page?: string; assignedUserId?: string }
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const session = await auth()
  const page    = Math.max(1, parseInt(searchParams.page ?? '1'))
  const limit   = 20
  const skip    = (page - 1) * limit

  const where: any = {}
  if (session?.user.role === 'VENDEDOR') where.assignedUserId = session.user.id
  if (searchParams.status)         where.status         = searchParams.status
  if (searchParams.source)         where.source         = searchParams.source
  if (searchParams.assignedUserId) where.assignedUserId = searchParams.assignedUserId
  if (searchParams.search) {
    const s = searchParams.search
    where.OR = [
      { name:  { contains: s, mode: 'insensitive' } },
      { phone: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
    ]
  }

  const [leads, total, users] = await Promise.all([
    prisma.lead.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, name: true } },
        campaign:   { select: { utmCampaign: true } },
        property:   { select: { title: true } },
        _count:     { select: { notes: true, followUps: true } },
      },
    }),
    prisma.lead.count({ where }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} en total</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/leads"
            className="text-sm border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </a>
        </div>
      </div>

      {/* Filtros */}
      <LeadFiltersBar users={users} />

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Fuente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Campaña</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Notas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="group">
                      <div className="font-medium text-gray-900 group-hover:text-[#1a3a2a] transition-colors">{lead.name}</div>
                      <div className="text-xs text-gray-400">{lead.phone}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sourceDots[lead.source] ?? '#9ca3af' }} />
                      <span className="text-gray-600">{sourceLabels[lead.source] ?? lead.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{lead.campaign?.utmCampaign ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#1a3a2a]/10 rounded-full flex items-center justify-center text-xs font-medium text-[#1a3a2a]">
                          {lead.assignedTo.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-gray-600 text-xs">{lead.assignedTo.name.split(' ')[0]}</span>
                      </div>
                    ) : <span className="text-gray-300 text-xs">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {lead._count.notes > 0 && <span>💬 {lead._count.notes}</span>}
                      {lead._count.followUps > 0 && <span>📅 {lead._count.followUps}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400">No se encontraron leads con los filtros aplicados.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Página {page} de {totalPages} · {total} leads</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/leads?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/leads?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
