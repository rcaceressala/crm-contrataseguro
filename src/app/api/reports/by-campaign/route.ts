import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })

  const result = await Promise.all(
    campaigns.map(async (camp) => {
      const sales = await prisma.sale.count({
        where: { lead: { campaignId: camp.id } },
      })
      const leads = camp._count.leads
      return {
        id:       camp.id,
        name:     camp.name,
        platform: camp.platform,
        budget:   camp.budget,
        leads,
        sales,
        cpl: camp.budget && leads > 0 ? Math.round(camp.budget / leads) : null,
        cpa: camp.budget && sales > 0 ? Math.round(camp.budget / sales) : null,
      }
    })
  )

  return apiSuccess(result)
}
