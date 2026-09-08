import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const grouped = await prisma.lead.groupBy({
    by:     ['source'],
    _count: { source: true },
    orderBy: { _count: { source: 'desc' } },
  })

  const total = grouped.reduce((sum, g) => sum + g._count.source, 0)

  const result = await Promise.all(
    grouped.map(async (g) => {
      const sales = await prisma.sale.count({
        where: { lead: { source: g.source } },
      })
      return {
        source:     g.source,
        count:      g._count.source,
        percentage: total > 0 ? parseFloat(((g._count.source / total) * 100).toFixed(1)) : 0,
        sales,
      }
    })
  )

  return apiSuccess(result)
}
