'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RESERVADA',  label: 'Reservada' },
  { value: 'VENDIDA',    label: 'Vendida' },
]

interface Property {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  area: number
  location: string
  status: string
  images: string[]
}

export function PropertyForm({ property }: { property?: Property }) {
  const isEdit = !!property
  const router = useRouter()

  const [title,       setTitle]       = useState(property?.title ?? '')
  const [slug,        setSlug]        = useState(property?.slug ?? '')
  const [description, setDescription] = useState(property?.description ?? '')
  const [price,        setPrice]       = useState(property?.price?.toString() ?? '')
  const [area,         setArea]        = useState(property?.area?.toString() ?? '')
  const [location,     setLocation]    = useState(property?.location ?? '')
  const [status,       setStatus]      = useState(property?.status ?? 'DISPONIBLE')
  const [images,       setImages]      = useState(property?.images?.join('\n') ?? '')

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      title,
      slug,
      description: description || undefined,
      price:  Number(price),
      area:   Number(area),
      location,
      status,
      images: images.split('\n').map((s) => s.trim()).filter(Boolean),
    }

    const res = await fetch(
      isEdit ? `/api/properties/${property.id}` : '/api/properties',
      {
        method:  isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }
    )

    const json = await res.json()
    setSaving(false)

    if (!res.ok || !json.success) {
      setError(json.error ?? 'Error al guardar')
      return
    }

    router.push(isEdit ? `/admin/parcelas/${property.id}` : `/admin/parcelas/${json.data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Título</label>
          <input
            required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug (URL)</label>
          <input
            required value={slug} onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9-]+" title="Solo letras minúsculas, números y guiones"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Descripción</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Precio (CLP)</label>
          <input
            required type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Área (m²)</label>
          <input
            required type="number" min="0" step="0.01" value={area} onChange={(e) => setArea(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select
            value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] bg-white"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Ubicación</label>
        <input
          required value={location} onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Imágenes (una URL por línea)</label>
        <textarea
          value={images} onChange={(e) => setImages(e.target.value)} rows={3}
          placeholder="https://..."
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] font-mono"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button" onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={saving}
          className="text-sm bg-[#1a3a2a] hover:bg-[#2d5a3f] disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear parcela'}
        </button>
      </div>
    </form>
  )
}
