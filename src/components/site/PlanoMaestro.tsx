// src/components/site/PlanoMaestro.tsx
//
// Plano maestro interactivo. Recibe las parcelas ya cargadas desde el server
// component (page.tsx) via prisma — este componente NO hace fetch, solo pinta.
//
// Campos alineados a tu prisma/schema.prisma real (model Property):
//   id, title, area, price, status ('DISPONIBLE'|'RESERVADA'|'VENDIDA')
// `currency` y `orientation` no existen en tu schema — quedan opcionales con
// default fijo ('UF') y sin valor, respectivamente.

'use client';

import { useState } from 'react';

export type PlanoProperty = {
  id: string;
  title: string;
  area: number;
  price: number;
  currency?: string;       // 'UF' | 'CLP' — no existe en el schema, usa default fijo
  status: 'DISPONIBLE' | 'RESERVADA' | 'VENDIDA';
  orientation?: string | null;
};

const STATUS_LABEL: Record<PlanoProperty['status'], string> = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservado',
  VENDIDA: 'Vendido',
};

const STATUS_STYLE: Record<PlanoProperty['status'], string> = {
  DISPONIBLE: 'bg-[#DCC28E]/20 border-[#DCC28E]/60 text-[#DCC28E] hover:bg-[#DCC28E] hover:text-[#1F3626]',
  RESERVADA: 'bg-[#3E6E8E]/25 border-[#3E6E8E]/60 text-[#8fb9d1]',
  VENDIDA: 'bg-white/5 border-white/10 text-white/30 cursor-default',
};

export function PlanoMaestro({
  properties,
  onSelectLote,
}: {
  properties: PlanoProperty[];
  onSelectLote?: (property: PlanoProperty) => void; // ej: precargar el lote elegido en el formulario
}) {
  const [hovered, setHovered] = useState<PlanoProperty | null>(null);

  const disponibles = properties.filter((p) => p.status === 'DISPONIBLE').length;
  const reservadas = properties.filter((p) => p.status === 'RESERVADA').length;
  const vendidas = properties.filter((p) => p.status === 'VENDIDA').length;

  return (
    <div className="bg-[#1F3626] text-[#F3EEE1] px-6 py-10 rounded-sm">
      <div className="flex gap-6 mb-8 flex-wrap font-mono text-xs">
        <span className="flex items-center gap-2">
          <i className="inline-block w-2.5 h-2.5 rounded-full bg-[#DCC28E]" />
          Disponible ({disponibles})
        </span>
        <span className="flex items-center gap-2">
          <i className="inline-block w-2.5 h-2.5 rounded-full bg-[#3E6E8E]" />
          Reservado ({reservadas})
        </span>
        <span className="flex items-center gap-2">
          <i className="inline-block w-2.5 h-2.5 rounded-full bg-white/25" />
          Vendido ({vendidas})
        </span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-[5px] bg-white/[0.03] border border-white/10 p-[5px]">
        {properties.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={p.status === 'VENDIDA'}
            onMouseEnter={() => setHovered(p)}
            onFocus={() => setHovered(p)}
            onClick={() => p.status !== 'VENDIDA' && onSelectLote?.(p)}
            className={`aspect-square flex items-center justify-center font-mono text-[10px] border transition-transform hover:scale-110 hover:z-10 ${STATUS_STYLE[p.status]}`}
          >
            {p.status === 'VENDIDA' ? '·' : `L-${p.title}`}
          </button>
        ))}
      </div>

      <div className="mt-7 border border-white/10 px-5 py-4 min-h-[24px] flex flex-wrap justify-between gap-4 font-mono text-[13px]">
        {hovered ? (
          <>
            <span>
              <b className="font-sans text-[15px] font-semibold">Lote {hovered.title}</b>
              {' · '}
              {hovered.area.toLocaleString('es-CL')} m²
              {hovered.orientation ? ` · Orientación ${hovered.orientation}` : ''}
            </span>
            <span>
              {STATUS_LABEL[hovered.status]}
              {hovered.status !== 'VENDIDA' &&
                ` · ${hovered.currency ?? 'UF'} ${hovered.price.toLocaleString('es-CL')}`}
            </span>
          </>
        ) : (
          <span className="opacity-45">Pasa el cursor sobre un lote para ver su ficha →</span>
        )}
      </div>
    </div>
  );
}
