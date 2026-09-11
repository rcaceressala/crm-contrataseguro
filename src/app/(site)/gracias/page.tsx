import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¡Mensaje enviado!',
  description: 'Recibimos tu consulta. Te contactaremos pronto.',
}

export default function GraciasPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f5f5f0]">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm">
          {/* Ícono */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#1a3a2a] mb-4">
            ¡Gracias por contactarnos!
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Recibimos tu consulta. Un ejecutivo de ventas se pondrá en contacto contigo
            <strong className="text-[#1a3a2a]"> dentro de las próximas 24 horas</strong> para
            entregarte toda la información y coordinar tu visita al proyecto.
          </p>

          {/* Próximos pasos */}
          <div className="bg-[#f5f5f0] rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-[#1a3a2a] mb-4">Próximos pasos</h2>
            <div className="space-y-3">
              {[
                { num: '1', text: 'Nuestro equipo revisará tu consulta' },
                { num: '2', text: 'Te llamaremos o escribiremos por WhatsApp' },
                { num: '3', text: 'Coordinamos tu visita sin compromiso' },
                { num: '4', text: 'Conoces tu parcela en persona' },
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#1a3a2a] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <span className="text-gray-600 text-sm">{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 bg-[#1a3a2a] hover:bg-[#2d5a3f] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
