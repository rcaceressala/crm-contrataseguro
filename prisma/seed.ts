import { PrismaClient, Role, LeadStatus, LeadSource, InsuranceCategory } from '@prisma/client'
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
  await prisma.trackingEvent.deleteMany()
  await prisma.user.deleteMany()

  // ─── Usuarios ───────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 12)
  const userPass  = await bcrypt.hash('asesor123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@contrataseguro.cl',
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
  })

  const asesor1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@contrataseguro.cl',
      passwordHash: userPass,
      role: Role.ASESOR,
    },
  })

  const asesor2 = await prisma.user.create({
    data: {
      name: 'Ana Soto',
      email: 'ana@contrataseguro.cl',
      passwordHash: userPass,
      role: Role.ASESOR,
    },
  })

  console.log('✓ Usuarios creados')

  // ─── Campañas ────────────────────────────────────────────
  const camp1 = await prisma.campaign.create({
    data: {
      name: 'Seguro Dental Mayo 2025',
      platform: 'Facebook',
      budget: 180000,
      utmSource: 'facebook',
      utmMedium: 'cpc',
      utmCampaign: 'dental_mayo',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-31'),
    },
  })

  const camp2 = await prisma.campaign.create({
    data: {
      name: 'Video Seguro Automotriz',
      platform: 'Instagram',
      budget: 120000,
      utmSource: 'instagram',
      utmMedium: 'cpc',
      utmCampaign: 'video_automotriz',
      startDate: new Date('2025-05-01'),
    },
  })

  const camp3 = await prisma.campaign.create({
    data: {
      name: 'Google Search Seguros',
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
      name: 'TikTok Seguro Mascotas',
      platform: 'TikTok',
      budget: 80000,
      utmSource: 'tiktok',
      utmMedium: 'social',
      utmCampaign: 'tiktok_mascotas',
      startDate: new Date('2025-05-05'),
    },
  })

  console.log('✓ Campañas creadas')

  // ─── Leads ───────────────────────────────────────────────
  const leadsData = [
    {
      name: 'Carlos Fuentes',
      phone: '+56988123344',
      email: 'carlos.fuentes@gmail.com',
      message: 'Me interesa un seguro dental, ¿tienen planes familiares?',
      status: LeadStatus.COTIZADO,
      source: LeadSource.FACEBOOK_ADS,
      category: InsuranceCategory.DENTAL,
      utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'dental_mayo',
      utmContent: 'video_testimonial', device: 'mobile',
      landingPage: '/seguros/dental',
      assignedUserId: asesor1.id,
      campaignId: camp1.id,
    },
    {
      name: 'Valentina Ríos',
      phone: '+56977519900',
      email: 'val.rios@hotmail.com',
      message: 'Quiero cotizar un seguro automotriz para mi auto nuevo',
      status: LeadStatus.COTIZADO,
      source: LeadSource.INSTAGRAM,
      category: InsuranceCategory.AUTOMOTRIZ,
      utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'video_automotriz',
      utmContent: 'reel_360', device: 'mobile',
      landingPage: '/seguros',
      assignedUserId: asesor1.id,
      campaignId: camp2.id,
    },
    {
      name: 'Rodrigo Castillo',
      phone: '+56966348821',
      email: null,
      message: 'Busco un seguro de hogar para mi casa nueva',
      status: LeadStatus.NUEVO,
      source: LeadSource.GOOGLE_ADS,
      category: InsuranceCategory.HOGAR,
      utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'google_search',
      gclid: 'GCL-abc123xyz', device: 'desktop',
      landingPage: '/',
      assignedUserId: asesor2.id,
      campaignId: camp3.id,
    },
    {
      name: 'María Espinoza',
      phone: '+56999234411',
      email: 'mariaesp@gmail.com',
      message: 'Vi el proyecto en WhatsApp, me interesa saber precios del seguro catastrófico',
      status: LeadStatus.COTIZADO,
      source: LeadSource.WHATSAPP,
      category: InsuranceCategory.CATASTROFICO,
      utmSource: 'whatsapp', utmMedium: 'social', utmCampaign: null,
      device: 'mobile',
      landingPage: '/seguros/catastrofico',
      assignedUserId: asesor1.id,
    },
    {
      name: 'Felipe Muñoz',
      phone: '+56955427788',
      email: 'fmuñoz@empresa.cl',
      message: 'Necesito seguro de vida para mi familia',
      status: LeadStatus.CONVERTIDO,
      source: LeadSource.FACEBOOK_ADS,
      category: InsuranceCategory.VIDA,
      utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'remarketing_v2',
      fbclid: 'FB-rem-456def', device: 'desktop',
      landingPage: '/seguros',
      assignedUserId: asesor2.id,
      campaignId: camp4.id,
    },
    {
      name: 'Sofía Herrera',
      phone: '+56944112233',
      email: 'sofia.h@gmail.com',
      message: null,
      status: LeadStatus.CONTACTADO,
      source: LeadSource.TIKTOK,
      category: InsuranceCategory.MASCOTAS,
      utmSource: 'tiktok', utmMedium: 'social', utmCampaign: 'tiktok_mascotas',
      device: 'mobile',
      landingPage: '/',
      assignedUserId: asesor1.id,
      campaignId: camp5.id,
    },
    {
      name: 'Patricio Vega',
      phone: '+56933445566',
      email: 'pvega@hotmail.com',
      message: '¿El seguro dental cubre ortodoncia?',
      status: LeadStatus.COTIZADO,
      source: LeadSource.FACEBOOK_ADS,
      category: InsuranceCategory.DENTAL,
      utmSource: 'facebook', utmMedium: 'cpc', utmCampaign: 'dental_mayo',
      utmContent: 'imagen_mapa', device: 'desktop',
      landingPage: '/seguros/dental',
      assignedUserId: asesor2.id,
      campaignId: camp1.id,
    },
    {
      name: 'Camila Torres',
      phone: '+56922334455',
      email: 'camila.torres@gmail.com',
      message: 'Me llegó referencia de un amigo que contrató un plan complementario',
      status: LeadStatus.NUEVO,
      source: LeadSource.REFERIDO,
      category: InsuranceCategory.COMPLEMENTARIO,
      device: 'mobile',
      landingPage: '/',
      assignedUserId: asesor1.id,
    },
    {
      name: 'Diego Morales',
      phone: '+56911223344',
      email: null,
      message: 'Quiero información sobre financiamiento del seguro automotriz',
      status: LeadStatus.PERDIDO,
      source: LeadSource.GOOGLE_ADS,
      category: InsuranceCategory.AUTOMOTRIZ,
      utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'google_search',
      gclid: 'GCL-def789ghi', device: 'mobile',
      landingPage: '/',
      assignedUserId: asesor2.id,
      campaignId: camp3.id,
    },
    {
      name: 'Lorena Campos',
      phone: '+56900112233',
      email: 'lorena.c@gmail.com',
      message: 'Busco un plan complementario de salud con buena cobertura',
      status: LeadStatus.COTIZADO,
      source: LeadSource.ORGANICO,
      category: InsuranceCategory.COMPLEMENTARIO,
      device: 'desktop',
      referrer: 'https://www.google.com',
      landingPage: '/seguros',
      assignedUserId: asesor1.id,
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
      userId: asesor1.id,
      note: 'Llamé al cliente, está muy interesado. Quiere plan familiar. Enviar cotización.',
    },
  })

  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[0].id,
      userId: asesor1.id,
      note: 'Envié PDF con información del plan dental y tabla de coberturas.',
    },
  })

  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[1].id,
      userId: asesor1.id,
      note: 'Cotización enviada por WhatsApp. Está evaluando con su pareja.',
    },
  })

  await prisma.leadNote.create({
    data: {
      leadId: createdLeads[4].id,
      userId: asesor2.id,
      note: 'Venta cerrada. Firmó la póliza de vida. Primera cuota pagada.',
    },
  })

  // ─── Seguimientos ────────────────────────────────────────
  await prisma.followUp.create({
    data: {
      leadId: createdLeads[0].id,
      userId: asesor1.id,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      description: 'Llamar para confirmar recepción de la cotización',
      done: false,
    },
  })

  await prisma.followUp.create({
    data: {
      leadId: createdLeads[2].id,
      userId: asesor2.id,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      description: 'Primer contacto, presentar planes y precios',
      done: false,
    },
  })

  // ─── Venta ───────────────────────────────────────────────
  await prisma.sale.create({
    data: {
      leadId: createdLeads[4].id,
      userId: asesor2.id,
      producto: 'Seguro de Vida Plan Familiar',
      comision: 85000,
      saleDate: new Date('2025-05-10'),
      notes: 'Pago mensual con descuento del 3% por pago anual anticipado',
    },
  })

  // ─── Tracking events ─────────────────────────────────────
  await prisma.trackingEvent.createMany({
    data: [
      { type: 'whatsapp_click', page: '/seguros/dental', utmSource: 'facebook', utmCampaign: 'dental_mayo', device: 'mobile' },
      { type: 'whatsapp_click', page: '/', utmSource: 'instagram', utmCampaign: 'video_automotriz', device: 'mobile' },
      { type: 'page_view', page: '/seguros', utmSource: 'google', utmCampaign: 'google_search', device: 'desktop' },
      { type: 'whatsapp_click', page: '/seguros/catastrofico', device: 'mobile' },
    ],
  })

  console.log('✓ Notas, seguimientos, venta y eventos creados')
  console.log('')
  console.log('═══════════════════════════════════════')
  console.log('✅ Seed completado exitosamente')
  console.log('───────────────────────────────────────')
  console.log('Usuarios:')
  console.log('  admin@contrataseguro.cl / admin123  (ADMIN)')
  console.log('  juan@contrataseguro.cl  / asesor123 (ASESOR)')
  console.log('  ana@contrataseguro.cl   / asesor123 (ASESOR)')
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
