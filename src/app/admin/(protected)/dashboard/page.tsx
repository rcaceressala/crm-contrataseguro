import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/admin/StatsCard'
import { SourceChart } from '@/components/admin/SourceChart'
import Link from 'next/link'

const statusBadge: Record<string, string> = {
  NUEVO:          'bg-blue-100 text-blue-800',
  CONTACTADO:     'bg-yellow-100 text-yellow-800',
  INTERESADO:     'bg-green-100 text-green-800',
  VISITA_AGENDADA:'bg-purple-100 text-purple-800',
  RESERVA:        'bg-teal-100 text-teal-800',
  VENDIDO:        'bg-emerald-100 text-emerald-800',
  PERDIDO:        'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  NUEVO: 'Nuevo', CONTACTADO: 'Contactado', INTERESADO: 'Interesado',
  VISITA_AGENDADA: 'Visita agendada', RESERVA: 'Reserva', VENDIDO: 'Vendido', PERDIDO: 'Perdido',
}

const sourceLabels: Record<string, string> = {
  FACEBOOK_ADS:'Facebook', INSTAGRAM:'Instagram', GOOGLE_ADS:'Google',
  TIKTOK:'TikTok', WHATSAPP:'WhatsApp', ORGANICO:'Orgánico', REFERIDO:'Referido', MANUAL:'Manual',
}

const sourceDots: Record<string, string> = {
  FACEBOOK_ADS:'#4267B2', INSTAGRAM:'#E1306C', GOOGLE_ADS:'#4285F4',
  TIKTOK:'#010101', WHATSAPP:'#25D366', ORGANICO:'#888780', REFERIDO:'#b8860b', MANUAL:'#9ca3af',
}

async function getDashboardData() {
  const now        = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalLeads, leadsToday, leadsThisMonth, totalSales, pendingFollowUps, recentLeads, bySource] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.sale.count(),
    prisma.followUp.count({ where: { done: false, followUpDate: { lte: now } } }),
    prisma.lead.findMany({
      take: 8, orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true } },
        campaign:   { select: { utmCampaign: true } },
      },
    }),
    prisma.lead.groupBy({ by: ['source'], _count: { source: true }, orderBy: { _count: { source: 'desc' } } }),
  ])

  const total = bySource.reduce((s, g) => s + g._count.source, 0)
  const sourceData = bySource.map((g) => ({
    source: g.source, count: g._count.source,
    percentage: total > 0 ? parseFloat(((g._count.source / total) * 100).toFixed(1)) : 0,
  }))

  const conversionRate = totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) : '0'

  return { totalLeads, leadsToday, leadsThisMonth, totalSales, pendingFollowUps, recentLeads, sourceData, conversionRate }
}

export default async function DashboardPage() {
  const d = await getDashboardData()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen de actividad comercial</p>
        </div>
        <Link href="/admin/leads" className="text-sm bg-[#1a3a2a] hover:bg-[#2d5a3f] text-white px-4 py-2 rounded-lg transition-colors font-medium">
          + Nuevo lead
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total leads"      value={d.totalLeads}      icon="👥" delta={`${d.leadsThisMonth} este mes`} deltaType="up" />
        <StatsCard label="Leads hoy"        value={d.leadsToday}      icon="📥" />
        <StatsCard label="Ventas cerradas"  value={d.totalSales}       icon="🏆" delta={`${d.conversionRate}% conversión`} deltaType="neutral" />
        <StatsCard label="Seguimientos venc." value={d.pendingFollowUps} icon="⏰" delta={d.pendingFollowUps > 0 ? 'Requieren atención' : 'Al día'} deltaType={d.pendingFollowUps > 0 ? 'down' : 'up'} />
      </div>

      {/* Charts + Leads recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico fuente */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads por fuente</h2>
          {d.sourceData.length > 0 ? (
            <>
              <SourceChart data={d.sourceData} />
              <div className="mt-4 space-y-2">
                {d.sourceData.slice(0, 4).map((s) => (
                  <div key={s.source} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: sourceDots[s.source] ?? '#9ca3af' }} />
                      <span className="text-gray-600">{sourceLabels[s.source] ?? s.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{s.count}</span>
                      <span className="text-gray-400">{s.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Sin datos aún</div>
          )}
        </div>

        {/* Leads recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Leads recientes</h2>
            <Link href="/admin/leads" className="text-xs text-[#1a3a2a] hover:underline font-medium">Ver todos →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {d.recentLeads.map((lead) => (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-[#1a3a2a]/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[#1a3a2a]">
                    {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate group-hover:text-[#1a3a2a]">{lead.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sourceDots[lead.source] ?? '#9ca3af' }} />
                      {sourceLabels[lead.source] ?? lead.source}
                      {lead.campaign?.utmCampaign && <span className="text-gray-300">· {lead.campaign.utmCampaign}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[lead.status] ?? lead.status}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(lead.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </Link>
            ))}
            {d.recentLeads.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-400">No hay leads aún.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
