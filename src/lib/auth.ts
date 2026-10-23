import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[login] faltan email o contraseña')
          return null
        }

        // Normaliza el email: sin espacios y en minúsculas
        const email    = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          console.warn('[login] usuario no encontrado:', email)
          return null
        }
        if (!user.active) {
          console.warn('[login] usuario inactivo:', email)
          return null
        }

        const valid = await bcrypt.compare(password, user.passwordHash)

        if (!valid) {
          // Nunca se registra la contraseña, solo datos para diagnosticar
          console.warn('[login] contraseña no coincide para', email,
            '| largo recibido:', password.length,
            '| hash:', user.passwordHash.slice(0, 7), 'largo', user.passwordHash.length)
          return null
        }

        console.info('[login] acceso correcto:', email)
        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role as Role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error:  '/admin/login',
  },
  session: { strategy: 'jwt' },
})

// Helpers de autorización
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) return null
  return session.user
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth()
  if (!user) return null
  if (!roles.includes(user.role as Role)) return null
  return user
}
