import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { KanbanBoard } from '@/components/admin/KanbanBoard'

export default async function KanbanPage() {
  const session = await auth()
  const where: any = {}
  if (session?.user.role === 'ASESOR') where.assignedUserId = session.user.id

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, phone: true, status: true, source: true, createdAt: true,
      assignedTo: { select: { name: true } },
    },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kanban</h1>
          <p className="text-sm text-gray-500 mt-0.5">Arrastra los leads entre columnas para cambiar su estado</p>
        </div>
        <a href="/admin/leads" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Vista tabla →
        </a>
      </div>
      <KanbanBoard initialLeads={leads as any} />
    </div>
  )
}
