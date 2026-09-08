import { z } from 'zod'
import { LeadStatus, LeadSource, PropertyStatus, Role } from '@prisma/client'

// ─── Leads ───────────────────────────────────────────────

export const createLeadSchema = z.object({
  name:         z.string().min(2, 'Nombre requerido'),
  phone:        z.string().min(8, 'Teléfono inválido'),
  email:        z.string().email().optional().or(z.literal('')),
  message:      z.string().max(1000).optional(),
  propertyId:   z.string().cuid().optional(),
  utm_source:   z.string().max(100).optional(),
  utm_medium:   z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_content:  z.string().max(100).optional(),
  utm_term:     z.string().max(100).optional(),
  fbclid:       z.string().max(200).optional(),
  gclid:        z.string().max(200).optional(),
  landing_page: z.string().max(500).optional(),
  referrer:     z.string().max(500).optional(),
  device:       z.enum(['mobile', 'desktop', 'tablet']).optional(),
})

export const updateLeadSchema = z.object({
  status:         z.nativeEnum(LeadStatus).optional(),
  assignedUserId: z.string().cuid().nullable().optional(),
  propertyId:     z.string().cuid().nullable().optional(),
  campaignId:     z.string().cuid().nullable().optional(),
  name:           z.string().min(2).optional(),
  phone:          z.string().min(8).optional(),
  email:          z.string().email().optional().or(z.literal('')),
  message:        z.string().max(1000).optional(),
})

export const createNoteSchema = z.object({
  note: z.string().min(1, 'La nota no puede estar vacía').max(2000),
})

export const createFollowUpSchema = z.object({
  followUpDate: z.string().datetime(),
  description:  z.string().min(1).max(500),
})

export const updateFollowUpSchema = z.object({
  done:         z.boolean().optional(),
  description:  z.string().max(500).optional(),
  followUpDate: z.string().datetime().optional(),
})

// ─── Propiedades ──────────────────────────────────────────

export const createPropertySchema = z.object({
  title:       z.string().min(2),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().max(2000).optional(),
  price:       z.number().positive(),
  area:        z.number().positive(),
  location:    z.string().min(2),
  status:      z.nativeEnum(PropertyStatus).optional(),
  images:      z.array(z.string().url()).optional(),
})

export const updatePropertySchema = createPropertySchema.partial()

// ─── Campañas ─────────────────────────────────────────────

export const createCampaignSchema = z.object({
  name:        z.string().min(2),
  platform:    z.string().min(2),
  budget:      z.number().positive().optional(),
  startDate:   z.string().datetime().optional(),
  endDate:     z.string().datetime().optional(),
  utmSource:   z.string().max(100).optional(),
  utmMedium:   z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
})

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  active: z.boolean().optional(),
})

// ─── Ventas ───────────────────────────────────────────────

export const createSaleSchema = z.object({
  leadId:     z.string().cuid(),
  propertyId: z.string().cuid(),
  amount:     z.number().positive(),
  saleDate:   z.string().datetime().optional(),
  notes:      z.string().max(1000).optional(),
})

// ─── Tracking events ─────────────────────────────────────

export const createEventSchema = z.object({
  type:        z.enum(['whatsapp_click', 'page_view', 'form_view']),
  page:        z.string().max(500).optional(),
  utmSource:   z.string().max(100).optional(),
  utmMedium:   z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  fbclid:      z.string().max(200).optional(),
  gclid:       z.string().max(200).optional(),
  device:      z.string().max(50).optional(),
})

// ─── Usuarios ────────────────────────────────────────────

export const updateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  role:     z.nativeEnum(Role).optional(),
  active:   z.boolean().optional(),
  password: z.string().min(8).optional(),
})

export const createUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.nativeEnum(Role).optional(),
})
