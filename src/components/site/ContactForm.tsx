'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredUTM, detectDevice } from '@/lib/utm'

const CATEGORY_OPTIONS = [
  { value: 'COMPLEMENTARIO', label: 'Complementario' },
  { value: 'DENTAL',         label: 'Dental' },
  { value: 'CATASTROFICO',   label: 'Catastrófico' },
  { value: 'MASCOTAS',       label: 'Mascotas' },
  { value: 'HOGAR',          label: 'Hogar' },
  { value: 'AUTOMOTRIZ',     label: 'Automotriz' },
  { value: 'VIDA',           label: 'Vida' },
]

interface ContactFormProps {
  preselectedCategory?: string
}

export function ContactForm({ preselectedCategory }: ContactFormProps) {
  const router = useRouter()
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const [form, setForm] = useState({
    name:     '',
    phone:    '',
    email:    '',
    category: preselectedCategory ?? '',
    message:  '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone || !form.category) {
      setError('Nombre, teléfono y tipo de seguro son obligatorios.')
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
          category:     form.category,
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

      {/* Tipo de seguro */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de seguro <span className="text-red-500">*</span>
        </label>
        <select
          id="category" name="category"
          value={form.category} onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent text-gray-900 bg-white"
          required
        >
          <option value="">Selecciona una opción</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

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
