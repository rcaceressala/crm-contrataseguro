import { prisma } from '@/lib/prisma'
import UtmGenerator from './_components/UtmGenerator'

export default async function CampanasPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })

  const withMetrics = await Promise.all(
    campaigns.map(async (c) => {
      const sales = await prisma.sale.count({ where: { lead: { campaignId: c.id } } })
      const leads = c._count.leads
      return {
        ...c, salesCount: sales,
        cpl: c.budget && leads > 0 ? Math.round(c.budget / leads) : null,
        cpa: c.budget && sales > 0 ? Math.round(c.budget / sales) : null,
      }
    })
  )

  const fmt  = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0)
  const totalLeads  = withMetrics.reduce((s, c) => s + c._count.leads, 0)
  const totalSales  = withMetrics.reduce((s, c) => s + c.salesCount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Campañas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{campaigns.length} campañas registradas</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Inversión total', value: fmt(totalBudget) },
          { label: 'Total leads', value: totalLeads },
          { label: 'Ventas atribuidas', value: totalSales },
        ].map((k) => (
          <div key={k.label} className="bg-gray-50 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{k.label}</div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Campaña', 'Plataforma', 'Inversión', 'Leads', 'CPL', 'Ventas', 'CPA', 'ROI'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withMetrics.map((c) => {
                const roi = c.budget && c.salesCount > 0 ? Math.round((c.salesCount * 29000990) / c.budget) : null
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{c.utmCampaign}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.platform}</td>
                    <td className="px-4 py-3 text-gray-900">{c.budget ? fmt(c.budget) : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{c._count.leads}</td>
                    <td className="px-4 py-3">
                      {c.cpl ? <span className={`font-medium ${c.cpl < 2000 ? 'text-green-600' : c.cpl < 5000 ? 'text-yellow-600' : 'text-red-600'}`}>{fmt(c.cpl)}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.salesCount}</td>
                    <td className="px-4 py-3 text-gray-600">{c.cpa ? fmt(c.cpa) : '—'}</td>
                    <td className="px-4 py-3">
                      {roi ? <span className={`font-medium ${roi >= 10 ? 'text-green-600' : 'text-yellow-600'}`}>{roi}x</span> : '—'}
                    </td>
                  </tr>
                )
              })}
              {withMetrics.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Sin campañas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <UtmGenerator />
    </div>
  )
}
