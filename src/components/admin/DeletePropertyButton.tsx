'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeletePropertyButton({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`¿Eliminar la parcela "${propertyTitle}"? Esta acción no se puede deshacer.`)) return

    setDeleting(true)
    setError('')

    const res  = await fetch(`/api/properties/${propertyId}`, { method: 'DELETE' })
    const json = await res.json()

    if (!res.ok || !json.success) {
      setError(json.error ?? 'No se pudo eliminar')
      setDeleting(false)
      return
    }

    router.push('/admin/parcelas')
    router.refresh()
  }

  return (
    <div>
      <button
        onClick={handleDelete} disabled={deleting}
        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
      >
        {deleting ? 'Eliminando...' : 'Eliminar parcela'}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
