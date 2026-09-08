import { prisma } from '@/lib/prisma'
import { ReportCharts } from '@/components/admin/ReportCharts'

async function getReportData() {
  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Leads por fuente
  const bySource = await prisma.lead.groupBy({
    by: ['source'], _count: { source: true },
    orderBy: { _count: { source: 'desc' } },
  })
  const totalLeads = bySource.reduce((s, g) => s + g._count.source, 0)
  const sourceData = bySource.map((g) => ({
    source:     g.source,
    count:      g._count.source,
    percentage: totalLeads > 0 ? parseFloat(((g._count.source / totalLeads) * 100).toFixed(1)) : 0,
  }))

  // Leads semanales últimas 8 semanas
  const weeklyData = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const count = await prisma.lead.count({ where: { createdAt: { gte: weekStart, lt: weekEnd } } })
    weeklyData.push({ week: `S${8 - i}`, count })
  }

  // Campañas con métricas
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })
  const campaignData = await Promise.all(
    campaigns.map(async (c) => {
      const sales = await prisma.sale.count({ where: { lead: { campaignId: c.id } } })
      return {
        name:     c.name,
        platform: c.platform,
        budget:   c.budget,
        leads:    c._count.leads,
        sales,
        cpl:  c.budget && c._count.leads > 0 ? Math.round(c.budget / c._count.leads) : null,
      }
    })
  )

  // Totales
  const totalSales = await prisma.sale.count()
  const leadsThisMonth = await prisma.lead.count({ where: { createdAt: { gte: monthStart } } })

  return { sourceData, weeklyData, campaignData, totalLeads, totalSales, leadsThisMonth }
}

export default async function ReportesPage() {
  const data = await getReportData()
  const convRate = data.totalLeads > 0 ? ((data.totalSales / data.totalLeads) * 100).toFixed(1) : '0'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análisis de rendimiento comercial</p>
        </div>
        <a
          href="/api/export/leads"
          className="text-sm border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total leads',       value: data.totalLeads },
          { label: 'Este mes',          value: data.leadsThisMonth },
          { label: 'Ventas cerradas',   value: data.totalSales },
          { label: 'Tasa conversión',   value: `${convRate}%` },
        ].map((k) => (
          <div key={k.label} className="bg-gray-50 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{k.label}</div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
          </div>
        ))}
      </div>

      <ReportCharts sourceData={data.sourceData} weeklyData={data.weeklyData} campaignData={data.campaignData} />
    </div>
  )
}
