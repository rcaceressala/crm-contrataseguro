'use client'
import { useEffect, useState } from 'react'
import { getStoredUTM, getUTMFromURL, saveUTMtoCookie } from '@/lib/utm'
import type { UTMData } from '@/types'

export function useUTM(): UTMData {
  const [utm, setUTM] = useState<UTMData>({})

  useEffect(() => {
    const fromURL = getUTMFromURL()
    if (Object.keys(fromURL).length > 0) {
      saveUTMtoCookie(fromURL)
      setUTM(fromURL)
    } else {
      setUTM(getStoredUTM())
    }
  }, [])

  return utm
}
