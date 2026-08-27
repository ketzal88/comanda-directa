import type { Metadata } from 'next';

// Falta el número real de WhatsApp de Comanda Directa (pendiente, ver
// "Qué falta para publicarla" en landing/Brief Landing.dc.html). Se deja acá,
// en un solo lugar, para no tener que buscar el botón por toda la página el
// día que llegue el número.
const WHATSAPP_HREF = '#';

export const metadata: Metadata = {
  title: 'Comanda Directa',
  description:
    'Carta con QR, pedidos que llegan escritos al WhatsApp del local, e impresión de la comanda de cocina.',
};

const PASOS = [
  {
    numero: '01',
    titulo: 'Se carga la carta',
    texto: 'Con la instalación: platos, precios, fotos, zonas de envío y medios de pago del local.',
  },
  {
    numero: '02',
    titulo: 'El comensal pide',
    texto: 'Escanea el QR, arma el pedido, elige salón, retiro o delivery, y cómo va a pagar.',
  },
  {
    numero: '03',
    titulo: 'Llega escrito al local',
    texto: 'Un mensaje de WhatsApp con el detalle completo y el total. Nadie transcribe nada.',
  },
  {
    numero: '04',
    titulo: 'Se imprime',
    texto: 'Un botón manda la comanda a la cocina y, si es delivery, el ticket del cadete.',
  },
];

const FUNCIONES = [
  {
    titulo: 'Carta con QR',
    texto: 'Se abre en el navegador, con fotos, precios y descripciones. Sirve para la mesa y para el delivery.',
  },
  {
    titulo: 'Pedido armado',
    texto: 'Modalidad, zona de envío y medio de pago los elige el comensal. El mensaje llega completo.',
  },
  {
    titulo: 'Impresión térmica',
    texto: 'Comanda de cocina y ticket del cadete con dirección y total a cobrar, desde WhatsApp Web.',
  },
  {
    titulo: 'Carta editable al instante',
    texto: 'Cambiar un precio o marcar un plato sin stock son dos toques, y el comensal lo ve sin recargar.',
  },
  {
    titulo: 'Descuentos a criterio',
    texto: 'Por porcentaje, por monto o regalando un renglón. Siempre decide el local, nunca el sistema.',
  },
  {
    titulo: 'Registro de pedidos',
    texto: 'Cada pedido queda guardado con lo que se terminó cobrando, para revisar el turno después.',
  },
];

const PREGUNTAS = [
  {
    q: '¿Hay que cambiar el número de WhatsApp?',
    a: 'No. Los pedidos llegan al mismo número que ya usa el local, y se contestan desde ahí.',
  },
  {
    q: '¿Sirve para salón y para delivery?',
    a: 'Sí. El comensal elige salón, retiro o delivery. En delivery se imprime además el ticket del cadete, con dirección y total a cobrar.',
  },
  {
    q: '¿Quién carga la carta?',
    a: 'La primera carga va con la instalación. Después la edita el local cuando quiera, desde el panel.',
  },
  {
    q: '¿Funciona con cualquier impresora?',
    a: 'Con impresoras térmicas de 80 mm. Antes de instalar se revisa la que ya está en el mostrador.',
  },
  {
    q: '¿Y si se corta internet?',
    a: 'Se sigue tomando el pedido por WhatsApp como siempre. La carta y la impresión necesitan conexión.',
  },
];

export default function PaginaLanding() {
  return (
    <div className="bg-neutral-950 text-white">
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:gap-8 sm:px-8">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-block h-6 w-6 rounded-full bg-orange-500" aria-hidden="true" />
            Comanda Directa
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <a href="#como-funciona" className="hover:text-orange-400">
              Cómo funciona
            </a>
            <a href="#funciones" className="hover:text-orange-400">
              Funciones
            </a>
            <a href="#precio" className="hover:text-orange-400">
              Precio
            </a>
            <a href="#preguntas" className="hover:text-orange-400">
              Preguntas
            </a>
          </div>
          <a
            href={WHATSAPP_HREF}
            className="ml-auto whitespace-nowrap rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-orange-400"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-8 sm:pt-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-300">
          Para locales que ya reciben pedidos por WhatsApp
        </div>
        <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Del WhatsApp a la cocina, sin copiar y pegar.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-neutral-300">
          Carta con QR, pedidos que llegan escritos al WhatsApp del local, y un botón que imprime la
          comanda de cocina y el ticket del cadete.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={WHATSAPP_HREF}
            className="rounded-full bg-orange-500 px-7 py-4 text-base font-semibold text-neutral-950 hover:bg-orange-400"
          >
            Consultar por WhatsApp
          </a>
          <a
            href="#como-funciona"
            className="rounded-full border border-white/20 px-6 py-4 text-base font-semibold hover:border-white/40"
          >
            Ver cómo funciona
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-neutral-300">
          <li>Sin comisión por pedido</li>
          <li>Usa el WhatsApp que ya tiene el local</li>
          <li>El comensal no instala nada</li>
        </ul>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="grid gap-6 rounded-2xl bg-white/5 p-8 sm:grid-cols-3">
          <div>
            <p className="font-semibold">Solo hace falta WhatsApp</p>
            <p className="mt-1 text-sm text-neutral-300">Los pedidos siguen llegando al número de siempre.</p>
          </div>
          <div>
            <p className="font-semibold">Un QR, sin apps</p>
            <p className="mt-1 text-sm text-neutral-300">El comensal abre la carta en el navegador y listo.</p>
          </div>
          <div>
            <p className="font-semibold">Imprime en el mostrador</p>
            <p className="mt-1 text-sm text-neutral-300">Comanda de cocina y ticket del cadete, en un toque.</p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Cómo funciona</h2>
        <p className="mt-3 max-w-xl text-lg text-neutral-300">
          Cuatro pasos, en el orden en que pasan durante el servicio.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p) => (
            <div key={p.numero} className="rounded-2xl bg-white/5 p-7">
              <p className="text-sm font-semibold text-orange-400">Paso {p.numero}</p>
              <h3 className="mt-4 text-xl font-semibold">{p.titulo}</h3>
              <p className="mt-2 text-sm text-neutral-300">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="rounded-2xl bg-orange-600 p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">
            El diferencial, y es uno solo
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-bold sm:text-4xl">Nada se calcula solo.</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <p className="text-neutral-50">
              El descuento, el costo de envío y el medio de pago los decide el local, pedido por
              pedido: para compensar a un cliente que tuvo un problema antes, para regalar piezas en un
              pedido grande, o para ajustar la zona según cómo venga la carga de la noche.
            </p>
            <p className="text-neutral-50">
              Frente a una plataforma que automatiza y cobra por pedido, acá el local mantiene el
              criterio.
            </p>
          </div>
        </div>
      </section>

      <section id="funciones" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Qué incluye</h2>
        <p className="mt-3 max-w-xl text-lg text-neutral-300">Todo esto ya está construido y funcionando.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONES.map((f) => (
            <div key={f.titulo} className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <h3 className="text-xl font-semibold">{f.titulo}</h3>
              <p className="mt-2 text-sm text-neutral-300">{f.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <div>
            <h2 className="max-w-md text-3xl font-bold sm:text-4xl">
              La carta la maneja el local, no el proveedor.
            </h2>
            <p className="mt-5 max-w-md text-lg text-neutral-300">
              Se agotó un plato a las nueve de la noche: se marca y desaparece de la carta. Subió un
              precio: se cambia y ya está. Lo opera cualquiera del mostrador, sin llamar a nadie ni
              esperar a mañana.
            </p>
            <a
              href={WHATSAPP_HREF}
              className="mt-7 inline-block rounded-full bg-orange-500 px-6 py-3.5 text-base font-semibold text-neutral-950 hover:bg-orange-400"
            >
              Preguntar por el local propio
            </a>
          </div>
          <div className="aspect-[4/3] rounded-2xl border border-dashed border-white/20 bg-white/5" />
        </div>
      </section>

      <section id="limites" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="rounded-2xl border-2 border-dashed border-white/20 p-8 sm:p-11">
          <h2 className="text-2xl font-bold sm:text-3xl">Qué no hace</h2>
          <p className="mt-2 max-w-xl text-neutral-300">Conviene saberlo antes de escribir que después de instalarlo.</p>
          <div className="mt-8 grid gap-7 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold">No procesa pagos</h3>
              <p className="mt-1 text-sm text-neutral-300">
                El cobro se acuerda y se hace como siempre. El sistema registra lo cobrado, no lo cobra.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">No reemplaza la facturación</h3>
              <p className="mt-1 text-sm text-neutral-300">
                No emite comprobantes fiscales ni se integra con el sistema contable.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Necesita PC e impresora</h3>
              <p className="mt-1 text-sm text-neutral-300">
                Para imprimir hace falta una computadora con WhatsApp Web y una impresora térmica de 80 mm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="precio" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        <div className="rounded-2xl bg-white/5 p-8 sm:p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Precio</h2>
          <p className="mt-3 max-w-xl text-lg text-neutral-300">
            Una instalación al inicio y una mensualidad fija. Sin comisión por pedido: lo que se vende
            es del local.
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl bg-neutral-950 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">Instalación</p>
              <p className="mt-3 text-2xl font-bold">A definir</p>
              <p className="mt-3 text-sm text-neutral-300">
                Carga de la carta, configuración de la impresora y acompañamiento del primer servicio.
              </p>
            </div>
            <div className="rounded-xl border-2 border-orange-500 bg-neutral-950 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">Mensualidad</p>
              <p className="mt-3 text-2xl font-bold">A definir</p>
              <p className="mt-3 text-sm text-neutral-300">Carta, pedidos e impresión sin límite, con soporte por WhatsApp.</p>
            </div>
            <div className="rounded-xl bg-neutral-950 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">Comisión por pedido</p>
              <p className="mt-3 text-2xl font-bold">Ninguna</p>
              <p className="mt-3 text-sm text-neutral-300">Es lo mismo si es una noche floja o un sábado lleno: el costo no cambia.</p>
            </div>
          </div>
          <a
            href={WHATSAPP_HREF}
            className="mt-9 inline-block rounded-full bg-orange-500 px-7 py-4 text-base font-semibold text-neutral-950 hover:bg-orange-400"
          >
            Pedir el precio por WhatsApp
          </a>
        </div>
      </section>

      <section id="preguntas" className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-9 grid max-w-3xl gap-3">
          {PREGUNTAS.map((p) => (
            <details key={p.q} className="rounded-xl bg-white/5 p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none text-lg font-semibold">{p.q}</summary>
              <p className="mt-3 text-neutral-300">{p.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="rounded-2xl bg-orange-500 p-10 text-neutral-950 sm:p-16">
          <h2 className="max-w-md text-3xl font-bold sm:text-4xl">Cuéntenos cómo trabaja su local.</h2>
          <p className="mt-4 max-w-sm text-lg">
            Se revisa la carta, la impresora y cómo se toman los pedidos hoy. Si no encaja, se dice.
          </p>
          <a
            href={WHATSAPP_HREF}
            className="mt-7 inline-block rounded-full bg-neutral-950 px-7 py-4 text-base font-semibold text-white hover:bg-neutral-800"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-8">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span className="inline-block h-5 w-5 rounded-full bg-orange-500" aria-hidden="true" />
              Comanda Directa
            </p>
            <p className="mt-3 max-w-xs text-sm text-neutral-400">
              Pedidos por WhatsApp con carta QR e impresión de comandas, para locales que quieren
              seguir decidiendo cada pedido.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="font-semibold">La página</p>
            <a href="#como-funciona" className="text-neutral-300 hover:text-white">Cómo funciona</a>
            <a href="#funciones" className="text-neutral-300 hover:text-white">Qué incluye</a>
            <a href="#precio" className="text-neutral-300 hover:text-white">Precio</a>
            <a href="#limites" className="text-neutral-300 hover:text-white">Qué no hace</a>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="font-semibold">Contacto</p>
            <a href={WHATSAPP_HREF} className="text-neutral-300 hover:text-white">Consultar por WhatsApp</a>
            <p className="text-neutral-500">Funcionando hoy en un local de Buenos Aires.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
