/** Los dibujos de la landing: el logo y las tres maquetas del encabezado
 *  (el catálogo, el mensaje que llega al WhatsApp y el ticket impreso).
 *
 *  Son maquetas dibujadas con CSS y no capturas de pantalla: una captura
 *  envejece con cada cambio de la app y con cada cambio de precio del cliente
 *  que se haya usado de ejemplo, y en un teléfono se lee borrosa. Acá lo que
 *  se muestra es la FORMA del producto —catálogo, mensaje, ticket— que es lo
 *  que hay que entender antes de escribir. La prueba de que existe de verdad
 *  es el catálogo de Piedro Shop, que está linkeado más abajo y es navegable. */

export function Logo({ tamano = 30 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 60 60" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M15 2h30v32H15V2Z" fill="#c67139" />
      <rect x="20" y="9" width="20" height="4" rx="2" fill="#fff" />
      <rect x="20" y="18" width="13" height="4" rx="2" fill="#fff" opacity="0.6" />
      <path d="M15 36.4h30" stroke="#201e1d" strokeWidth="3.6" strokeDasharray="6 6" strokeLinecap="round" />
      <path
        d="M8 45a5 5 0 0 1 5-5h34a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5v-8Z"
        fill="#201e1d"
      />
      <circle cx="16" cy="49" r="3" fill="#7a8a5e" />
    </svg>
  );
}

export function Tilde() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--l-oliva-600)"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconoImpresora({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

/** El catálogo, en un teléfono. */
function MaquetaCatalogo() {
  const filas = [
    { nombre: 'Roll California', detalle: '9 piezas', precio: '$8.900' },
    { nombre: 'Sashimi de salmón', detalle: '6 cortes', precio: '$15.900' },
    { nombre: 'Roll de langostino', detalle: 'Sin stock hoy', precio: '' },
  ];

  return (
    <div
      className="relative mt-7 rounded-[34px] p-2.5"
      style={{ background: '#1f1d1c', boxShadow: 'var(--l-sombra-lg)' }}
    >
      <div className="overflow-hidden rounded-[26px] bg-white">
        <div className="px-4 pt-4 pb-3.5 text-white" style={{ background: 'var(--l-terracota-700)' }}>
          <div className="titulo text-[17px]">Tu catálogo</div>
          <div className="mt-0.5 text-[11px] opacity-85">Abierto · Envío y retiro</div>
        </div>
        <div className="px-4 pt-3.5 pb-4" style={{ color: '#1f1d1c' }}>
          <div className="mb-3.5 flex flex-wrap gap-1.5">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ background: 'var(--l-terracota-200)', color: 'var(--l-terracota-800)' }}
            >
              Rolls
            </span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: '#f0eee9' }}>
              Sashimi
            </span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: '#f0eee9' }}>
              Bebidas
            </span>
          </div>

          <div className="grid gap-2.5">
            {filas.map((f) => (
              <div
                key={f.nombre}
                className={`flex min-w-0 items-center gap-2.5 ${f.precio ? '' : 'opacity-45'}`}
              >
                <span className="h-[38px] w-[38px] shrink-0 rounded-[11px]" style={{ background: '#e8e3da' }} />
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block truncate text-[13px] font-semibold">{f.nombre}</span>
                  <span className="block text-[12px]" style={{ color: '#807a70' }}>
                    {f.detalle}
                  </span>
                </span>
                {f.precio && <span className="shrink-0 whitespace-nowrap text-[13px] font-bold">{f.precio}</span>}
              </div>
            ))}
          </div>

          <div
            className="titulo mt-4 rounded-full py-2.5 text-center text-[13px] text-white"
            style={{ background: 'var(--l-whatsapp)' }}
          >
            Enviar pedido por WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}

/** El mensaje como llega al WhatsApp del local, y el botón de imprimir. */
function MaquetaMensaje() {
  return (
    <div className="rounded-[20px] bg-white p-4" style={{ boxShadow: 'var(--l-sombra-lg)' }}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="inline-block h-[30px] w-[30px] rounded-full" style={{ background: 'var(--l-oliva-500)' }} />
        <span className="text-[13px] font-bold">Milena · pedido nuevo</span>
      </div>
      <div
        className="px-3.5 py-3 text-[12.5px] leading-[1.5]"
        style={{ background: 'var(--l-oliva-100)', borderRadius: '14px 14px 14px 4px', color: '#1f1d1c' }}
      >
        <strong>Pedido #184 · Delivery</strong>
        <br />
        2 × Roll California
        <br />
        1 × Sashimi de salmón
        <br />
        Zona 2 · Efectivo
        <br />
        <strong>Total $33.700</strong>
      </div>
      <div
        className="titulo mt-3 flex w-max items-center gap-2.5 rounded-full px-4 py-2.5 text-[13px] text-white"
        style={{ background: 'var(--l-terracota)' }}
      >
        <IconoImpresora />
        Cobrar e imprimir
      </div>
    </div>
  );
}

/** El ticket que sale de la térmica. */
function MaquetaTicket() {
  const renglones = [
    ['Descuento', '−$3.370'],
    ['Envío Z2', '$3.000'],
  ];

  return (
    <div
      className="landing-mono w-[88%] justify-self-end rounded-[14px] bg-white px-4 py-4 text-[11.5px] text-[#111]"
      style={{ boxShadow: 'var(--l-sombra-lg)', transform: 'rotate(-3deg)' }}
    >
      <div className="text-center font-medium tracking-[0.2em]">PEDIDO</div>
      <Puntos />
      <div className="flex justify-between">
        <span>#184 Delivery</span>
        <span>21:14</span>
      </div>
      <Puntos />
      <div>2 × Roll California</div>
      <div>1 × Sashimi salmón</div>
      <Puntos />
      {renglones.map(([izq, der]) => (
        <div key={izq} className="flex justify-between">
          <span>{izq}</span>
          <span>{der}</span>
        </div>
      ))}
      <Puntos />
      <div className="flex justify-between font-medium">
        <span>TOTAL</span>
        <span>$33.330</span>
      </div>
    </div>
  );
}

function Puntos() {
  return <div className="my-2.5 border-t border-dashed" style={{ borderColor: '#aaa' }} aria-hidden="true" />;
}

/** El collage del encabezado: catálogo, mensaje y ticket, sobre la mancha. */
export function MaquetaEncabezado() {
  return (
    <div className="relative grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] items-start gap-5">
      <div
        aria-hidden="true"
        className="absolute -left-4 -top-6 bottom-10 -right-10"
        style={{ borderRadius: '50% 46% 54% 48%', background: 'var(--l-terracota-200)' }}
      />
      <div className="relative z-[1]">
        <MaquetaCatalogo />
      </div>
      <div className="relative z-[1] grid gap-5">
        <MaquetaMensaje />
        <MaquetaTicket />
      </div>
    </div>
  );
}
