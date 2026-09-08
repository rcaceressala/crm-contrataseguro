// Uso: EMAIL=tu@correo.cl PASSWORD=tu-clave-segura node scripts/create-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const email    = process.env.EMAIL
  const password = process.env.PASSWORD
  const name     = process.env.NAME || 'Admin'

  if (!email || !password) {
    console.error('Debes definir EMAIL y PASSWORD como variables de entorno.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash, active: true, role: 'ADMIN' },
    create: { email, name, passwordHash, role: 'ADMIN', active: true },
  })

  console.log('Usuario admin listo:', user.email)
  await prisma.$disconnect()
}

main()
