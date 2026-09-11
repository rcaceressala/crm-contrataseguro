import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { createUserSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const user = await requireRole([Role.ADMIN])
  if (!user) return apiError('No autorizado', 403)

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, name: true, email: true,
      role: true, active: true, createdAt: true,
      _count: { select: { leads: true, sales: true } },
    },
  })

  return apiSuccess(users)
}

export async function POST(req: NextRequest) {
  const admin = await requireRole([Role.ADMIN])
  if (!admin) return apiError('No autorizado', 403)

  const parsed = createUserSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return apiError('El email ya está registrado', 409)

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name:         parsed.data.name,
      email:        parsed.data.email,
      passwordHash,
      role:         parsed.data.role ?? Role.ASESOR,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return apiSuccess(user, 201)
}
