import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEventSchema } from '@/lib/validations'
import { apiSuccess, apiError, getClientIP } from '@/lib/api-helpers'

// POST /api/events — sin auth, público
export async function POST(req: NextRequest) {
  try {
    const parsed = createEventSchema.safeParse(await req.json())
    if (!parsed.success) return apiError('Datos inválidos', 422)

    const event = await prisma.trackingEvent.create({
      data: {
        ...parsed.data,
        ipAddress: getClientIP(req),
      },
    })

    return apiSuccess({ id: event.id }, 201)
  } catch {
    // No bloquear al usuario si falla el tracking
    return apiSuccess({ id: null }, 201)
  }
}
