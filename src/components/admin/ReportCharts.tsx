'use client'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const sourceLabels: Record<string, string> = {
  FACEBOOK_ADS:'Facebook', INSTAGRAM:'Instagram', GOOGLE_ADS:'Google',
  TIKTOK:'TikTok', WHATSAPP:'WhatsApp', ORGANICO:'Orgánico', REFERIDO:'Referido', MANUAL:'Manual',
}
const sourceColors: Record<string, string> = {
  FACEBOOK_ADS:'#4267B2', INSTAGRAM:'#E1306C', GOOGLE_ADS:'#4285F4',
  TIKTOK:'#010101', WHATSAPP:'#25D366', ORGANICO:'#888780', REFERIDO:'#b8860b', MANUAL:'#9ca3af',
}

interface Props {
  sourceData:   { source: string; count: number; percentage: number }[]
  weeklyData:   { week: string; count: number }[]
  campaignData: { name: string; platform: string; budget: number | null; leads: number; sales: number; cpl: number | null }[]
}

const fmt = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export function ReportCharts({ sourceData, weeklyData, campaignData }: Props) {
  const barData = sourceData.map((d) => ({
    name:  sourceLabels[d.source] ?? d.source,
    leads: d.count,
    color: sourceColors[d.source] ?? '#9ca3af',
  }))

  return (
    <div className="space-y-6">
      {/* Row 1 — dos gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuente */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads por fuente</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [v, 'Leads']} />
              <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tendencia semanal */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Tendencia semanal (8 semanas)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [v, 'Leads']} />
              <Line
                type="monotone" dataKey="count" stroke="#1a3a2a" strokeWidth={2}
                dot={{ fill: '#1a3a2a', r: 4 }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla conversión por campaña */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Conversión por campaña</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Campaña', 'Plataforma', 'Inversión', 'Leads', 'Ventas', 'CPL', 'Conv. %'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaignData.map((c, i) => {
                const conv = c.leads > 0 ? ((c.sales / c.leads) * 100).toFixed(1) : '0'
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.platform}</td>
                    <td className="px-4 py-3 text-gray-600">{c.budget ? fmt(c.budget) : '—'}</td>
                    <td className="px-4 py-3 font-semibold">{c.leads}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{c.sales}</td>
                    <td className="px-4 py-3">{c.cpl ? <span className="text-[#1a3a2a] font-medium">{fmt(c.cpl)}</span> : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-16">
                          <div className="bg-[#1a3a2a] h-1.5 rounded-full" style={{ width: `${Math.min(100, parseFloat(conv) * 10)}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{conv}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {campaignData.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Sin datos de campañas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
