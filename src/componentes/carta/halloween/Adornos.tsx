/** Los dibujos de la plantilla de Halloween: murciélagos, telaraña, araña y
 *  calabaza.
 *
 *  Son SVG inline y no imágenes: son cuatro formas planas de un par de
 *  cientos de bytes cada una, así que un archivo por dibujo serían cuatro
 *  requests para algo que pesa menos que la petición. Inline además heredan
 *  `currentColor`, que es lo que les deja tomar el violeta o el naranja de
 *  la plantilla sin una copia por color.
 *
 *  Todos llevan `aria-hidden`: no dicen nada que el texto no diga ya. */

export function Murcielago({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true" fill="currentColor">
      {/* las alas van en su propio grupo para poder aletear sin mover el cuerpo */}
      <g className="h-aletea">
        <path d="M32 10c-4-7-11-9-17-7 3 2 4 5 3 8-3-2-7-2-10 1 5 0 8 3 9 7 4-4 10-6 15-5z" />
        <path d="M32 10c4-7 11-9 17-7-3 2-4 5-3 8 3-2 7-2 10 1-5 0-8 3-9 7-4-4-10-6-15-5z" />
      </g>
      <ellipse cx="32" cy="14" rx="4" ry="6" />
      <path d="M29 8l-2-4 4 2zM35 8l2-4-4 2z" />
    </svg>
  );
}

export function Telarana({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M0 0 L0 100M0 0 L100 0M0 0 L70 70M0 0 L30 92M0 0 L92 30" />
      <path d="M22 0a22 22 0 0 1-22 22M42 0a42 42 0 0 1-42 42M64 0a64 64 0 0 1-64 64M86 0a86 86 0 0 1-86 86" />
    </svg>
  );
}

/** La araña que baja del hilo. El hilo es parte del dibujo para que colgar
 *  sea una sola animación sobre el grupo entero. */
export function Arana({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 74" className={className} aria-hidden="true">
      <line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" strokeWidth="1.5" />
      <g fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M11 50 2 43M11 57 2 58M29 50l9-7M29 57l9 1M13 62l-6 9M27 62l6 9" fill="none" />
        <circle cx="20" cy="49" r="6" />
        <circle cx="20" cy="59" r="9" />
      </g>
      <g fill="#fff">
        <circle cx="17.5" cy="48" r="1.6" />
        <circle cx="22.5" cy="48" r="1.6" />
      </g>
    </svg>
  );
}

export function Calabaza({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden="true">
      <path d="M32 12c-3-6-9-9-13-8 2 3 3 6 2 9z" fill="#4e8f76" />
      <path
        d="M32 12c14 0 26 9 26 24S46 58 32 58 6 51 6 36 18 12 32 12z"
        fill="currentColor"
      />
      <path
        d="M19 30l9 5-9 5zM45 30l-9 5 9 5zM20 46c4 4 8 5 12 5s8-1 12-5c-4 1-8 1-12 1s-8 0-12-1z"
        fill="#3b1f5c"
      />
      <path d="M30 11h4v48h-4z" fill="#000" opacity=".07" />
    </svg>
  );
}

/** La bandada del encabezado. Cada murciélago arranca en otro momento y
 *  tarda distinto, porque tres bichos sincronizados leen como un GIF. */
export function Bandada() {
  const vuelos = [
    { top: '12%', escala: 0.7, retraso: '0s', duracion: '26s', opacidad: 0.5 },
    { top: '38%', escala: 1, retraso: '-9s', duracion: '34s', opacidad: 0.75 },
    { top: '66%', escala: 0.5, retraso: '-18s', duracion: '22s', opacidad: 0.4 },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {vuelos.map((v, i) => (
        <span
          key={i}
          className="h-vuela absolute left-0 block w-12 text-[color:var(--h-violeta)]"
          style={{
            top: v.top,
            opacity: v.opacidad,
            animationDelay: v.retraso,
            animationDuration: v.duracion,
          }}
        >
          <Murcielago className={`w-full ${v.escala < 1 ? 'scale-75' : ''}`} />
        </span>
      ))}
    </div>
  );
}
