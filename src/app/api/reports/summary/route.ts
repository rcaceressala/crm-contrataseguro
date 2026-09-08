import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const now       = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalLeads,
    leadsToday,
    leadsThisMonth,
    totalSales,
    pendingFollowUps,
    campaignsWithBudget,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.sale.count(),
    prisma.followUp.count({ where: { done: false, followUpDate: { lte: now } } }),
    prisma.campaign.findMany({
      where:   { budget: { not: null } },
      include: { _count: { select: { leads: true } } },
    }),
  ])

  // CPL promedio
  let avgCPL = 0
  const campWithLeads = campaignsWithBudget.filter((c) => c._count.leads > 0)
  if (campWithLeads.length > 0) {
    const totalCPL = campWithLeads.reduce(
      (sum, c) => sum + (c.budget! / c._count.leads), 0
    )
    avgCPL = Math.round(totalCPL / campWithLeads.length)
  }

  const conversionRate = totalLeads > 0
    ? parseFloat(((totalSales / totalLeads) * 100).toFixed(1))
    : 0

  return apiSuccess({
    totalLeads,
    leadsToday,
    leadsThisMonth,
    totalSales,
    conversionRate,
    avgCPL,
    pendingFollowUps,
  })
}
