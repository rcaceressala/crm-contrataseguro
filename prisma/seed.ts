import { PrismaClient, Role, LeadStatus, LeadSource, PropertyStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar datos existentes
  await prisma.sale.deleteMany()
  await prisma.followUp.deleteMany()
  await prisma.leadNote.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.property.deleteMany()
  await prisma.trackingEvent.deleteMany()
  await prisma.user.deleteMany()

  // ─── Usuarios ───────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 12)
  const userPass  = await bcrypt.hash('vendedor123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@mirador.cl',
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
  })

  const supervisor = await prisma.user.create({
    data: {
      name: 'María Rodríguez',
      email: 'maria@mirador.cl',
      passwordHash: userPass,
      role: Role.SUPERVISOR,
    },
  })

  const vendedor1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@mirador.cl',
      passwordHash: userPass,
      role: Role.VENDEDOR,
    },
  })

  const vendedor2 = await prisma.user.create({
    data: {
      name: 'Ana Soto',
      email: 'ana@mirador.cl',
      passwordHash: userPass,
      role: Role.VENDEDOR,
    },
  })

  console.log('✓ Usuarios creados')

  // ─── Campañas ────────────────────────────────────────────
  const camp1 = await prisma.campaign.create({
    data: {
      name: 'Parcelas Mayo 2025',
      platform: 'Facebook',
      budget: 180000,
      utmSource: 'facebook',
      utmMedium: 'cpc',
      utmCampaign: 'parcelas_mayo',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-31'),
    },
  })

  const camp2 = await prisma.campaign.create({
    data: {
      name: 'Video Lote Sur',
      platform: 'Instagram',
      budget: 120000,
      utmSource: 'instagram',
      utmMedium: 'cpc',
      utmCampaign: 'video_lote_sur',
      startDate: new Date('2025-05-01'),
    },
  })

  const camp3 = await prisma.campaign.create({
    data: {
      name: 'Google Search Parcelas',
      platform: 'Google',
      budget: 150000,
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'google_search',
      startDate: new Date('2025-04-15'),
    },
  })

  const camp4 = await prisma.campaign.create({
    data: {
      name: 'Remarketing Visitantes',
      platform: 'Facebook',
      budget: 30000,
      utmSource: 'facebook',
      utmMedium: 'cpc',
      utmCampaign: 'remarketing_v2',
      startDate: new Date('2025-05-10'),
    },
  })

  const camp5 = await prisma.campaign.create({
    data: {
      name: 'TikTok Jóvenes Inversores',
      platform: 'TikTok',
      budget: 80000,
      utmSource: 'tiktok',
      utmMedium: 'social',
      utmCampaign: 'tiktok_jovenes',
      startDate: new Date('2025-05-05'),
    },
  })

  console.log('✓ Campañas creadas')

  // ─── Propiedades ─────────────────────────────────────────
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Parcela A-01',
        slug: 'parcela-a-01',
        description: 'Parcela con vista panorámica al valle, acceso directo a camino principal.',
        price: 29000990,
        area: 5000,
        location: 'Sector A, Isla Yáquil, Santa Cruz',
        status: PropertyStatus.DISPONIBLE,
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        title: 'Parcela A-02',
        slug: 'parcela-a-02',
        description: 'Parcela plana ideal para construcción inmediata, con todos los servicios básicos.',
        price: 29000990,
        area: 5200,
        location: 'Sector A, Isla Yáquil, Santa Cruz',
        status: PropertyStatus.RESERVADA,
        images: [
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        title: 'Parcela B-01',
        slug: 'parcela-b-01',
        description: 'Parcela en sector privilegiado con bosque nativo en límite sur.',
        price: 31500000,
        area: 6000,
        location: 'Sector B, Isla Yáquil, Santa Cruz',
        status: PropertyStatus.DISPONIBLE,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        title: 'Parcela B-02',
        slug: 'parcela-b-02',
        description: 'Terreno con pendiente suave, ideal para casa con vista al cerro.',
        price: 28500000,
        area: 4800,
        location: 'Sector B, Isla Yáquil, Santa Cruz',
        status: PropertyStatus.DISPONIBLE,
        images: [
          'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800',
        ],
      },
    }),
    prisma.property.create({
      data: {
        title: 'Parcela C-01',
        slug: 'parcela-c-01',
        description: 'Parcela esquina con mayor privacidad, rodeada de vegetación.',
        price: 33000000,
        area: 7500,
        location: 'Sector C, Isla Yáquil, Santa Cruz',
        status: PropertyStatus.VENDIDA,
        images: [
          'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        ],
      },
    }),
  ])

  console.log('✓ Propiedades creadas')

  // ─── Leads ───────────────────────────────────────────────
  const leadsData = [
    {
      name: 'Carlos Fuentes',
      phone: '+56988123344',
      email: 'carlos.fuentes@gmail.com',
      message: 'Me interesa la parcela A-01, ¿tienen financiamiento?',
      status: LeadStatus.INTERESADO,
      source: LeadSource.FACEBOOK_ADS,
      utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'parcelas_mayo',
      utmContent: 'video_testimonial', device: 'mobile',
      landingPage: '/parcelas/parcela-a-01',
      assignedUserId: supervisor.id,
      campaignId: camp1.id,
      propertyId: properties[0].id,
    },
    {
      name: 'Valentina Ríos',
      phone: '+56977519900',
      email: 'val.rios@hotmail.com',
      message: 'Quiero agendar una visita al proyecto este fin de semana',
      status: LeadStatus.VISITA_AGENDADA,
      source: LeadSource.INSTAGRAM,
      utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'video_lote_sur',
      utmContent: 'reel_360', device: 'mobile',
      landingPage: '/parcelas',
      assignedUserId: vendedor1.id,
      campaignId: camp2.id,
    },
    {
      name: 'Rodrigo Castillo',
      phone: '+56966348821',
      email: null,
      message: 'Busco parcela para construir casa de campo',
      status: LeadStatus.NUEVO,
      source: LeadSource.GOOGLE_ADS,
      utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'google_search',
      gclid: 'GCL-abc123xyz', device: 'desktop',
      landingPage: '/',
      assignedUserId: vendedor2.id,
      campaignId: camp3.id,
    },
    {
      name: 'María Espinoza',
      phone: '+56999234411',
      email: 'mariaesp@gmail.com',
      message: 'Vi el proyecto en WhatsApp, me interesa saber precios',
      status: LeadStatus.RESERVA,
      source: LeadSource.WHATSAPP,
      utmSource: 'whatsapp', utmMedium: 'social', utmCampaign: null,
      device: 'mobile',
      landingPage: '/parcelas/parcela-b-01',
      assignedUserId: supervisor.id,
      propertyId: properties[2].id,
    },
    {
      name: 'Felipe Muñoz',
      phone: '+56955427788',
      email: 'fmuñoz@empresa.cl',
      message: 'Inversión para arrendar',
      status: LeadStatus.VENDIDO,
      source: LeadSource.FACEBOOK_ADS,
      utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'remarketing_v2',
      fbclid: 'FB-rem-456def', device: 'desktop',
      landingPage: '/parcelas',
      assignedUserId: vendedor1.id,
      campaignId: camp4.id,
      propertyId: properties[4].id,
    },
    {
      name: 'Sofía Herrera',
      phone: '+56944112233',
      email: 'sofia.h@gmail.com',
      message: null,
      status: LeadStatus.CONTACTADO,
      source: LeadSource.TIKTOK,
      utmSource: 'tiktok', utmMedium: 'social', utmCampaign: 'tiktok_jovenes',
      device: 'mobile',
      landingPage: '/',
      assignedUserId: vendedor2.id,
      campaignId: camp5.id,
    },
    {
      name: 'Patricio Vega',
      phone: '+56933445566',
      email: 'pvega@hotmail.com',
      message: '¿Cuáles parcelas tienen acceso a agua potable?',
      status: LeadStatus.INTERESADO,
      source: LeadSource.FACEBOOK_ADS,
      utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'parcelas_mayo',
      utmContent: 'imagen_mapa', device: 'desktop',
      landingPage: '/parcelas/parcela-b-02',
      assignedUserId: supervisor.id,
      campaignId: camp1.id,
      propertyId: properties[3].id,
    },
    {
      name: 'Camila Torres',
      phone: '+56922334455',
      email: 'camila.torres@gmail.com',
      message: 'Me llegó referencia de un amigo que compró',
      status: LeadStatus.NUEVO,
      source: LeadSource.REFERIDO,
      device: 'mobile',
      landingPage: '/',
      assignedUserId: vendedor1.id,
    },
    {
      name: 'Diego Morales',
      phone: '+56911223344',
      email: null,
      message: 'Quiero información del financiamiento a largo plazo',
      status: LeadStatus.PERDIDO,
      source: LeadSource.GOOGLE_ADS,
      utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'google_search',
      gclid: 'GCL-def789ghi', device: 'mobile',
      landingPage: '/',
      assignedUserId: vendedor2.id,
      campaignId: camp3.id,
    },
    {
      name: 'Lorena Campos',
      phone: '+56900112233',
      email: 'lorena.c@gmail.com',
      message: 'Busco parcela cerca de 5.000 m² con vista',
      status: LeadStatus.INTERESADO,
      source: LeadSource.ORGANICO,
      device: 'desktop',
      referrer: 'https://www.google.com',
      landingPage: '/parcelas',
      assignedUserId: supervisor.id,
    },
  ]

  const createdLeads = []
  for (const lead of leadsData) {
    const created = await prisma.lead.create({ data: lead as any })
    createdLeads.push(created)
  }

  console.log('✓ Leads creados')

  // ─── Notas en leads ──────────────────────────────────────
  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[0].id,
      userId: supervisor.id,
      note: 'Llamé al cliente, está muy interesado. Quiere financiamiento a 24 meses. Agendar visita para el sábado.',
    },
  })

  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[0].id,
      userId: supervisor.id,
      note: 'Envié PDF con información del proyecto y tabla de precios.',
    },
  })

  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[1].id,
      userId: vendedor1.id,
      note: 'Visita confirmada para el sábado 17 a las 11:00 AM. Viene con su pareja.',
    },
  })

  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[4].id,
      userId: vendedor1.id,
      note: 'Venta cerrada. Firmó promesa de compraventa. Pagó $5.000.000 de pie.',
    },
  })

  // ─── Seguimientos ────────────────────────────────────────
  await prisma.followUp.create({
    data: {
      leadId: createdLeads[0].id,
      userId: supervisor.id,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      description: 'Llamar para confirmar visita del sábado',
      done: false,
    },
  })

  await prisma.followUp.create({
    data: {
      leadId: createdLeads[2].id,
      userId: vendedor2.id,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description: 'Primer contacto, presentar proyecto y precios',
      done: false,
    },
  })

  // ─── Venta ───────────────────────────────────────────────
  await prisma.sale.create({
    data: {
      leadId: createdLeads[4].id,
      propertyId: properties[4].id,
      userId: vendedor1.id,
      amount: 33000000,
      saleDate: new Date('2025-05-10'),
      notes: 'Pago al contado con descuento del 3%',
    },
  })

  // ─── Tracking events ─────────────────────────────────────
  await prisma.trackingEvent.createMany({
    data: [
      { type: 'whatsapp_click', page: '/parcelas/parcela-a-01', utmSource: 'facebook', utmCampaign: 'parcelas_mayo', device: 'mobile' },
      { type: 'whatsapp_click', page: '/', utmSource: 'instagram', utmCampaign: 'video_lote_sur', device: 'mobile' },
      { type: 'page_view', page: '/parcelas', utmSource: 'google', utmCampaign: 'google_search', device: 'desktop' },
      { type: 'whatsapp_click', page: '/parcelas/parcela-b-01', device: 'mobile' },
    ],
  })

  console.log('✓ Notas, seguimientos, venta y eventos creados')
  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('✅ Seed completado exitosamente')
  console.log('───────────────────────────────────────')
  console.log('Usuarios:')
  console.log('  admin@mirador.cl        / admin123    (ADMIN)')
  console.log('  maria@mirador.cl        / vendedor123 (SUPERVISOR)')
  console.log('  juan@mirador.cl         / vendedor123 (VENDEDOR)')
  console.log('  ana@mirador.cl          / vendedor123 (VENDEDOR)')
  console.log('═══════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
