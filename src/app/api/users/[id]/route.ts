import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole([Role.ADMIN])
  if (!admin) return apiError('No autorizado', 403)

  const parsed = updateUserSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const { password, ...rest } = parsed.data
  const data: Record<string, unknown> = { ...rest }
  if (password) data.passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  return apiSuccess(user)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole([Role.ADMIN])
  if (!admin) return apiError('No autorizado', 403)

  // Soft delete — desactivar en vez de borrar
  await prisma.user.update({
    where: { id: params.id },
    data:  { active: false },
  })

  return apiSuccess({ deactivated: true })
}
