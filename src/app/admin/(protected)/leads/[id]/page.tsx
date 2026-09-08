import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NoteForm } from '@/components/admin/NoteForm'
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect'
import { FollowUpForm } from '@/components/admin/FollowUpForm'

const statusLabels: Record<string, string> = {
  NUEVO:'Nuevo', CONTACTADO:'Contactado', INTERESADO:'Interesado',
  VISITA_AGENDADA:'Visita agendada', RESERVA:'Reserva', VENDIDO:'Vendido', PERDIDO:'Perdido',
}
const sourceLabels: Record<string, string> = {
  FACEBOOK_ADS:'Facebook Ads', INSTAGRAM:'Instagram', GOOGLE_ADS:'Google Ads',
  TIKTOK:'TikTok', WHATSAPP:'WhatsApp', ORGANICO:'Orgánico', REFERIDO:'Referido', MANUAL:'Manual',
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()

  const [lead, users] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        property:   { select: { id: true, title: true, price: true } },
        campaign:   { select: { id: true, name: true, platform: true } },
        notes: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          include: { user: { select: { name: true } } },
          orderBy:  { followUpDate: 'asc' },
        },
        sale: true,
      },
    }),
    prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  if (!lead) notFound()

  const price = lead.property
    ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(lead.property.price)
    : null

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <a href="/admin/leads" className="text-sm text-gray-400 hover:text-gray-600">← Leads</a>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{lead.name}</h1>
          <p className="text-sm text-gray-500">{lead.phone} {lead.email && `· ${lead.email}`}</p>
        </div>
        <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} users={users} currentAssignedId={lead.assignedUserId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda — datos */}
        <div className="space-y-5">
          {/* Info básica */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Información del lead</h2>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Estado',   value: statusLabels[lead.status] ?? lead.status },
                { label: 'Fuente',   value: sourceLabels[lead.source] ?? lead.source },
                { label: 'Teléfono', value: lead.phone },
                { label: 'Email',    value: lead.email ?? '—' },
                { label: 'Vendedor', value: lead.assignedTo?.name ?? 'Sin asignar' },
                { label: 'Parcela',  value: lead.property ? `${lead.property.title} · ${price}` : '—' },
                { label: 'Campaña',  value: lead.campaign?.name ?? '—' },
                { label: 'Dispositivo', value: lead.device ?? '—' },
                { label: 'Creado',   value: new Date(lead.createdAt).toLocaleString('es-CL') },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-gray-400 flex-shrink-0">{label}</dt>
                  <dd className="text-gray-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {lead.message && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-2">Mensaje</div>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{lead.message}</p>
              </div>
            )}
          </div>

          {/* UTM Data */}
          {(lead.utmSource || lead.utmCampaign || lead.fbclid || lead.gclid) && (
            <details className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="px-5 py-3 text-sm font-semibold text-gray-700 cursor-pointer flex items-center justify-between">
                Datos de tracking UTM
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 border-t border-gray-100">
                <dl className="mt-3 space-y-2 text-xs font-mono">
                  {[
                    ['utm_source',   lead.utmSource],
                    ['utm_medium',   lead.utmMedium],
                    ['utm_campaign', lead.utmCampaign],
                    ['utm_content',  lead.utmContent],
                    ['utm_term',     lead.utmTerm],
                    ['fbclid',       lead.fbclid],
                    ['gclid',        lead.gclid],
                    ['landing_page', lead.landingPage],
                    ['referrer',     lead.referrer],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k as string} className="flex gap-2">
                      <dt className="text-gray-400 flex-shrink-0 w-28">{k}</dt>
                      <dd className="text-gray-700 truncate">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          )}
        </div>

        {/* Columna derecha — actividad */}
        <div className="lg:col-span-2 space-y-5">
          {/* Seguimientos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Seguimientos</h2>
            {lead.followUps.length > 0 && (
              <div className="space-y-2 mb-4">
                {lead.followUps.map((fu) => (
                  <div key={fu.id} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${fu.done ? 'bg-gray-50 opacity-60' : 'bg-blue-50'}`}>
                    <span className="text-lg flex-shrink-0">{fu.done ? '✅' : '📅'}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{fu.description}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(fu.followUpDate).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
                        {' · '}{fu.user.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <FollowUpForm leadId={lead.id} />
          </div>

          {/* Notas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Notas y actividad</h2>
            <NoteForm leadId={lead.id} />
            {lead.notes.length > 0 && (
              <div className="mt-4 space-y-3">
                {lead.notes.map((note) => (
                  <div key={note.id} className="border-l-2 border-[#1a3a2a]/20 pl-4 py-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{note.note}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {note.user.name} · {new Date(note.createdAt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {lead.notes.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin notas aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
