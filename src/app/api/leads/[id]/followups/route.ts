import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createFollowUpSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'

// GET /api/leads/[id]/followups
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const followUps = await prisma.followUp.findMany({
    where: { leadId: params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { followUpDate: 'asc' },
  })

  return apiSuccess(followUps)
}

// POST /api/leads/[id]/followups
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const body   = await req.json()
  const parsed = createFollowUpSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const followUp = await prisma.followUp.create({
    data: {
      leadId:      params.id,
      userId:      user.id,
      followUpDate: new Date(parsed.data.followUpDate),
      description: parsed.data.description,
    },
    include: { user: { select: { id: true, name: true } } },
  })

  return apiSuccess(followUp, 201)
}
