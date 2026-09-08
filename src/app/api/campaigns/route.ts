import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createCampaignSchema, updateCampaignSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

// GET /api/campaigns
export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { leads: true } },
    },
  })

  // Calcular CPL y CPA para cada campaña
  const withMetrics = await Promise.all(
    campaigns.map(async (camp) => {
      const sales = await prisma.sale.count({
        where: { lead: { campaignId: camp.id } },
      })
      const leads = camp._count.leads
      const cpl   = camp.budget && leads > 0 ? Math.round(camp.budget / leads) : null
      const cpa   = camp.budget && sales > 0 ? Math.round(camp.budget / sales) : null
      return { ...camp, salesCount: sales, cpl, cpa }
    })
  )

  return apiSuccess(withMetrics)
}

// POST /api/campaigns
export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (!user || user.role === Role.VENDEDOR) return apiError('No autorizado', 403)

  const parsed = createCampaignSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const campaign = await prisma.campaign.create({
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate:   parsed.data.endDate   ? new Date(parsed.data.endDate)   : null,
    } as any,
  })

  return apiSuccess(campaign, 201)
}
