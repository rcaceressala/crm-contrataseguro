'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NoteForm({ leadId }: { leadId: string }) {
  const [note,    setNote]    = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setLoading(true)

    await fetch(`/api/leads/${leadId}/notes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ note }),
    })

    setNote('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Agregar nota..."
        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
      />
      <button
        type="submit" disabled={loading || !note.trim()}
        className="text-sm bg-[#1a3a2a] hover:bg-[#2d5a3f] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
      >
        {loading ? '...' : 'Agregar'}
      </button>
    </form>
  )
}
