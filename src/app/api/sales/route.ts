import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createSaleSchema } from '@/lib/validations'
import { apiSuccess, apiError } from '@/lib/api-helpers'

// POST /api/sales — registrar venta y actualizar lead + propiedad
export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const parsed = createSaleSchema.safeParse(await req.json())
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 422)

  const { leadId, propertyId, amount, saleDate, notes } = parsed.data

  // Verificar que el lead existe y no tiene venta
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { sale: true } })
  if (!lead) return apiError('Lead no encontrado', 404)
  if (lead.sale) return apiError('Este lead ya tiene una venta registrada', 409)

  // Transacción: crear venta + actualizar lead + actualizar propiedad
  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        leadId,
        propertyId,
        userId:   user.id,
        amount,
        notes:    notes || null,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
      },
    })

    await tx.lead.update({
      where: { id: leadId },
      data:  { status: 'VENDIDO', propertyId },
    })

    await tx.property.update({
      where: { id: propertyId },
      data:  { status: 'VENDIDA' },
    })

    return newSale
  })

  return apiSuccess(sale, 201)
}

// GET /api/sales
export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: 'desc' },
    include: {
      lead:     { select: { id: true, name: true, phone: true } },
      property: { select: { id: true, title: true, slug: true } },
      user:     { select: { id: true, name: true } },
    },
  })

  return apiSuccess(sales)
}
