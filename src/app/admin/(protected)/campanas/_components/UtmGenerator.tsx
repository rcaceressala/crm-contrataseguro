'use client'

import { useState } from 'react'

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/40 focus:border-[#1a3a2a]'
const labelCls = 'block text-xs font-medium text-gray-700 mb-1'

export default function UtmGenerator() {
  const [form, setForm] = useState({
    url: 'https://multiparcelaschile.cl',
    utm_source: 'instagram',
    utm_medium: 'cpc',
    utm_campaign: '',
    utm_content: '',
  })
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)

  function generate() {
    if (!form.url || !form.utm_campaign.trim()) return
    const base = form.url.replace(/\/$/, '')
    const params = new URLSearchParams({
      utm_source:   form.utm_source,
      utm_medium:   form.utm_medium,
      utm_campaign: form.utm_campaign.trim(),
      ...(form.utm_content.trim() ? { utm_content: form.utm_content.trim() } : {}),
    })
    setGenerated(`${base}?${params.toString()}`)
    setCopied(false)
  }

  async function copy() {
    if (!generated) return
    await navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-base font-semibold text-gray-900">Generador de enlace UTM</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* URL base */}
        <div className="sm:col-span-2">
          <label className={labelCls}>URL base</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://multiparcelaschile.cl"
            className={inputCls}
          />
        </div>

        {/* utm_source */}
        <div>
          <label className={labelCls}>utm_source</label>
          <select
            value={form.utm_source}
            onChange={(e) => setForm({ ...form, utm_source: e.target.value })}
            className={inputCls}
          >
            <option value="instagram">instagram</option>
            <option value="facebook">facebook</option>
            <option value="google">google</option>
            <option value="tiktok">tiktok</option>
          </select>
        </div>

        {/* utm_medium */}
        <div>
          <label className={labelCls}>utm_medium</label>
          <select
            value={form.utm_medium}
            onChange={(e) => setForm({ ...form, utm_medium: e.target.value })}
            className={inputCls}
          >
            <option value="cpc">cpc</option>
            <option value="social">social</option>
            <option value="email">email</option>
            <option value="organic">organic</option>
          </select>
        </div>

        {/* utm_campaign */}
        <div>
          <label className={labelCls}>utm_campaign</label>
          <input
            type="text"
            value={form.utm_campaign}
            onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })}
            placeholder="ej: mayo-2025-parcelas"
            className={inputCls}
          />
        </div>

        {/* utm_content */}
        <div>
          <label className={labelCls}>utm_content <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            type="text"
            value={form.utm_content}
            onChange={(e) => setForm({ ...form, utm_content: e.target.value })}
            placeholder="ej: banner-cuadrado"
            className={inputCls}
          />
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!form.url || !form.utm_campaign.trim()}
        className="bg-[#1a3a2a] hover:bg-[#24503a] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
      >
        Generar enlace
      </button>

      {generated && (
        <div className="rounded-lg border border-[#1a3a2a]/20 bg-[#1a3a2a]/5 p-4 flex items-start gap-3">
          <p className="flex-1 text-sm font-mono text-gray-800 break-all">{generated}</p>
          <button
            onClick={copy}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-md bg-[#1a3a2a] hover:bg-[#24503a] text-white transition-colors"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  )
}
