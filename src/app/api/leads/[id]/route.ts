import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { updateLeadSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

// GET /api/leads/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      campaign:   { select: { id: true, name: true, platform: true } },
      notes: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      followUps: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { followUpDate: 'asc' },
      },
      sale: true,
    },
  })

  if (!lead) return apiError('Lead no encontrado', 404)

  // Asesor solo puede ver sus leads
  if (user.role === Role.ASESOR && lead.assignedUserId !== user.id) {
    return apiError('No autorizado', 403)
  }

  return apiSuccess(lead)
}

// PATCH /api/leads/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const body   = await req.json()
  const parsed = updateLeadSchema.safeParse(body)

  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  // Solo admin puede reasignar
  if (parsed.data.assignedUserId !== undefined && user.role === Role.ASESOR) {
    return apiError('Sin permisos para reasignar', 403)
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data:  parsed.data,
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
  })

  return apiSuccess(lead)
}

// DELETE /api/leads/[id] — solo ADMIN
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user || user.role !== Role.ADMIN) return apiError('No autorizado', 403)

  await prisma.lead.delete({ where: { id: params.id } })
  return apiSuccess({ deleted: true })
}
