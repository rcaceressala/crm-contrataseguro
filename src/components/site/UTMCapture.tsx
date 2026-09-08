'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getUTMFromURL, saveUTMtoCookie } from '@/lib/utm'

export function UTMCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const utmData = getUTMFromURL()
    if (Object.keys(utmData).length > 0) {
      saveUTMtoCookie(utmData)
    }
  }, [searchParams])

  return null
}
