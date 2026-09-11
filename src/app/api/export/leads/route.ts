import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return new NextResponse('No autorizado', { status: 401 })

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: { select: { name: true } },
      campaign:   { select: { name: true } },
    },
  })

  const headers = [
    'ID', 'Nombre', 'Teléfono', 'Email', 'Estado', 'Fuente', 'Categoría',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
    'fbclid', 'gclid', 'Página de entrada', 'Dispositivo',
    'Asesor asignado', 'Campaña', 'Creado',
  ]

  const rows = leads.map((l) => [
    l.id, l.name, l.phone, l.email ?? '',
    l.status, l.source, l.category,
    l.utmSource ?? '', l.utmMedium ?? '', l.utmCampaign ?? '', l.utmContent ?? '',
    l.fbclid ?? '', l.gclid ?? '', l.landingPage ?? '', l.device ?? '',
    l.assignedTo?.name ?? '', l.campaign?.name ?? '',
    l.createdAt.toISOString(),
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return new NextResponse('\uFEFF' + csvContent, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
