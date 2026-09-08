import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createPropertySchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

// GET /api/properties — público (sin auth) para el sitio
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const where: any = {}

  if (searchParams.get('status')) where.status = searchParams.get('status')

  if (searchParams.get('search')) {
    const s = searchParams.get('search')!
    where.OR = [
      { title:    { contains: s, mode: 'insensitive' } },
      { location: { contains: s, mode: 'insensitive' } },
    ]
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { leads: true } },
    },
  })

  return apiSuccess(properties)
}

// POST /api/properties — solo ADMIN/SUPERVISOR
export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (!user || user.role === Role.VENDEDOR) return apiError('No autorizado', 403)

  const body   = await req.json()
  const parsed = createPropertySchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const property = await prisma.property.create({ data: parsed.data as any })
  return apiSuccess(property, 201)
}
