import { calcularCuenta } from '../../src/logica/cuenta';
import { formatearPrecio } from '../../src/logica/precio';
import { MEDIOS_DE_PAGO } from '../../src/logica/tipos';
import { ETIQUETA_MEDIO } from '../../src/logica/whatsapp';
import { textoSinImporte } from './parser';
import type { Descuento, MedioDePago } from '../../src/logica/tipos';
import type { PedidoParseado } from './parser';
import type { Cobro, LineaDeCobro } from './ticket';

/** Lo que el local elige a mano antes de imprimir.
 *
 *  El descuento por retiro NO está acá: es automático, viaja resuelto en el
 *  mensaje y el local no lo toca (ver `armarCobro`). */
export type SeleccionDeCobro = {
  medioDePago: MedioDePago | null;
  descuentoManual: Descuento;
  envio: { zona: string; precio: number } | null;
  /** Posiciones de los renglones que se regalan. */
  bonificadas: number[];
};

/** Con qué arranca el formulario: lo que vino en el mensaje. El local ajusta
 *  desde ahí, que es más rápido que cargar todo de nuevo. */
export function seleccionInicial(pedido: PedidoParseado): SeleccionDeCobro {
  return {
    medioDePago: pedido.medioDePago,
    descuentoManual: { tipo: 'ninguno' },
    envio: pedido.envio ? { ...pedido.envio } : null,
    bonificadas: [],
  };
}

/** Resuelve la selección en un `Cobro`, con la cuenta calculada por
 *  `cuenta.ts`. La extensión no suma nada por su cuenta: si lo hiciera, la
 *  comanda podría imprimir un total distinto al que la carta le mostró al
 *  comensal y al que la ruta de confirmación va a guardar. */
export function armarCobro(pedido: PedidoParseado, seleccion: SeleccionDeCobro): Cobro {
  const lineas: LineaDeCobro[] = pedido.items.map((item, indice) => ({
    texto: textoSinImporte(item.texto),
    importe: item.importe,
    bonificada: seleccion.bonificadas.includes(indice),
  }));

  // El descuento por retiro se rearma como `Descuento` a partir del monto que
  // viajó en el mensaje (la extensión no lee la config del panel). Va así y no
  // como el entero ya resuelto porque la ruta de confirmación RECALCULA la
  // cuenta: con el entero pelado no podría, y el historial guardaría un total
  // más alto que el que se imprimió y se cobró.
  const descuentoRetiro: Descuento =
    pedido.descuentoRetiro !== null && pedido.descuentoRetiro > 0
      ? { tipo: 'monto', valor: pedido.descuentoRetiro }
      : { tipo: 'ninguno' };

  const cuenta = calcularCuenta({
    lineas: lineas.map(({ importe, bonificada }) => ({ importe, bonificada })),
    // la misma modalidad que leyó el parser: `cuenta.ts` aplica el descuento de
    // retiro solo en retiro, y del otro lado la ruta de confirmación va a hacer
    // la misma cuenta con estos mismos datos
    modalidad: pedido.modalidad,
    descuentoRetiro,
    descuentoManual: seleccion.descuentoManual,
    envio: seleccion.envio?.precio ?? 0,
  });

  return {
    cuenta,
    lineas,
    medioDePago: seleccion.medioDePago,
    envio: seleccion.envio,
    descuentoManual: seleccion.descuentoManual,
    descuentoRetiro,
    bonificadas: [...seleccion.bonificadas].sort((a, b) => a - b),
  };
}

const CLASE_PANEL = 'comanda-cobro';

const ESTILO_ETIQUETA =
  'display:block; font-size:11px; text-transform:uppercase; letter-spacing:0.04em; color:#555; margin:0 0 4px;';
const ESTILO_FILA = 'margin:0 0 12px;';
const ESTILO_CAMPO =
  'box-sizing:border-box; padding:6px 8px; font-size:13px; font-family:inherit; color:#111; background:#fff; border:1px solid #bbb; border-radius:6px;';
const ESTILO_BOTON =
  'padding:8px 14px; font-size:13px; font-family:inherit; cursor:pointer; border-radius:6px; border:1px solid #bbb; background:#f2f2f2; color:#111;';
const ESTILO_BOTON_PRIMARIO =
  'padding:8px 14px; font-size:13px; font-family:inherit; cursor:pointer; border-radius:6px; border:1px solid #0a7d3f; background:#0a7d3f; color:#fff; font-weight:600;';

function nuevo<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  estilo = '',
  texto = '',
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(etiqueta);
  if (estilo) elemento.style.cssText = estilo;
  // textContent y nunca innerHTML: acá entra texto que escribió el comensal
  if (texto) elemento.textContent = texto;
  return elemento;
}

/** Un bloque con su etiqueta arriba, como los del panel. */
function fila(titulo: string): HTMLDivElement {
  const contenedor = nuevo('div', ESTILO_FILA);
  contenedor.appendChild(nuevo('span', ESTILO_ETIQUETA, titulo));
  return contenedor;
}

/** El descuento que representan los dos controles. Un valor vacío, cero o
 *  ilegible es "ninguno": no se descuenta nada que el local no haya cargado. */
function descuentoDeLosControles(tipo: string, valorCrudo: string): Descuento {
  if (tipo !== 'porcentaje' && tipo !== 'monto') return { tipo: 'ninguno' };
  const valor = Math.floor(Number(valorCrudo));
  if (!Number.isFinite(valor) || valor <= 0) return { tipo: 'ninguno' };
  if (tipo === 'porcentaje') return { tipo: 'porcentaje', valor: Math.min(100, valor) };
  return { tipo: 'monto', valor };
}

/** Abre el formulario de cobro sobre la página, precargado con lo que vino en
 *  el mensaje.
 *
 *  `alImprimir` se llama SINCRÓNICO desde el click del botón "Imprimir" de este
 *  formulario, y eso no es negociable: el `window.open` de la comanda cuelga de
 *  ese click. Si el cobro llegara por una promesa o un callback asincrónico
 *  posterior, se perdería la activación del usuario y el navegador bloquearía
 *  la ventana SIEMPRE. Por eso esta función no devuelve una promesa. */
export function abrirFormularioDeCobro(
  pedido: PedidoParseado,
  alImprimir: (cobro: Cobro) => void,
): void {
  // Uno solo a la vez: el botón está en cada mensaje del chat y es fácil tocar
  // dos seguidos.
  if (document.querySelector('.' + CLASE_PANEL)) return;

  const seleccion = seleccionInicial(pedido);

  const fondo = nuevo(
    'div',
    'position:fixed; inset:0; z-index:2147483647; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:16px;',
  );
  fondo.className = CLASE_PANEL;

  const panel = nuevo(
    'div',
    "box-sizing:border-box; width:100%; max-width:380px; max-height:90vh; overflow:auto; background:#fff; color:#111; border-radius:10px; padding:16px; font-family:'Segoe UI', system-ui, sans-serif; font-size:13px; line-height:1.4; text-align:left; box-shadow:0 8px 30px rgba(0,0,0,0.4);",
  );

  const titulo = nuevo('div', 'font-size:15px; font-weight:700; margin:0 0 2px;', 'Cobro del pedido');
  const subtitulo = nuevo(
    'div',
    'font-size:12px; color:#555; margin:0 0 14px;',
    `${pedido.lineaContacto} · ${pedido.nombre}`,
  );
  panel.append(titulo, subtitulo);

  // ── Medio de pago ────────────────────────────────────────────────────────
  const filaPago = fila('Cómo paga');
  const opcionesDePago: { valor: MedioDePago | ''; etiqueta: string }[] = [
    ...MEDIOS_DE_PAGO.map((medio) => ({ valor: medio, etiqueta: ETIQUETA_MEDIO[medio] })),
    { valor: '', etiqueta: 'Sin especificar' },
  ];
  for (const opcion of opcionesDePago) {
    const etiqueta = nuevo('label', 'display:inline-flex; align-items:center; gap:5px; margin:0 10px 4px 0;');
    const radio = nuevo('input', 'margin:0;');
    radio.type = 'radio';
    radio.name = 'comanda-cobro-pago';
    radio.value = opcion.valor;
    radio.dataset.cobro = 'pago';
    radio.checked = (seleccion.medioDePago ?? '') === opcion.valor;
    radio.addEventListener('change', () => {
      seleccion.medioDePago = radio.value === '' ? null : (radio.value as MedioDePago);
      refrescar();
    });
    etiqueta.append(radio, nuevo('span', '', opcion.etiqueta));
    filaPago.appendChild(etiqueta);
  }
  panel.appendChild(filaPago);

  // ── Descuento ────────────────────────────────────────────────────────────
  const filaDescuento = fila('Descuento');
  const tipoDescuento = nuevo('select', ESTILO_CAMPO + ' margin-right:6px;');
  tipoDescuento.dataset.cobro = 'descuento-tipo';
  for (const [valor, etiqueta] of [
    ['ninguno', 'Sin descuento'],
    ['porcentaje', 'Porcentaje'],
    ['monto', 'Monto fijo'],
  ] as const) {
    const opcion = nuevo('option', '', etiqueta);
    opcion.value = valor;
    tipoDescuento.appendChild(opcion);
  }
  const valorDescuento = nuevo('input', ESTILO_CAMPO + ' width:90px;');
  valorDescuento.type = 'number';
  valorDescuento.min = '0';
  valorDescuento.step = '1';
  valorDescuento.dataset.cobro = 'descuento-valor';
  valorDescuento.style.display = 'none';

  const leerDescuento = () => {
    seleccion.descuentoManual = descuentoDeLosControles(tipoDescuento.value, valorDescuento.value);
    // el campo del valor aparece recién cuando hay un tipo elegido, igual que
    // en el panel
    valorDescuento.style.display = tipoDescuento.value === 'ninguno' ? 'none' : 'inline-block';
    refrescar();
  };
  tipoDescuento.addEventListener('change', leerDescuento);
  valorDescuento.addEventListener('input', leerDescuento);
  filaDescuento.append(tipoDescuento, valorDescuento);

  // el descuento por retiro es automático: se muestra para que el local sepa
  // que ya está aplicado, pero no se edita
  if (pedido.descuentoRetiro !== null && pedido.descuentoRetiro > 0) {
    filaDescuento.appendChild(
      nuevo(
        'div',
        'font-size:12px; color:#555; margin-top:6px;',
        `Descuento por retiro del pedido: −${formatearPrecio(pedido.descuentoRetiro)}`,
      ),
    );
  }
  panel.appendChild(filaDescuento);

  // ── Envío ────────────────────────────────────────────────────────────────
  // Solo cuando puede haber envío: en salón o retiro no hay viaje que cobrar.
  if (pedido.modalidad !== 'salon' && pedido.modalidad !== 'retiro') {
    const filaEnvio = fila('Envío');
    const zona = nuevo('input', ESTILO_CAMPO + ' width:150px; margin-right:6px;');
    zona.type = 'text';
    zona.placeholder = 'Zona';
    zona.dataset.cobro = 'envio-zona';
    zona.value = seleccion.envio?.zona ?? '';

    const precio = nuevo('input', ESTILO_CAMPO + ' width:110px;');
    precio.type = 'number';
    precio.min = '0';
    precio.step = '1';
    precio.placeholder = 'Monto';
    precio.dataset.cobro = 'envio-precio';
    precio.value = seleccion.envio ? String(seleccion.envio.precio) : '';

    const leerEnvio = () => {
      const nombre = zona.value.trim();
      const monto = Math.floor(Number(precio.value));
      const hayMonto = precio.value.trim() !== '' && Number.isFinite(monto) && monto > 0;
      // sin nombre ni monto no hay envío; con nombre y sin monto, la zona igual
      // viaja (es una zona sin cargo, y el cadete necesita saber a dónde va)
      seleccion.envio = nombre || hayMonto ? { zona: nombre, precio: hayMonto ? monto : 0 } : null;
      refrescar();
    };
    zona.addEventListener('input', leerEnvio);
    precio.addEventListener('input', leerEnvio);
    filaEnvio.append(zona, precio);
    panel.appendChild(filaEnvio);
  }

  // ── Renglones a bonificar ────────────────────────────────────────────────
  if (pedido.items.length) {
    const filaLineas = fila('Bonificar renglones');
    pedido.items.forEach((item, indice) => {
      const etiqueta = nuevo('label', 'display:flex; align-items:flex-start; gap:6px; margin:0 0 4px;');
      const tilde = nuevo('input', 'margin:3px 0 0;');
      tilde.type = 'checkbox';
      tilde.dataset.cobro = 'bonificar';
      tilde.addEventListener('change', () => {
        seleccion.bonificadas = tilde.checked
          ? [...seleccion.bonificadas, indice]
          : seleccion.bonificadas.filter((posicion) => posicion !== indice);
        refrescar();
      });
      etiqueta.append(tilde, nuevo('span', '', item.texto));
      filaLineas.appendChild(etiqueta);
    });
    panel.appendChild(filaLineas);
  }

  // ── Total y botones ──────────────────────────────────────────────────────
  const total = nuevo(
    'div',
    'font-size:15px; font-weight:700; margin:14px 0 12px; padding-top:10px; border-top:1px solid #ddd;',
  );
  total.dataset.cobro = 'total';
  panel.appendChild(total);

  const botones = nuevo('div', 'display:flex; gap:8px; justify-content:flex-end;');
  const cancelar = nuevo('button', ESTILO_BOTON, 'Cancelar');
  cancelar.type = 'button';
  cancelar.dataset.cobro = 'cancelar';
  const imprimir = nuevo('button', ESTILO_BOTON_PRIMARIO, 'Imprimir');
  imprimir.type = 'button';
  imprimir.dataset.cobro = 'imprimir';
  botones.append(cancelar, imprimir);
  panel.appendChild(botones);

  /** El total en pantalla, con el mismo texto que va a salir impreso. */
  function refrescar(): void {
    const { cuenta } = armarCobro(pedido, seleccion);
    if (cuenta.hayLineasSinPrecio) {
      const parcial = cuenta.subtotal > 0 && cuenta.total > 0;
      total.textContent = parcial
        ? `Total: a confirmar (parcial ${formatearPrecio(cuenta.total)})`
        : 'Total: a confirmar';
      return;
    }
    total.textContent =
      cuenta.total > 0 ? `Total: ${formatearPrecio(cuenta.total)}` : 'Total: sin cargo';
  }

  function cerrar(): void {
    document.removeEventListener('keydown', alTeclado, true);
    fondo.remove();
  }

  function alTeclado(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrar();
    }
  }

  cancelar.addEventListener('click', (evento) => {
    evento.stopPropagation();
    cerrar();
  });

  imprimir.addEventListener('click', (evento) => {
    evento.stopPropagation();
    const cobro = armarCobro(pedido, seleccion);
    cerrar();
    // Sincrónico, adentro del click: es lo que le da al `window.open` de la
    // impresión la activación del usuario que el navegador le pide.
    alImprimir(cobro);
  });

  // Los eventos no llegan a WhatsApp: la página tiene sus propios manejadores
  // de teclado y de click, y un tab o una barra espaciadora acá no tienen que
  // terminar escribiendo en el chat.
  panel.addEventListener('click', (evento) => evento.stopPropagation());
  panel.addEventListener('keydown', (evento) => evento.stopPropagation());
  fondo.addEventListener('click', (evento) => {
    evento.stopPropagation();
    if (evento.target === fondo) cerrar();
  });
  document.addEventListener('keydown', alTeclado, true);

  refrescar();
  fondo.appendChild(panel);
  document.body.appendChild(fondo);
  imprimir.focus();
}
