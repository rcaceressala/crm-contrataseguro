import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createNoteSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'

// GET /api/leads/[id]/notes
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const notes = await prisma.leadNote.findMany({
    where: { leadId: params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return apiSuccess(notes)
}

// POST /api/leads/[id]/notes
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const body   = await req.json()
  const parsed = createNoteSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const note = await prisma.leadNote.create({
    data: {
      leadId: params.id,
      userId: user.id,
      note:   parsed.data.note,
    },
    include: { user: { select: { id: true, name: true } } },
  })

  return apiSuccess(note, 201)
}
