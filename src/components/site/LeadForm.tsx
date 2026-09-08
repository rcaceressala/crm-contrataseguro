// src/components/site/LeadForm.tsx
//
// Formulario conectado a POST /api/leads (endpoint que ya tienes segun tu README).
// Captura UTM desde la URL automaticamente - no depende de que el usuario haga nada.
//
// Body alineado a createLeadSchema (src/lib/validations.ts): utm_* y
// landing_page van en snake_case, y el campo libre de texto es `message`.

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type LeadFormProps = {
  propertyId?: string | null;   // se precarga si vienen de un lote especifico del plano maestro
  proyectoNombre?: string;      // para el copy del selector "que te interesa"
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  interest: string;
};

const INITIAL: FormState = {
  name: '',
  phone: '',
  email: '',
  interest: 'Agendar visita guiada',
};

export function LeadForm({ propertyId, proyectoNombre }: LeadFormProps) {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Captura UTM + fbclid/gclid + pagina de entrada + referrer una sola vez al montar.
  const [tracking, setTracking] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setTracking({
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      utm_term: searchParams.get('utm_term'),
      fbclid: searchParams.get('fbclid'),
      gclid: searchParams.get('gclid'),
      landing_page: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.interest,
          propertyId: propertyId ?? null,
          ...tracking,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'No se pudo enviar el formulario');
      }

      setStatus('success');
      setForm(INITIAL);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-[#B98A3D] bg-[#B98A3D]/10 px-6 py-8 text-center rounded-sm">
        <p className="font-serif text-xl mb-2">Solicitud recibida</p>
        <p className="text-sm opacity-75">
          Un asesor {proyectoNombre ? `de ${proyectoNombre} ` : ''}te contactará en menos de 2 horas hábiles.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre completo">
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tu nombre"
          className="w-full px-4 py-3 border border-[#1F3626]/30 bg-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1F3626]"
        />
      </Field>
      <Field label="Teléfono / WhatsApp">
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+56 9 ..."
          className="w-full px-4 py-3 border border-[#1F3626]/30 bg-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1F3626]"
        />
      </Field>
      <Field label="Correo">
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="tucorreo@ejemplo.cl"
          className="w-full px-4 py-3 border border-[#1F3626]/30 bg-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1F3626]"
        />
      </Field>
      <Field label="Qué te interesa">
        <select
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
          className="w-full px-4 py-3 border border-[#1F3626]/30 bg-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1F3626]"
        >
          <option>Agendar visita guiada</option>
          <option>Conocer financiamiento</option>
          <option>Cotizar un lote específico</option>
        </select>
      </Field>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg ?? 'Ocurrió un error, intenta de nuevo.'}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-[#1F3626] text-[#F3EEE1] font-semibold text-sm rounded-sm hover:bg-[#2E4A38] transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'Enviando...' : 'Solicitar información'}
      </button>

      <p className="text-xs opacity-60">
        Al enviar aceptas ser contactado por un asesor. El origen de tu campaña
        se registra automáticamente para tu ejecutivo asignado.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-wide opacity-70 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
