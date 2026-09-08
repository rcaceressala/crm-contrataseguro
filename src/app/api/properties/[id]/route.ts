import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { updatePropertySchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { _count: { select: { leads: true, sales: true } } },
  })
  if (!property) return apiError('Parcela no encontrada', 404)
  return apiSuccess(property)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user || user.role === Role.VENDEDOR) return apiError('No autorizado', 403)

  const parsed = updatePropertySchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const property = await prisma.property.update({
    where: { id: params.id },
    data:  parsed.data as any,
  })
  return apiSuccess(property)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user || user.role !== Role.ADMIN) return apiError('No autorizado', 403)

  await prisma.property.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
