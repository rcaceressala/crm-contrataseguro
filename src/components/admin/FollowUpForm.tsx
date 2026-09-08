'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function FollowUpForm({ leadId }: { leadId: string }) {
  const [desc,    setDesc]    = useState('')
  const [date,    setDate]    = useState('')
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!desc.trim() || !date) return
    setLoading(true)

    await fetch(`/api/leads/${leadId}/followups`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ description: desc, followUpDate: new Date(date).toISOString() }),
    })

    setDesc(''); setDate(''); setLoading(false); setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-[#1a3a2a] hover:underline font-medium">
        + Programar seguimiento
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-4 space-y-3">
      <input
        type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
      />
      <input
        value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción del seguimiento..." required
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="text-sm bg-[#1a3a2a] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3f] disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Guardar'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}
