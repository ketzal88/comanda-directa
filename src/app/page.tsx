import type { Metadata } from 'next';
import { Casos } from '@/componentes/landing/Casos';
import { Logo, MaquetaEncabezado, Tilde } from '@/componentes/landing/Maqueta';
import { CLASES_FUENTES } from '@/componentes/landing/tipografia';
import { enlaceWhatsApp } from '@/logica/whatsapp';

/** La landing del producto: puerto del artboard "Landing v3" de Claude
 *  Design (queda en `landing/` como referencia de copy y diseño).
 *
 *  El producto se llama "Hacé tu pedido", igual que el dominio. "Comanda
 *  Directa" quedó como el nombre del repo y del motor. */

const NOMBRE = 'Hacé tu pedido';
const WHATSAPP = '5491168830798';

/** El link se arma con el mismo helper que usa el pedido de cada cliente:
 *  normaliza el número y escapa el texto. Si el número dejara de ser válido,
 *  devuelve null y el botón no se muestra — antes que un `wa.me/` roto. */
const CONSULTAR =
  enlaceWhatsApp(WHATSAPP, 'Hola, quiero saber cómo funciona el sistema de pedidos.') ?? '#';

export const metadata: Metadata = {
  title: 'Hacé tu pedido — pedidos por WhatsApp con catálogo online',
  description:
    'Catálogo online con link y QR, pedidos que llegan completos a tu WhatsApp e impresión del ticket. Sin comisión por pedido.',
};

const VENTAJAS = [
  'Sin comisión por pedido',
  'Usa el WhatsApp que ya tenés',
  'Tu cliente no instala nada',
  'Editás lo que quieras, cuando quieras',
];

const RUBROS = ['Restaurantes', 'Almacenes', 'Panaderías', 'Viandas', 'Pet shops', 'Ferreterías'];

const PILARES = [
  {
    titulo: 'Solo hace falta WhatsApp',
    texto: 'Los pedidos llegan al número de siempre.',
    icono: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  {
    titulo: 'Un link o un QR, sin apps',
    texto: 'Tu cliente abre el catálogo en el navegador y listo.',
    icono: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM19 19h2v2h-2z" />
      </>
    ),
  },
  {
    titulo: 'Imprimí cada pedido',
    texto: 'Ticket para preparar y para el repartidor, en un toque.',
    icono: (
      <>
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v8H6z" />
      </>
    ),
  },
];

const PASOS = [
  {
    paso: 'Paso 01',
    titulo: 'Se carga el catálogo',
    texto: 'Con la puesta a punto: productos, precios, fotos, zonas de envío y medios de pago.',
  },
  {
    paso: 'Paso 02',
    titulo: 'Tu cliente pide',
    texto: 'Entra por el link o escanea el QR, arma el pedido, elige retiro o envío, y cómo va a pagar.',
  },
  {
    paso: 'Paso 03',
    titulo: 'Llega a tu WhatsApp',
    texto: 'Un mensaje de WhatsApp con el detalle completo y el total. Nadie transcribe nada.',
  },
  {
    paso: 'Paso 04',
    titulo: 'Se imprime',
    texto: 'Un botón imprime el ticket para armar el pedido y, si es con envío, el del repartidor.',
  },
];

const FUNCIONES = [
  {
    titulo: 'Catálogo con link y QR',
    texto:
      'Se abre en el navegador, con fotos, precios y descripciones. Lo compartís en redes, estados o en el local.',
  },
  {
    titulo: 'Pedido armado',
    texto: 'Modalidad, zona de envío y medio de pago los elige tu cliente. El mensaje llega completo.',
  },
  {
    titulo: 'Impresión térmica',
    texto: 'Ticket de preparación y ticket de entrega con dirección y total a cobrar, desde WhatsApp Web.',
  },
  {
    titulo: 'Editás todo al instante',
    texto: 'Cambiar un precio o marcar algo sin stock son dos toques, y tu cliente lo ve sin recargar.',
  },
  {
    titulo: 'Descuentos a criterio',
    texto: 'Por porcentaje, por monto o regalando un renglón. Siempre decidís vos, nunca el sistema.',
  },
  {
    titulo: 'Registro de pedidos',
    texto: 'Cada pedido queda guardado con lo que se terminó cobrando, para revisar el día después.',
  },
];

const LIMITES = [
  {
    titulo: 'No procesa pagos',
    texto: 'El cobro se acuerda y se hace como siempre. El sistema registra lo cobrado, no lo cobra.',
  },
  {
    titulo: 'No reemplaza la facturación',
    texto: 'No emite comprobantes fiscales ni se integra con el sistema contable.',
  },
  {
    titulo: 'Necesita PC e impresora',
    texto:
      'Para imprimir hace falta una computadora con WhatsApp Web y una impresora térmica de 80 mm.',
  },
];

const PREGUNTAS = [
  {
    q: '¿Hay que cambiar el número de WhatsApp?',
    a: 'No. Los pedidos llegan al mismo número que ya usás, y se contestan desde ahí.',
  },
  {
    q: '¿Sirve para mi rubro?',
    a: 'Si tus clientes ya te piden por WhatsApp, sí: comida, almacén, panadería, mascotas, ferretería, regalería. Retiro o envío; con envío se imprime además el ticket del repartidor.',
  },
  {
    q: '¿Quién carga el catálogo?',
    a: 'La primera carga va con la personalización. Después lo editás vos cuando quieras, desde el panel.',
  },
  {
    q: '¿Funciona con cualquier impresora?',
    a: 'Con impresoras térmicas de 80 mm. Antes de arrancar se revisa la que ya tenés.',
  },
  {
    q: '¿Y si se corta internet?',
    a: 'Se sigue tomando el pedido por WhatsApp como siempre. El catálogo y la impresión necesitan conexión.',
  },
];

const ENLACES_NAV = [
  ['#como-funciona', 'Cómo funciona'],
  ['#muestra', 'Muestra'],
  ['#funciones', 'Qué incluye'],
  ['#precio', 'Precio'],
  ['#preguntas', 'Preguntas'],
];

export default function Landing() {
  return (
    <div className={`landing ${CLASES_FUENTES} min-h-dvh overflow-x-hidden`}>
      {/* `body` toma su fondo de `--color-fondo`, que es de las cartas y por
          defecto es oscuro: sin esto se ve una franja negra al hacer overscroll
          arriba y abajo de la landing. */}
      <style>{':root{--color-fondo:#f5ead8;--color-texto:#201e1d}'}</style>

      <nav
        className="sticky top-0 z-30 backdrop-blur-[12px]"
        style={{
          background: 'color-mix(in srgb, var(--l-papel) 90%, transparent)',
          borderBottom: '1px solid var(--l-linea)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-8">
          <div className="titulo flex items-center gap-2.5 text-[21px]">
            <Logo />
            {NOMBRE}
          </div>
          <div className="hidden flex-wrap gap-x-5 gap-y-2 text-sm font-semibold lg:flex">
            {ENLACES_NAV.map(([href, texto]) => (
              <a key={href} href={href} className="no-underline" style={{ color: 'var(--l-tinta)' }}>
                {texto}
              </a>
            ))}
          </div>
          <a
            href={CONSULTAR}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-boton-wa ml-auto whitespace-nowrap px-5 py-2.5 text-sm no-underline"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </nav>

      <header className="relative overflow-hidden px-4 pt-9 sm:px-8 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold"
              style={{ background: 'var(--l-oliva-200)', color: 'var(--l-oliva-800)' }}
            >
              Para negocios que ya venden por WhatsApp
            </div>
            <h1 className="m-0 mb-5 max-w-[19ch] text-[clamp(34px,6.4vw,58px)] leading-[1.04]">
              Tus clientes piden por WhatsApp. Vos lo recibís ordenado.
            </h1>
            <p className="m-0 mb-7 max-w-[46ch] text-[clamp(17px,2vw,19px)] leading-[1.5]">
              Un catálogo online con link y QR, pedidos que llegan completos a tu WhatsApp, y un
              botón que imprime el ticket para preparar y para entregar.
            </p>

            <div className="mb-7 flex flex-wrap gap-2">
              {RUBROS.map((r) => (
                <span key={r} className="landing-etiqueta">
                  {r}
                </span>
              ))}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <a
                href={CONSULTAR}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-boton-wa px-7 py-4 text-[17px] no-underline"
                style={{ boxShadow: 'var(--l-sombra-md)' }}
              >
                Consultar por WhatsApp
              </a>
              <a
                href="#como-funciona"
                className="landing-boton-secundario px-6 py-4 text-[16px] no-underline"
                style={{ color: 'var(--l-tinta)' }}
              >
                Ver cómo funciona
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2.5">
              {VENTAJAS.map((v) => (
                <div key={v} className="flex items-center gap-2 text-sm font-semibold">
                  <Tilde />
                  {v}
                </div>
              ))}
            </div>
          </div>

          <MaquetaEncabezado />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-9 pb-2 sm:px-8">
        <div
          className="grid gap-7 rounded-[28px] px-6 py-8 sm:px-10 md:grid-cols-3"
          style={{ background: 'var(--l-superficie)' }}
        >
          {PILARES.map((p) => (
            <div key={p.titulo} className="flex items-start gap-3.5">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--l-papel)' }}
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--l-terracota-700)"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {p.icono}
                </svg>
              </span>
              <span>
                <span className="titulo mb-1 block text-[18px]">{p.titulo}</span>
                <span className="block text-[15px]">{p.texto}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <h2 className="m-0 mb-3 text-[clamp(30px,5vw,44px)]">Cómo funciona</h2>
        <p className="m-0 mb-10 max-w-[52ch] text-[18px]">
          Cuatro pasos, en el orden en que pasan en el día a día.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p) => (
            <div
              key={p.paso}
              className="rounded-[28px] px-6 py-7"
              style={{ background: 'var(--l-neutro-100)' }}
            >
              <div className="titulo mb-4 text-[15px]" style={{ color: 'var(--l-terracota-700)' }}>
                {p.paso}
              </div>
              <h3 className="m-0 mb-2 text-[21px]">{p.titulo}</h3>
              <p className="m-0 text-[15px]">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="control" className="px-4 pb-12 sm:px-8 sm:pb-16">
        <div
          className="mx-auto max-w-6xl rounded-[28px] px-6 py-9 sm:px-12 sm:py-14"
          style={{ background: 'var(--l-oliva-700)', color: 'var(--l-papel)' }}
        >
          <div
            className="mb-4 text-[13px] font-bold uppercase tracking-[0.07em]"
            style={{ color: 'var(--l-oliva-200)' }}
          >
            El control queda en tu negocio
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="m-0 mb-5 max-w-[20ch] text-[clamp(32px,5.2vw,48px)] leading-[1.06]">
                Nada se calcula solo.
              </h2>
              <p className="m-0 mb-3.5 max-w-[52ch] text-[18px]">
                Antes de imprimir, ajustás el medio de pago, el descuento y la zona de envío. Un
                porcentaje, un monto fijo o regalar un renglón del pedido: se decide pedido por
                pedido.
              </p>
              <p className="m-0 max-w-[52ch] text-[18px]">
                Ese margen es una herramienta: compensar a un cliente que tuvo un problema la vez
                anterior, sumar algo en un pedido grande, cobrar el envío según la distancia. Un
                sistema que lo automatiza le saca esa decisión de las manos.
              </p>
            </div>
            <div
              className="rounded-[16px] p-6"
              style={{ background: 'color-mix(in srgb, #fff 12%, transparent)' }}
            >
              <div
                className="mb-4 text-[12.5px] font-bold uppercase tracking-[0.07em]"
                style={{ color: 'var(--l-oliva-200)' }}
              >
                Lo que se decide en cada pedido
              </div>
              <div className="grid gap-3 text-[16px]">
                {[
                  ['Descuento', '% · monto · un renglón'],
                  ['Envío', 'por zona, o sin cargo'],
                  ['Medio de pago', 'el que se acuerde'],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className={`flex justify-between gap-4 ${i < 2 ? 'border-b pb-3' : ''}`}
                    style={i < 2 ? { borderColor: 'color-mix(in srgb, #fff 22%, transparent)' } : undefined}
                  >
                    <span>{k}</span>
                    <span className="opacity-75">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Casos />

      <section id="funciones" className="mx-auto max-w-6xl px-4 pb-12 sm:px-8 sm:pb-16">
        <h2 className="m-0 mb-3 text-[clamp(30px,5vw,44px)]">Qué incluye</h2>
        <p className="m-0 mb-10 max-w-[52ch] text-[18px]">
          Todo esto ya está funcionando hoy en un negocio real, no en una demo.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONES.map((f) => (
            <div
              key={f.titulo}
              className="rounded-[28px] p-7"
              style={{ background: 'var(--l-neutro-100)', border: '1px solid var(--l-linea)' }}
            >
              <h3 className="m-0 mb-2 text-[21px]">{f.titulo}</h3>
              <p className="m-0 text-[15px]">{f.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="limites" className="mx-auto max-w-6xl px-4 pb-12 sm:px-8 sm:pb-16">
        <div
          className="rounded-[28px] px-6 py-8 sm:px-11 sm:py-11"
          style={{ border: '2px dashed var(--l-neutro-400)' }}
        >
          <h2 className="m-0 mb-2.5 text-[clamp(27px,4.4vw,38px)]">Qué no hace</h2>
          <p className="m-0 mb-8 max-w-[52ch] text-[17px]">
            Mejor saberlo antes de escribir que después de instalarlo.
          </p>
          <div className="grid gap-7 sm:grid-cols-3">
            {LIMITES.map((l) => (
              <div key={l.titulo}>
                <h4 className="m-0 mb-1.5 text-[19px]">{l.titulo}</h4>
                <p className="m-0 text-[15px]">{l.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precio" className="mx-auto max-w-6xl px-4 pb-12 sm:px-8 sm:pb-16">
        <div
          className="rounded-[28px] px-6 py-9 sm:px-12 sm:py-13"
          style={{ background: 'var(--l-superficie)' }}
        >
          <h2 className="m-0 mb-3 text-[clamp(30px,5vw,44px)]">Precio</h2>
          <p className="m-0 mb-9 max-w-[54ch] text-[18px]">
            Una personalización al inicio y una mensualidad fija. Sin comisión por pedido: lo que
            vendés es tuyo.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[16px] p-8" style={{ background: 'var(--l-papel)' }}>
              <div
                className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.07em]"
                style={{ color: 'var(--l-terracota-700)' }}
              >
                Personalización
              </div>
              <div className="titulo mb-3.5 text-[clamp(30px,3.4vw,36px)]">US$ 50</div>
              <p className="m-0 text-[15px]">
                Aplicación del manual de marca, carga inicial del catálogo y primera puesta a punto.
              </p>
            </div>

            <div
              className="rounded-[16px] p-8"
              style={{ background: 'var(--l-papel)', border: '2px solid var(--l-terracota)' }}
            >
              <div
                className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.07em]"
                style={{ color: 'var(--l-terracota-700)' }}
              >
                Mensualidad
              </div>
              <div className="mb-3.5 flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="titulo text-[clamp(28px,3.2vw,36px)]">US$ 10</span>
                <span className="text-[16px] font-semibold">/ mes</span>
              </div>
              <p className="m-0 mb-3 text-[15px]">
                Catálogo, pedidos e impresión sin límite, con soporte por WhatsApp.
              </p>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold"
                style={{ background: 'var(--l-oliva-200)', color: 'var(--l-oliva-800)' }}
              >
                Pago anual US$ 100 · dos meses sin cargo
              </div>
            </div>

            <div className="rounded-[16px] p-8" style={{ background: 'var(--l-papel)' }}>
              <div
                className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.07em]"
                style={{ color: 'var(--l-terracota-700)' }}
              >
                Comisión por pedido
              </div>
              <div className="titulo mb-3.5 text-[clamp(30px,3.4vw,36px)]">Ninguna</div>
              <p className="m-0 text-[15px]">
                Da lo mismo si es un día flojo o un sábado lleno: el costo no cambia.
              </p>
            </div>
          </div>

          <a
            href={CONSULTAR}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-boton-wa mt-8 inline-block px-7 py-3.5 text-[16px] no-underline"
          >
            Pedir el precio por WhatsApp
          </a>
        </div>
      </section>

      <section id="preguntas" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8 sm:pb-20">
        <h2 className="m-0 mb-8 text-[clamp(30px,5vw,44px)]">Preguntas frecuentes</h2>
        <div className="grid max-w-[860px] gap-3">
          {PREGUNTAS.map((p) => (
            <details
              key={p.q}
              className="rounded-[16px] px-5 py-4 sm:px-6 sm:py-5"
              style={{ background: 'var(--l-neutro-100)', border: '1px solid var(--l-linea)' }}
            >
              {/* La pregunta va en la tipografía de TEXTO, no en la de títulos:
                  Caprasimo es una display con mucha personalidad y a tamaño de
                  párrafo, cinco preguntas seguidas se leen como cinco carteles.
                  El título de la sección sí la usa, que es donde luce. */}
              <summary className="flex items-center justify-between gap-4 text-[16px] font-semibold sm:text-[17px]">
                {p.q}
                <span
                  className="landing-mas grid h-7 w-7 shrink-0 place-items-center rounded-full text-[18px] leading-none"
                  style={{ background: 'var(--l-terracota-200)', color: 'var(--l-terracota-800)' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 mb-0 max-w-[62ch] text-[15.5px] leading-[1.55]" style={{ color: 'var(--l-tinta-suave)' }}>
                {p.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8">
        <div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] px-6 py-10 sm:px-12 sm:py-16"
          style={{ background: 'var(--l-terracota)', color: 'var(--l-papel)' }}
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-[150px] -right-[90px] h-[440px] w-[440px] rounded-full"
            style={{ background: 'color-mix(in srgb, #fff 12%, transparent)' }}
          />
          <div className="relative max-w-[36ch]">
            <h2 className="m-0 mb-4 text-[clamp(32px,5.6vw,52px)] leading-[1.06]">
              Contanos cómo vendés hoy.
            </h2>
            <p className="m-0 mb-7 max-w-[44ch] text-[19px]">
              Miramos tus productos, cómo te llegan los pedidos y si tenés impresora. Si no encaja,
              te lo decimos.
            </p>
            <a
              href={CONSULTAR}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full px-8 py-4 text-[17px] font-bold no-underline"
              style={{ background: 'var(--l-papel)', color: 'var(--l-terracota-800)' }}
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--l-linea)' }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 md:grid-cols-3">
          <div>
            <div className="titulo mb-2.5 flex items-center gap-2.5 text-[20px]">
              <Logo tamano={26} />
              {NOMBRE}
            </div>
            <p className="m-0 max-w-[38ch] text-[15px]" style={{ color: 'var(--l-tinta-suave)' }}>
              Pedidos por WhatsApp con catálogo online e impresión de tickets, para negocios que
              quieren seguir decidiendo cada pedido.
            </p>
          </div>
          <div className="grid content-start gap-2 text-[15px]">
            <div className="titulo mb-1 text-[16px]">La página</div>
            {ENLACES_NAV.map(([href, texto]) => (
              <a key={href} href={href} className="no-underline" style={{ color: 'var(--l-tinta)' }}>
                {texto}
              </a>
            ))}
          </div>
          <div className="grid content-start gap-2 text-[15px]">
            <div className="titulo mb-1 text-[16px]">Contacto</div>
            <a
              href={CONSULTAR}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
              style={{ color: 'var(--l-tinta)' }}
            >
              Consultar por WhatsApp
            </a>
            <span style={{ color: 'var(--l-tinta-suave)' }}>Funcionando hoy en Buenos Aires.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
