'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
  _count: { leads: number; sales: number }
}

const roleConfig: Record<string, { label: string; color: string }> = {
  ADMIN:      { label: 'Admin',      color: 'bg-green-100 text-green-800' },
  SUPERVISOR: { label: 'Supervisor', color: 'bg-blue-100 text-blue-800' },
  VENDEDOR:   { label: 'Vendedor',   color: 'bg-orange-100 text-orange-800' },
}

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/40 focus:border-[#1a3a2a]'
const labelCls = 'block text-xs font-medium text-gray-700 mb-1'

export default function UsuariosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // ── nuevo usuario ──────────────────────────────────────────
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '', role: 'VENDEDOR' })
  const [newErr, setNewErr] = useState('')
  const [newLoading, setNewLoading] = useState(false)

  // ── cambiar contraseña ─────────────────────────────────────
  const [pwdUser, setPwdUser] = useState<User | null>(null)
  const [pwd, setPwd] = useState({ password: '', confirm: '' })
  const [pwdErr, setPwdErr] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json().then((d) => d.data ?? d))
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setNewLoading(true)
    setNewErr('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })
      const data = await res.json()
      if (!res.ok) { setNewErr(data.error ?? 'Error al crear usuario'); return }
      setShowNew(false)
      setNewForm({ name: '', email: '', password: '', role: 'VENDEDOR' })
      fetchUsers()
    } finally {
      setNewLoading(false)
    }
  }

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault()
    if (pwd.password !== pwd.confirm) { setPwdErr('Las contraseñas no coinciden'); return }
    setPwdLoading(true)
    setPwdErr('')
    try {
      const res = await fetch(`/api/users/${pwdUser!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd.password }),
      })
      const data = await res.json()
      if (!res.ok) { setPwdErr(data.error ?? 'Error al cambiar contraseña'); return }
      setPwdUser(null)
      setPwd({ password: '', confirm: '' })
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Cargando…' : `${users.length} usuarios registrados`}
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setNewErr('') }}
          className="flex items-center gap-1.5 bg-[#1a3a2a] hover:bg-[#24503a] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Usuario', 'Email', 'Rol', 'Leads asignados', 'Ventas', 'Estado', 'Creado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const rc = roleConfig[u.role] ?? roleConfig.VENDEDOR
              const initials = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1a3a2a]/10 rounded-full flex items-center justify-center text-xs font-semibold text-[#1a3a2a] flex-shrink-0">
                        {initials}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.color}`}>{rc.label}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{u._count?.leads ?? 0}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{u._count?.sales ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setPwdUser(u); setPwd({ password: '', confirm: '' }); setPwdErr('') }}
                      className="text-xs px-2.5 py-1 rounded-md border border-[#1a3a2a]/30 text-[#1a3a2a] hover:bg-[#1a3a2a] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Cambiar contraseña
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modal: Nuevo usuario ─────────────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Nuevo usuario</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Nombre completo"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  required
                  type="email"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contraseña</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={newForm.password}
                  onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Rol</label>
                <select
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  className={inputCls}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="VENDEDOR">Vendedor</option>
                </select>
              </div>
              {newErr && <p className="text-xs text-red-600">{newErr}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={newLoading}
                  className="flex-1 bg-[#1a3a2a] hover:bg-[#24503a] disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {newLoading ? 'Guardando…' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Cambiar contraseña ────────────────────────── */}
      {pwdUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Cambiar contraseña</h2>
            <p className="text-xs text-gray-500 mb-4">{pwdUser.name}</p>
            <form onSubmit={handleChangePwd} className="space-y-4">
              <div>
                <label className={labelCls}>Nueva contraseña</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={pwd.password}
                  onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Confirmar contraseña</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder="Repetir contraseña"
                  className={inputCls}
                />
              </div>
              {pwdErr && <p className="text-xs text-red-600">{pwdErr}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPwdUser(null)}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="flex-1 bg-[#1a3a2a] hover:bg-[#24503a] disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  {pwdLoading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
