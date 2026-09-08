import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reserva Mirador Santa Cruz',
  description: 'Proyecto de parcelas en Isla Yáquil, Santa Cruz.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
