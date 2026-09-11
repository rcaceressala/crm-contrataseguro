import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Fondo con overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80')" }}
      />
      <div className="absolute inset-0 bg-[#1a3a2a]/75" />

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <span className="inline-block bg-[#b8860b]/90 text-white text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
          Contrataseguro · Isla Yáquil, VI Región
        </span>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Tu parcela en el<br />
          <span className="text-[#b8860b]">corazón de Colchagua</span>
        </h1>

        <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
          657 lotes desde 5.000 m² con vista panorámica al valle, acceso pavimentado,
          servicios básicos y financiamiento directo. Desde $29.000.990.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/parcelas"
            className="bg-[#b8860b] hover:bg-[#d4a017] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Ver parcelas disponibles
          </Link>
          <a
            href="#contacto"
            className="border-2 border-white/70 hover:border-white text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Solicitar información
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '657', label: 'Lotes disponibles' },
            { value: '5.000m²', label: 'Superficie mínima' },
            { value: '12', label: 'Cuotas sin interés' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-[#b8860b]">{stat.value}</div>
              <div className="text-xs text-white/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
