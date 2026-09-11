'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'NUEVO',      label: 'Nuevo',      color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTADO', label: 'Contactado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COTIZADO',   label: 'Cotizado',   color: 'bg-purple-100 text-purple-800' },
  { value: 'CONVERTIDO', label: 'Convertido', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'PERDIDO',    label: 'Perdido',    color: 'bg-red-100 text-red-800' },
]

interface Props {
  leadId: string; currentStatus: string
  users: { id: string; name: string }[]
  currentAssignedId: string | null
}

export function LeadStatusSelect({ leadId, currentStatus, users, currentAssignedId }: Props) {
  const [status,   setStatus]   = useState(currentStatus)
  const [assigned, setAssigned] = useState(currentAssignedId ?? '')
  const [saving,   setSaving]   = useState(false)
  const router = useRouter()

  const current = STATUS_OPTIONS.find((s) => s.value === status)

  async function update(patch: object) {
    setSaving(true)
    await fetch(`/api/leads/${leadId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(patch),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {saving && <span className="text-xs text-gray-400">Guardando...</span>}
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); update({ status: e.target.value }) }}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] ${current?.color ?? 'bg-gray-100 text-gray-700'}`}
      >
        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select
        value={assigned}
        onChange={(e) => { setAssigned(e.target.value); update({ assignedUserId: e.target.value || null }) }}
        className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] text-gray-700 bg-white"
      >
        <option value="">Sin asignar</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
    </div>
  )
}
