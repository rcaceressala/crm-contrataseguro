import type { UTMData } from '@/types'

const UTM_COOKIE_KEY = 'utm_data'
const UTM_COOKIE_DAYS = 30

export function getUTMFromURL(): UTMData {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const data: UTMData = {}

  const keys: (keyof UTMData)[] = [
    'utm_source', 'utm_medium', 'utm_campaign',
    'utm_content', 'utm_term', 'fbclid', 'gclid',
  ]

  keys.forEach((key) => {
    const val = params.get(key)
    if (val) (data as any)[key] = val
  })

  if (Object.keys(data).length > 0) {
    data.landing_page = window.location.pathname
    data.referrer     = document.referrer || undefined
    data.captured_at  = new Date().toISOString()
  }

  return data
}

export function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

export function saveUTMtoCookie(data: UTMData, days = UTM_COOKIE_DAYS): void {
  if (typeof window === 'undefined') return
  const existing = getStoredUTM()
  const merged   = { ...existing, ...data, device: detectDevice() }
  const expires  = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${UTM_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(merged))}; expires=${expires}; path=/; SameSite=Lax`
}

export function getStoredUTM(): UTMData {
  if (typeof window === 'undefined') return {}
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${UTM_COOKIE_KEY}=`))
  if (!match) return {}
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')))
  } catch {
    return {}
  }
}

export function clearUTM(): void {
  if (typeof window === 'undefined') return
  document.cookie = `${UTM_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}
