interface StatsCardProps {
  label:      string
  value:      string | number
  delta?:     string
  deltaType?: 'up' | 'down' | 'neutral'
  icon?:      string
}

export function StatsCard({ label, value, delta, deltaType = 'neutral', icon }: StatsCardProps) {
  const deltaColors = {
    up:      'text-green-600',
    down:    'text-red-500',
    neutral: 'text-gray-400',
  }
  const deltaIcons = { up: '↑', down: '↓', neutral: '—' }

  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
      {delta && (
        <div className={`text-xs font-medium ${deltaColors[deltaType]} flex items-center gap-1`}>
          <span>{deltaIcons[deltaType]}</span>
          {delta}
        </div>
      )}
    </div>
  )
}
