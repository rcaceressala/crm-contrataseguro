'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const COLUMNS = [
  { id: 'NUEVO',      label: 'Nuevo',      color: 'bg-blue-50 border-blue-200',      badge: 'bg-blue-100 text-blue-800' },
  { id: 'CONTACTADO', label: 'Contactado', color: 'bg-yellow-50 border-yellow-200',  badge: 'bg-yellow-100 text-yellow-800' },
  { id: 'COTIZADO',   label: 'Cotizado',   color: 'bg-purple-50 border-purple-200',  badge: 'bg-purple-100 text-purple-800' },
  { id: 'CONVERTIDO', label: 'Convertido', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  { id: 'PERDIDO',    label: 'Perdido',    color: 'bg-red-50 border-red-200',        badge: 'bg-red-100 text-red-800' },
]

const sourceLabels: Record<string, string> = {
  FACEBOOK_ADS:'FB', INSTAGRAM:'IG', GOOGLE_ADS:'GG',
  TIKTOK:'TT', WHATSAPP:'WA', ORGANICO:'ORG', REFERIDO:'REF', MANUAL:'MAN',
}
const sourceDots: Record<string, string> = {
  FACEBOOK_ADS:'#4267B2', INSTAGRAM:'#E1306C', GOOGLE_ADS:'#4285F4',
  TIKTOK:'#010101', WHATSAPP:'#25D366', ORGANICO:'#888780', REFERIDO:'#b8860b', MANUAL:'#9ca3af',
}

interface Lead {
  id: string; name: string; phone: string; status: string; source: string
  assignedTo: { name: string } | null
  createdAt: string
}

interface KanbanBoardProps {
  initialLeads: Lead[]
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads,     setLeads]     = useState(initialLeads)
  const [dragging,  setDragging]  = useState<string | null>(null)
  const [dragOver,  setDragOver]  = useState<string | null>(null)
  const router = useRouter()

  const byStatus = useCallback((status: string) => leads.filter((l) => l.status === status), [leads])

  function handleDragStart(e: React.DragEvent, leadId: string) {
    setDragging(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault()
    if (!dragging) return
    setDragOver(null)

    const lead = leads.find((l) => l.id === dragging)
    if (!lead || lead.status === newStatus) { setDragging(null); return }

    setLeads((prev) => prev.map((l) => l.id === dragging ? { ...l, status: newStatus } : l))
    setDragging(null)

    await fetch(`/api/leads/${dragging}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-160px)]">
      {COLUMNS.map((col) => {
        const colLeads = byStatus(col.id)
        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-56 rounded-xl border ${col.color} ${dragOver === col.id ? 'ring-2 ring-[#1a3a2a]' : ''} transition-all`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column header */}
            <div className="px-3 py-3 border-b border-current/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">{col.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${col.badge}`}>{colLeads.length}</span>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-16">
              {colLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className={`bg-white rounded-lg p-3 border border-gray-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${dragging === lead.id ? 'opacity-50' : ''}`}
                >
                  <a href={`/admin/leads/${lead.id}`} onClick={(e) => e.stopPropagation()}>
                    <div className="font-medium text-gray-900 text-sm mb-1 hover:text-[#1a3a2a] transition-colors">{lead.name}</div>
                  </a>
                  <div className="text-xs text-gray-400 mb-2">{lead.phone}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sourceDots[lead.source] ?? '#9ca3af' }} />
                      {sourceLabels[lead.source] ?? lead.source}
                    </div>
                    {lead.assignedTo && (
                      <div className="w-5 h-5 bg-[#1a3a2a]/10 rounded-full flex items-center justify-center text-xs font-medium text-[#1a3a2a]">
                        {lead.assignedTo.name[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {colLeads.length === 0 && (
                <div className="text-xs text-gray-300 text-center py-4">Arrastra aquí</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
