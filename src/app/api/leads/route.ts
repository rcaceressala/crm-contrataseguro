import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createLeadSchema } from '@/lib/validations'
import { detectLeadSource, apiSuccess, apiError, getClientIP } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

// GET /api/leads — lista paginada con filtros
export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return apiError('No autorizado', 401)

  const { searchParams } = req.nextUrl
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
  const skip   = (page - 1) * limit

  const where: any = {}

  // Vendedores solo ven sus leads asignados
  if (user.role === Role.VENDEDOR) {
    where.assignedUserId = user.id
  }

  if (searchParams.get('status'))         where.status         = searchParams.get('status')
  if (searchParams.get('source'))         where.source         = searchParams.get('source')
  if (searchParams.get('assignedUserId')) where.assignedUserId = searchParams.get('assignedUserId')
  if (searchParams.get('campaignId'))     where.campaignId     = searchParams.get('campaignId')

  if (searchParams.get('search')) {
    const s = searchParams.get('search')!
    where.OR = [
      { name:  { contains: s, mode: 'insensitive' } },
      { phone: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
    ]
  }

  if (searchParams.get('dateFrom') || searchParams.get('dateTo')) {
    where.createdAt = {}
    if (searchParams.get('dateFrom')) where.createdAt.gte = new Date(searchParams.get('dateFrom')!)
    if (searchParams.get('dateTo'))   where.createdAt.lte = new Date(searchParams.get('dateTo')!)
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        property:   { select: { id: true, title: true, slug: true } },
        campaign:   { select: { id: true, name: true, platform: true } },
        _count: { select: { notes: true, followUps: true } },
      },
    }),
    prisma.lead.count({ where }),
  ])

  return apiSuccess({
    leads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

// POST /api/leads — crear lead desde formulario público
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = createLeadSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422)
    }

    const d = parsed.data
    const source = detectLeadSource(d.utm_source, d.fbclid, d.gclid)

    // Buscar campaña por utm_campaign si viene
    let campaignId: string | undefined
    if (d.utm_campaign) {
      const campaign = await prisma.campaign.findFirst({
        where: { utmCampaign: d.utm_campaign, active: true },
      })
      if (campaign) campaignId = campaign.id
    }

    const lead = await prisma.lead.create({
      data: {
        name:        d.name,
        phone:       d.phone,
        email:       d.email || null,
        message:     d.message || null,
        status:      'NUEVO',
        source,
        utmSource:   d.utm_source   || null,
        utmMedium:   d.utm_medium   || null,
        utmCampaign: d.utm_campaign || null,
        utmContent:  d.utm_content  || null,
        utmTerm:     d.utm_term     || null,
        fbclid:      d.fbclid       || null,
        gclid:       d.gclid        || null,
        landingPage: d.landing_page || null,
        referrer:    d.referrer     || null,
        device:      d.device       || null,
        ipAddress:   getClientIP(req),
        propertyId:  d.propertyId   || null,
        campaignId:  campaignId     || null,
      },
    })

    return apiSuccess({ leadId: lead.id }, 201)
  } catch {
    return apiError('Error al crear el lead', 500)
  }
}
