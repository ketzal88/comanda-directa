import { PEDIDO_VACIO, sanearPedido } from '@/logica/pedido';
import type { Pedido } from '@/logica/pedido';

/** Dónde vive el pedido mientras el comensal recorre la carta. Almacén de
 *  módulo (no React state): lo tocan la fila y la hoja a la vez, y sobrevive
 *  a una navegación que desmonte el árbol de React. Persiste en
 *  `localStorage`, separado por cliente (`slug`) porque el mismo motor sirve
 *  varios restaurantes: el pedido de uno no tiene que verse en la carta de
 *  otro si alguien navega de un cliente a otro en la misma pestaña. */

const VENCE_EN_MS = 6 * 60 * 60 * 1000; // seis horas cubre una comida larga

function clave(slug: string): string {
  return `comanda:${slug}:pedido:v1`;
}

let clienteActual: string | null = null;
let pedido: Pedido = PEDIDO_VACIO;
const oyentes = new Set<() => void>();

function avisar() {
  for (const oyente of oyentes) oyente();
}

function leerDelNavegador(slug: string): Pedido {
  try {
    const crudo = window.localStorage.getItem(clave(slug));
    if (!crudo) return PEDIDO_VACIO;

    const sobre = JSON.parse(crudo) as { guardadoEn?: unknown; pedido?: unknown };
    const guardadoEn = typeof sobre?.guardadoEn === 'number' ? sobre.guardadoEn : 0;
    if (!guardadoEn || Date.now() - guardadoEn > VENCE_EN_MS) return PEDIDO_VACIO;

    return sanearPedido(sobre.pedido);
  } catch {
    return PEDIDO_VACIO;
  }
}

function guardarEnNavegador(slug: string, siguiente: Pedido) {
  try {
    if (!siguiente.lineas.length) {
      window.localStorage.removeItem(clave(slug));
      return;
    }
    window.localStorage.setItem(clave(slug), JSON.stringify({ guardadoEn: Date.now(), pedido: siguiente }));
  } catch {
    /* modo privado de Safari, cuota llena: el pedido sigue en memoria */
  }
}

/** Hidrata (o rehidrata, si `slug` cambió respecto de la última vez) el
 *  almacén para este cliente. */
function asegurarCliente(slug: string) {
  if (clienteActual === slug) return;
  clienteActual = slug;
  pedido = leerDelNavegador(slug);
}

export function suscribir(slug: string, oyente: () => void): () => void {
  asegurarCliente(slug);
  oyentes.add(oyente);

  const alGuardar = (e: StorageEvent) => {
    if (e.key !== clave(slug)) return;
    pedido = leerDelNavegador(slug);
    avisar();
  };
  window.addEventListener('storage', alGuardar);

  return () => {
    oyentes.delete(oyente);
    window.removeEventListener('storage', alGuardar);
  };
}

export function leer(slug: string): Pedido {
  asegurarCliente(slug);
  return pedido;
}

/** En el servidor el pedido siempre está vacío: vive en el navegador del
 *  comensal. */
export function leerEnServidor(): Pedido {
  return PEDIDO_VACIO;
}

export function escribir(slug: string, siguiente: Pedido) {
  clienteActual = slug;
  pedido = siguiente;
  guardarEnNavegador(slug, siguiente);
  avisar();
}
