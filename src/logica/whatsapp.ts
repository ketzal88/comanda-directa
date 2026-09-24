import { calcularCuenta } from './cuenta';
import { esCubierto, lineasDeCuenta, nombreDeLinea } from './pedido';
import { formatearPrecio } from './precio';
import type { LineaPedido, Pedido } from './pedido';
import type { Descuento, MedioDePago, Modalidad, ZonaEnvio } from './tipos';

/** El pedido armado, listo para salir por WhatsApp. Del otro lado hay una
 *  persona, no un POS: el mensaje trae todo lo que el salón preguntaría por
 *  chat. Todo lo de acá es puro y se prueba sin navegador. */

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  salon: 'En el salón',
  retiro: 'Retiro por el local',
  delivery: 'Delivery',
};

export const ETIQUETA_MEDIO: Record<MedioDePago, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  link: 'Link de pago',
};

export type DatosComensal = {
  nombre: string;
  modalidad: Modalidad;
  mesa?: string;
  direccion?: string;
  /** Con qué número llamarlo. OPCIONAL: se pide, no se exige. El delivery que
   *  toca el timbre y nadie atiende es el caso que este campo resuelve, pero un
   *  campo obligatorio más entre el pedido armado y el botón de enviar es
   *  pedidos que no se mandan. Cuando el comensal no lo completa, la extensión
   *  cae al número del chat de WhatsApp. */
  telefono?: string;
  notas?: string;
  medioDePago?: MedioDePago | null;
  zona?: ZonaEnvio | null;
};

export type ErrorDato = { campo: keyof DatosComensal; mensaje: string };

/** Tope de cada campo libre: el texto termina en una URL. */
export const MAX_TEXTO = 280;

/** Qué falta para poder enviar. Devuelve TODOS los errores, no corta en el primero. */
export function validarDatos(datos: DatosComensal, habilitadas: Modalidad[]): ErrorDato[] {
  const errores: ErrorDato[] = [];

  if (!datos.nombre.trim()) {
    errores.push({ campo: 'nombre', mensaje: 'Poné tu nombre así saben de quién es el pedido.' });
  }
  if (!habilitadas.includes(datos.modalidad)) {
    errores.push({ campo: 'modalidad', mensaje: 'Esa opción no está disponible en este momento.' });
  }
  if (datos.modalidad === 'salon' && !datos.mesa?.trim()) {
    errores.push({ campo: 'mesa', mensaje: '¿En qué mesa estás?' });
  }
  if (datos.modalidad === 'delivery' && !datos.direccion?.trim()) {
    errores.push({ campo: 'direccion', mensaje: 'Hace falta la dirección para el envío.' });
  }
  // El teléfono es opcional, así que vacío no es un error. Cargado y a medias
  // sí: un número que no se puede discar es peor que ninguno, porque el local
  // lo ve en la comanda y cree que tiene por dónde llamar.
  const telefono = datos.telefono?.trim() ?? '';
  if (telefono && !numeroUsable(telefono)) {
    errores.push({
      campo: 'telefono',
      mensaje: 'Revisá el teléfono: código de área y número, sin el 0 ni el 15.',
    });
  }

  for (const campo of ['nombre', 'mesa', 'direccion', 'telefono', 'notas'] as const) {
    if ((datos[campo] ?? '').length > MAX_TEXTO) {
      errores.push({ campo, mensaje: `Tiene que ser más corto (hasta ${MAX_TEXTO} caracteres).` });
    }
  }

  return errores;
}

/** Deja el número como lo quiere wa.me: solo dígitos, con código de país y
 *  sin el + ni el 0 ni el 15. La única inferencia permitida: 10 dígitos
 *  sueltos (el caso argentino más común) se prefijan con 549. Un número que
 *  ya trae código de país se respeta tal cual. */
export function normalizarNumero(crudo: string): string {
  let d = (crudo ?? '').replace(/\D/g, '');
  if (!d) return '';
  d = d.replace(/^0+/, '');
  if (d.length === 10) return `549${d}`;
  return d;
}

export function numeroUsable(crudo: string): boolean {
  return normalizarNumero(crudo).length >= 11;
}

function lineaDeContacto(datos: DatosComensal): string {
  const partes = [ETIQUETA_MODALIDAD[datos.modalidad]];
  if (datos.modalidad === 'salon' && datos.mesa?.trim()) partes.push(`Mesa ${datos.mesa.trim()}`);
  return partes.join(' · ');
}

/** Cómo se escribe un renglón en el mensaje, sin la cola de plata. Se exporta
 *  porque el cubierto sale con otro formato que los platos. */
export function textoDeLinea(linea: LineaPedido, cubiertoPorPersona = 0): string {
  if (!esCubierto(linea.itemId)) return `${linea.cantidad} × ${nombreDeLinea(linea)}`;
  const personas = linea.cantidad === 1 ? 'persona' : 'personas';
  const porPersona = formatearPrecio(cubiertoPorPersona || linea.precioUnitario);
  return `${linea.nombre} (${linea.cantidad} ${personas}, ${porPersona} c/u)`;
}

/** El mensaje completo. Los asteriscos son negrita de WhatsApp; el resto es
 *  texto plano a propósito. `nombreLocal` identifica al restaurante (antes
 *  hardcodeado, ahora viene de `clientes.nombre` porque el motor es
 *  multi-cliente). */
export function armarMensaje(
  pedido: Pedido,
  datos: DatosComensal,
  nombreLocal: string,
  {
    cubiertoPorPersona = 0,
    cabecera = '',
    descuentoRetiro = { tipo: 'ninguno' },
    codigo = '',
  }: {
    cubiertoPorPersona?: number;
    cabecera?: string;
    descuentoRetiro?: Descuento;
    /** El código del pedido, sin el `#`. Vacío = el mensaje no lo lleva. */
    codigo?: string;
  } = {},
): string {
  const bloques: string[] = [];

  const zona = datos.modalidad === 'delivery' ? (datos.zona ?? null) : null;

  const cuenta = calcularCuenta({
    lineas: lineasDeCuenta(pedido),
    modalidad: datos.modalidad,
    descuentoRetiro,
    descuentoManual: { tipo: 'ninguno' },
    envio: zona?.precio ?? 0,
  });

  if (cabecera.trim()) bloques.push(cabecera.trim());
  bloques.push(`*Pedido — ${nombreLocal}*`);
  bloques.push([lineaDeContacto(datos), datos.nombre.trim()].filter(Boolean).join('\n'));

  if (datos.modalidad === 'delivery' && datos.direccion?.trim()) {
    bloques.push(`Dirección: ${datos.direccion.trim()}`);
  }

  // Va en TODAS las modalidades, no solo en delivery: el pedido de retiro que
  // se demora también se resuelve con un llamado. Bloque propio y con prefijo,
  // como todos los campos con etiqueta: sin el prefijo el parser de la
  // extensión lo tomaría por un plato y correría las posiciones de los
  // renglones bonificados.
  if (datos.telefono?.trim()) bloques.push(`Teléfono: ${datos.telefono.trim()}`);

  // Los tres campos de plata van cada uno en su propio bloque, DESPUÉS de la
  // dirección y ANTES de los ítems, en ese orden: el parser de la extensión
  // de comandas (`extension-comandas/src/parser.ts`) clasifica como ítem
  // cualquier bloque cuyo prefijo no reconozca y bonifica por posición.
  if (datos.medioDePago) bloques.push(`Pago: ${datos.medioDePago}`);
  if (zona) {
    // Una zona sin cotizar sale SIN monto, no con un "a convenir" repetido:
    // el local lee el renglón y la ausencia de número ya dice que falta
    // acordarlo. Con `precio: 0` sí se escribe "sin cargo", porque ahí la
    // decisión está tomada y conviene que quede por escrito.
    const monto = zona.precio === null ? '' : ` — ${cuenta.envio > 0 ? formatearPrecio(cuenta.envio) : 'sin cargo'}`;
    bloques.push(`Envío: ${zona.nombre}${monto}`);
  }
  if (cuenta.descuentoRetiro > 0) {
    const detalle =
      descuentoRetiro.tipo === 'porcentaje' ? `retiro ${descuentoRetiro.valor}%` : 'retiro';
    bloques.push(`Descuento: ${detalle} — ${formatearPrecio(cuenta.descuentoRetiro)}`);
  }
  // El código va DESPUÉS del bloque de contacto+nombre y con `#` en el
  // prefijo, no en el valor: el parser arranca en el bloque siguiente al
  // ancla ('*Pedido — …*') y un `#` adentro del valor rompería una futura
  // ruta de confirmación por código.
  if (codigo.trim()) bloques.push(`Pedido #${codigo.trim()}`);

  const filas = pedido.lineas.map((l) => {
    const cola =
      l.precioUnitario > 0 ? formatearPrecio(l.precioUnitario * l.cantidad) : 'a confirmar';
    return `${textoDeLinea(l, cubiertoPorPersona)} — ${cola}`;
  });
  if (filas.length) bloques.push(filas.join('\n'));

  // El envío a convenir no se puede sumar, así que el total que se manda es
  // sin él. Decirlo en el mismo renglón evita que el comprador lea el número
  // como final y después discuta la diferencia.
  const colaEnvio = zona?.precio === null ? ' + envío a convenir' : '';

  // nunca "$0": un total en cero es un pedido sin precios cargados.
  if (cuenta.hayLineasSinPrecio) {
    const parcial = cuenta.subtotal > 0 && cuenta.total > 0;
    bloques.push(
      parcial
        ? `*Total: a confirmar (parcial ${formatearPrecio(cuenta.total)})${colaEnvio}*`
        : `*Total: a confirmar${colaEnvio}*`,
    );
  } else {
    bloques.push(
      cuenta.total > 0
        ? `*Total: ${formatearPrecio(cuenta.total)}${colaEnvio}*`
        : `*Total: a confirmar${colaEnvio}*`,
    );
  }

  if (datos.notas?.trim()) bloques.push(`Aclaraciones: ${datos.notas.trim()}`);

  return bloques.join('\n\n');
}

/** El enlace de WhatsApp, o null si no hay número usable. */
export function enlaceWhatsApp(numeroCrudo: string, mensaje: string): string | null {
  if (!numeroUsable(numeroCrudo)) return null;
  return `https://wa.me/${normalizarNumero(numeroCrudo)}?text=${encodeURIComponent(mensaje)}`;
}
