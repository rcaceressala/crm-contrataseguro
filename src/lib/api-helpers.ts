import { LeadSource } from '@prisma/client'
import { NextResponse } from 'next/server'

export function detectLeadSource(
  utmSource?: string,
  fbclid?: string,
  gclid?: string
): LeadSource {
  if (gclid || utmSource === 'google')    return LeadSource.GOOGLE_ADS
  if (fbclid)                              return LeadSource.FACEBOOK_ADS
  if (utmSource === 'facebook')            return LeadSource.FACEBOOK_ADS
  if (utmSource === 'instagram')           return LeadSource.INSTAGRAM
  if (utmSource === 'tiktok')              return LeadSource.TIKTOK
  if (utmSource === 'whatsapp')            return LeadSource.WHATSAPP
  if (utmSource === 'referido')            return LeadSource.REFERIDO
  if (utmSource)                           return LeadSource.MANUAL
  return LeadSource.ORGANICO
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
