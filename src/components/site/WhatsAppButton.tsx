'use client'
import { getStoredUTM, detectDevice } from '@/lib/utm'

interface WhatsAppButtonProps {
  variant?: 'floating' | 'inline'
  message?: string
  label?: string
  className?: string
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '56900000000'

export function WhatsAppButton({
  variant  = 'floating',
  message  = 'Hola, me interesa recibir información sobre los seguros de Contrataseguro.',
  label    = 'Consultar por WhatsApp',
  className = '',
}: WhatsAppButtonProps) {

  async function handleClick() {
    const utm = getStoredUTM()

    // Registrar evento — no bloquear si falla
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:        'whatsapp_click',
          page:        window.location.pathname,
          utmSource:   utm.utm_source,
          utmMedium:   utm.utm_medium,
          utmCampaign: utm.utm_campaign,
          fbclid:      utm.fbclid,
          gclid:       utm.gclid,
          device:      detectDevice(),
        }),
      })
    } catch {
      // silencioso
    }

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        aria-label="Contactar por WhatsApp"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20b958] text-white font-medium px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 ${className}`}
      >
        <WhatsAppIcon />
        <span className="hidden sm:inline text-sm">{label}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b958] text-white font-semibold px-6 py-3 rounded-lg transition-colors w-full ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </button>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.856L.057 23.882l6.19-1.624A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 01-5.003-1.373l-.36-.213-3.714.974.99-3.617-.234-.373A9.79 9.79 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
  )
}
