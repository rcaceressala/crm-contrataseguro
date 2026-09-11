'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface User { id: string; name: string }

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'NUEVO', label: 'Nuevo' }, { value: 'CONTACTADO', label: 'Contactado' },
  { value: 'COTIZADO', label: 'Cotizado' }, { value: 'CONVERTIDO', label: 'Convertido' },
  { value: 'PERDIDO', label: 'Perdido' },
]
const SOURCE_OPTIONS = [
  { value: '', label: 'Todas las fuentes' },
  { value: 'FACEBOOK_ADS', label: 'Facebook Ads' }, { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'GOOGLE_ADS', label: 'Google Ads' }, { value: 'TIKTOK', label: 'TikTok' },
  { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'ORGANICO', label: 'Orgánico' },
  { value: 'REFERIDO', label: 'Referido' }, { value: 'MANUAL', label: 'Manual' },
]

export function LeadFiltersBar({ users }: { users: User[] }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const selectClass = "text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] bg-white text-gray-700"

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="search"
        placeholder="Buscar nombre, teléfono, email..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => updateFilter('search', e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] w-64"
      />
      <select defaultValue={searchParams.get('status') ?? ''} onChange={(e) => updateFilter('status', e.target.value)} className={selectClass}>
        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select defaultValue={searchParams.get('source') ?? ''} onChange={(e) => updateFilter('source', e.target.value)} className={selectClass}>
        {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select defaultValue={searchParams.get('assignedUserId') ?? ''} onChange={(e) => updateFilter('assignedUserId', e.target.value)} className={selectClass}>
        <option value="">Todos los asesores</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
    </div>
  )
}
