'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUTM, detectDevice } from '@/lib/utm'

interface Property {
  id:    string
  title: string
  slug:  string
}

interface ContactFormProps {
  preselectedProperty?: string
  properties?: Property[]
}

export function ContactForm({ preselectedProperty, properties = [] }: ContactFormProps) {
  const router = useRouter()
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [propList,   setPropList]   = useState<Property[]>(properties)

  const [form, setForm] = useState({
    name:       '',
    phone:      '',
    email:      '',
    propertyId: preselectedProperty ?? '',
    message:    '',
  })

  useEffect(() => {
    if (properties.length === 0) {
      fetch('/api/properties?status=DISPONIBLE')
        .then((r) => r.json())
        .then((res) => { if (res.data) setPropList(res.data) })
        .catch(() => {})
    }
  }, [properties])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) {
      setError('Nombre y teléfono son obligatorios.')
      return
    }

    setLoading(true)
    setError('')

    const utm = getStoredUTM()

    try {
      const res = await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          phone:        form.phone,
          email:        form.email || undefined,
          message:      form.message || undefined,
          propertyId:   form.propertyId || undefined,
          utm_source:   utm.utm_source,
          utm_medium:   utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content:  utm.utm_content,
          utm_term:     utm.utm_term,
          fbclid:       utm.fbclid,
          gclid:        utm.gclid,
          landing_page: utm.landing_page ?? window.location.pathname,
          referrer:     utm.referrer ?? document.referrer,
          device:       detectDevice(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Error al enviar. Intenta nuevamente.')
        return
      }

      router.push('/gracias')
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          id="name" name="name" type="text"
          value={form.name} onChange={handleChange}
          placeholder="Ej: Juan Pérez"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent text-gray-900 placeholder-gray-400"
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <input
          id="phone" name="phone" type="tel"
          value={form.phone} onChange={handleChange}
          placeholder="+56 9 1234 5678"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent text-gray-900 placeholder-gray-400"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <input
          id="email" name="email" type="email"
          value={form.email} onChange={handleChange}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Parcela de interés */}
      {propList.length > 0 && (
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-1">
            Parcela de interés
          </label>
          <select
            id="propertyId" name="propertyId"
            value={form.propertyId} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent text-gray-900 bg-white"
          >
            <option value="">Sin preferencia específica</option>
            {propList.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          id="message" name="message" rows={4}
          value={form.message} onChange={handleChange}
          placeholder="¿En qué podemos ayudarte? Consultas sobre financiamiento, visitas, características..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        className="w-full bg-[#1a3a2a] hover:bg-[#2d5a3f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Enviando...
          </span>
        ) : 'Solicitar información'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Al enviar aceptas que nos contactemos contigo para entregar información del proyecto.
      </p>
    </form>
  )
}
