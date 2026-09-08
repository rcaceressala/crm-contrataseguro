import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { UTMCapture } from '@/components/site/UTMCapture'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'

export const metadata: Metadata = {
  title: { default: 'Reserva Mirador Santa Cruz', template: '%s | Reserva Mirador Santa Cruz' },
  description: 'Parcelas desde 5.000 m² en Isla Yáquil, Santa Cruz. Vista al valle, financiamiento directo. Desde $29.000.990.',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <UTMCapture />
      </Suspense>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a3a2a] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-[#1a3a2a] text-base">Mirador</div>
              <div className="text-xs text-gray-500 font-normal">Santa Cruz</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/"           className="text-gray-600 hover:text-[#1a3a2a] text-sm font-medium transition-colors">Inicio</Link>
            <Link href="/parcelas"   className="text-gray-600 hover:text-[#1a3a2a] text-sm font-medium transition-colors">Parcelas</Link>
            <Link href="/#beneficios" className="text-gray-600 hover:text-[#1a3a2a] text-sm font-medium transition-colors">Beneficios</Link>
            <Link href="/#faq"       className="text-gray-600 hover:text-[#1a3a2a] text-sm font-medium transition-colors">FAQ</Link>
            <Link href="/#contacto"  className="bg-[#1a3a2a] hover:bg-[#2d5a3f] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              Contactar
            </Link>
          </div>

          <Link href="/#contacto" className="md:hidden bg-[#1a3a2a] text-white text-sm font-semibold px-4 py-2 rounded-lg">
            Contactar
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-[#1a3a2a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-bold text-xl mb-3">Reserva Mirador Santa Cruz</div>
            <p className="text-white/70 text-sm leading-relaxed">
              Proyecto inmobiliario en Isla Yáquil, Santa Cruz, VI Región. Parcelas desde 5.000 m² con vista al Valle de Colchagua.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-[#b8860b]">Contacto</div>
            <div className="text-white/70 text-sm space-y-2">
              <div>📞 +56 9 9042 5063</div>
              <div>✉️ contacto@multiparcelaschile.cl</div>
              <div>🌐 multiparcelaschile.cl</div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3 text-[#b8860b]">Navegación</div>
            <div className="text-white/70 text-sm space-y-2">
              <div><Link href="/parcelas"   className="hover:text-white transition-colors">Ver parcelas</Link></div>
              <div><Link href="/#contacto"  className="hover:text-white transition-colors">Contacto</Link></div>
              <div><Link href="/#faq"       className="hover:text-white transition-colors">Preguntas frecuentes</Link></div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} Reserva Mirador Santa Cruz · Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}
