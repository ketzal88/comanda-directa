/** El caso de Piedro Shop: el catálogo que está funcionando hoy.
 *
 *  Va con link y no con capturas, y ese es el punto: cualquiera puede abrirlo,
 *  cargar algo y llegar hasta el botón de WhatsApp. Una captura demuestra que
 *  existió una pantalla; un link demuestra que el sistema está andando.
 *
 *  Lo que se dice acá son datos verificables del catálogo (cuántos productos,
 *  cuántas categorías, que hay talles y zonas de envío). No hay números de
 *  venta: no los tenemos, y un "aumentó un 40%" inventado se cae en la primera
 *  pregunta de la reunión. */

const CATALOGO = '/piedro-shop';

/** Fotos del propio catálogo, servidas desde el mismo Storage que las sirve
 *  allá. Si el bucket se mueve, se cambian acá y en `items.foto_url`. */
const FOTOS = 'https://qqqfxlbdjsajvbumyafq.supabase.co/storage/v1/object/public/fotos/halloween';

const MUESTRA = [
  { id: 'set-brujita-rosa', nombre: 'Set Brujita Chispeante Rosa', precio: '$8.500' },
  { id: 'vampira-nina', nombre: 'Disfraz Vampira Niña', precio: 'desde $29.100' },
  { id: 'balde-caramelera', nombre: 'Balde Caramelera', precio: '$3.300' },
];

const DETALLES = [
  '81 productos en 6 categorías, con foto',
  'Talles por producto, que viajan en el pedido',
  'Envío por zona: sin cargo, con precio o a convenir',
];

export function CasoPiedroShop() {
  return (
    <section id="muestra" className="mx-auto max-w-6xl px-4 pb-11 sm:px-8 sm:pb-16">
      <div
        className="grid items-center gap-8 rounded-[28px] p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12"
        style={{ background: 'var(--l-superficie)' }}
      >
        <div>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{ background: 'var(--l-oliva-200)', color: 'var(--l-oliva-800)' }}
          >
            Funcionando hoy
          </div>

          <h2 className="m-0 mb-4 max-w-[20ch] text-[clamp(28px,4.6vw,40px)] leading-[1.08]">
            Piedro Shop vende su temporada con esto.
          </h2>

          <p className="m-0 mb-5 max-w-[50ch] text-[17px] sm:text-[18px]">
            Un catálogo de disfraces y cotillón que se arma desde el teléfono y llega al WhatsApp
            del local con los talles y la zona de envío ya elegidos. No es una demo: es el link que
            reparten a sus clientes.
          </p>

          <ul className="m-0 mb-7 grid list-none gap-2.5 p-0">
            {DETALLES.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-[15px] font-semibold">
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                  style={{ background: 'var(--l-terracota)' }}
                />
                {d}
              </li>
            ))}
          </ul>

          <a
            href={CATALOGO}
            className="landing-boton-secundario inline-flex items-center gap-2 px-6 py-3.5 text-[16px] no-underline"
            style={{ color: 'var(--l-tinta)' }}
          >
            Ver el catálogo de Piedro Shop →
          </a>
        </div>

        {/* El teléfono con tres productos reales del catálogo */}
        <div
          className="relative mx-auto w-full max-w-[300px] rounded-[34px] p-2.5"
          style={{ background: '#1f1d1c', boxShadow: 'var(--l-sombra-lg)' }}
        >
          <div className="overflow-hidden rounded-[26px]" style={{ background: '#fbf6ee' }}>
            <div className="px-4 pt-4 pb-3 text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#6a5a86' }}>
                Se viene
              </div>
              <div className="text-[26px] font-black leading-none" style={{ color: '#f28a2e' }}>
                HALLOWEEN
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 px-3 pb-4">
              {MUESTRA.map((p, i) => (
                <div
                  key={p.id}
                  className={`overflow-hidden rounded-[12px] bg-white p-1.5 ${i === 2 ? 'col-span-2' : ''}`}
                  style={{ boxShadow: '0 4px 12px rgb(42 27 69 / 0.1)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${FOTOS}/${p.id}.webp`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={`w-full rounded-[8px] object-contain ${i === 2 ? 'h-24' : 'aspect-square'}`}
                    style={{ background: '#fff' }}
                  />
                  <div className="px-1 pt-1.5 pb-0.5">
                    <div className="text-[11px] font-semibold leading-[1.2]" style={{ color: '#2a1b45' }}>
                      {p.nombre}
                    </div>
                    <div className="text-[12px] font-bold" style={{ color: '#2a1b45' }}>
                      {p.precio}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 pb-4">
              <div
                className="flex items-center justify-between rounded-full py-1.5 pl-4 pr-1.5"
                style={{ background: '#2a1b45' }}
              >
                <span className="text-[11px] font-bold" style={{ color: '#fbf6ee' }}>
                  3 productos
                </span>
                <span
                  className="rounded-full px-3 py-1.5 text-[11px] font-bold"
                  style={{ background: '#25d366', color: '#0b2e17' }}
                >
                  Ver pedido
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
