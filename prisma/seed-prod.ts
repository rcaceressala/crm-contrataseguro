// prisma/seed-prod.ts
//
// Script de seed para producción. A diferencia de prisma/seed.ts, NO borra
// ni reinicia datos existentes: solo crea (o actualiza la contraseña de) el
// usuario ADMIN a partir de SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
//
// Uso: npm run db:seed:prod

import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('Faltan SEED_ADMIN_EMAIL y/o SEED_ADMIN_PASSWORD en el entorno.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash, role: Role.ADMIN, active: true },
    create: {
      name: 'Administrador',
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log(`✓ Usuario ADMIN listo: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed-prod:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
