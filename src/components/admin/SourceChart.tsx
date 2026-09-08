'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SourceChartProps {
  data: { source: string; count: number; percentage: number }[]
}

const sourceColors: Record<string, string> = {
  FACEBOOK_ADS: '#4267B2',
  INSTAGRAM:    '#E1306C',
  GOOGLE_ADS:   '#4285F4',
  TIKTOK:       '#010101',
  WHATSAPP:     '#25D366',
  ORGANICO:     '#888780',
  REFERIDO:     '#b8860b',
  MANUAL:       '#9ca3af',
}

const sourceLabels: Record<string, string> = {
  FACEBOOK_ADS: 'Facebook',
  INSTAGRAM:    'Instagram',
  GOOGLE_ADS:   'Google',
  TIKTOK:       'TikTok',
  WHATSAPP:     'WhatsApp',
  ORGANICO:     'Orgánico',
  REFERIDO:     'Referido',
  MANUAL:       'Manual',
}

export function SourceChart({ data }: SourceChartProps) {
  const chartData = data.map((d) => ({
    name:  sourceLabels[d.source] ?? d.source,
    leads: d.count,
    color: sourceColors[d.source] ?? '#9ca3af',
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(v: number) => [v, 'Leads']}
        />
        <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
