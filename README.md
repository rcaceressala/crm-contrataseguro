# CRM Inmobiliario — Reserva Mirador Santa Cruz

CRM con tracking de campañas completo para venta de parcelas. Stack: Next.js 14 + Prisma + PostgreSQL + NextAuth + Tailwind.

---

## Instalación local

```bash
# 1. Clonar e instalar
git clone <repo>
cd crm-inmobiliario
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# 3. Base de datos
npx prisma migrate dev --name init
npm run db:seed

# 4. Iniciar
npm run dev
```

Abre http://localhost:3000

---

## Usuarios de prueba (después del seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@mirador.cl | admin123 | ADMIN |
| maria@mirador.cl | vendedor123 | SUPERVISOR |
| juan@mirador.cl | vendedor123 | VENDEDOR |
| ana@mirador.cl | vendedor123 | VENDEDOR |

Panel admin: http://localhost:3000/admin/login

---

## Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run typecheck    # Verificar tipos TypeScript
npm run db:migrate   # Crear y aplicar migración
npm run db:seed      # Poblar con datos de prueba
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetear DB y re-seedear
```

---

## Estructura de carpetas

```
src/
├── app/
│   ├── (site)/          → Sitio público
│   ├── (admin)/         → Panel CRM
│   └── api/             → API REST
├── components/
│   ├── site/            → Componentes públicos
│   └── admin/           → Componentes CRM
├── lib/
│   ├── prisma.ts        → Cliente Prisma
│   ├── auth.ts          → NextAuth config
│   ├── validations.ts   → Schemas Zod
│   └── api-helpers.ts   → Helpers de respuesta
└── types/
    └── index.ts         → Tipos compartidos
```

---

## API Endpoints

### Públicos (sin auth)
- `POST /api/leads` — Crear lead desde formulario
- `GET  /api/properties` — Listar parcelas
- `POST /api/events` — Registrar tracking event

### Privados (requieren sesión)
- `GET/PATCH/DELETE /api/leads/[id]`
- `GET /api/leads/[id]/notes` + `POST`
- `GET /api/leads/[id]/followups` + `POST`
- `POST/GET /api/properties`
- `POST/GET /api/campaigns`
- `POST/GET /api/sales`
- `GET /api/reports/summary`
- `GET /api/reports/by-source`
- `GET /api/reports/by-campaign`
- `GET /api/export/leads` — Descarga CSV

---

## Deploy en producción

### 1. Base de datos (Railway)
```bash
# Crear proyecto en railway.app
# Add → Database → PostgreSQL
# Copiar DATABASE_URL de la pestaña Connect
```

### 2. Aplicar migraciones
```bash
DATABASE_URL="tu-url-de-railway" npx prisma migrate deploy
DATABASE_URL="tu-url-de-railway" npm run db:seed
```

### 3. Deploy en Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel
vercel

# O conectar el repo en vercel.com → Import Project
```

### 4. Variables de entorno en Vercel
Agregar en Settings → Environment Variables:
- `DATABASE_URL` — URL de Railway
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — `https://tu-dominio.vercel.app`
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número sin +

---

## Tracking UTM

Los leads capturan automáticamente:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `fbclid` (Facebook), `gclid` (Google)
- Página de entrada, referrer, dispositivo, IP

Ejemplo de URL con tracking:
```
https://tudominio.cl/parcelas?utm_source=facebook&utm_medium=cpc&utm_campaign=parcelas_mayo&utm_content=video_1&fbclid=XXX
```
