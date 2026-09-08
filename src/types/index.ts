import type { User, Lead, LeadNote, FollowUp, Property, Campaign, Sale } from '@prisma/client'

// Re-exportar enums para uso en frontend
export { Role, LeadStatus, LeadSource, PropertyStatus } from '@prisma/client'

// Tipos extendidos con relaciones
export type LeadWithRelations = Lead & {
  assignedTo?: Pick<User, 'id' | 'name' | 'email'> | null
  property?: Pick<Property, 'id' | 'title' | 'slug'> | null
  campaign?: Pick<Campaign, 'id' | 'name' | 'platform'> | null
  notes?: LeadNote[]
  followUps?: FollowUp[]
  sale?: Sale | null
}

export type UserPublic = Pick<User, 'id' | 'name' | 'email' | 'role'>

// Filtros para la tabla de leads
export interface LeadFilters {
  status?: string
  source?: string
  assignedUserId?: string
  campaignId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Datos UTM capturados en el frontend
export interface UTMData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  landing_page?: string
  referrer?: string
  device?: string
  captured_at?: string
}

// Payload para crear lead desde formulario público
export interface CreateLeadPayload {
  name: string
  phone: string
  email?: string
  message?: string
  propertyId?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  landing_page?: string
  referrer?: string
  device?: string
}

// KPIs del dashboard
export interface DashboardSummary {
  totalLeads: number
  leadsToday: number
  leadsThisMonth: number
  totalSales: number
  conversionRate: number
  avgCPL: number
  pendingFollowUps: number
}

// Reporte por fuente
export interface LeadBySource {
  source: string
  count: number
  percentage: number
  sales: number
}

// Reporte por campaña
export interface CampaignReport {
  id: string
  name: string
  platform: string
  budget: number | null
  leads: number
  sales: number
  cpl: number | null
  cpa: number | null
}
