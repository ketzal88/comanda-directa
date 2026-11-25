import 'server-only';
import { aCategoria, aItem } from './carta-repo';
import { supabaseServidor } from './supabase-servidor';
import {
  efectivoDeCosto,
  esTipoStock,
  tarjetaDeEfectivo,
  type TipoStock,
} from '@/logica/precios-admin';
import type { CambiosItem } from '@/logica/validar-item';
import type {
  Categoria,
  ConfigPedido,
  Item,
  LineaPedidoInterno,
  PedidoInterno,
  Subcategoria,
} from '@/logica/tipos';
import type { ItemBorrador } from '@/logica/planilla';

/** Todo lo que el panel puede tocar, siempre scopeado por `clienteId` — el
 *  mismo patrón "el panel escribe siempre server-side" que ya usan
 *  presencia-carta y sagrado-sushi-carta con el Admin SDK de Firebase. Estas
 *  funciones corren solo desde rutas de API, nunca desde un Client Component. */

export async function listarItemsPanel(clienteId: string): Promise<Item[]> {
  const { data, error } = await supabaseServidor()
    .from('items')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('orden', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(aItem);
}

export async function obtenerItem(clienteId: string, itemId: string): Promise<Item | null> {
  const { data, error } = await supabaseServidor()
    .from('items')
    .select('*')
    .eq('id', itemId)
    .eq('cliente_id', clienteId)
    .maybeSingle();
  if (error) throw error;
  return data ? aItem(data) : null;
}

export const esUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** La FK de `items.categoria_id` sólo pide que la categoría exista, no que
 *  sea de este cliente: sin este chequeo un ítem quedaba colgado de la
 *  categoría de otro restaurante. */
export async function esCategoriaDelCliente(clienteId: string, categoriaId: string): Promise<boolean> {
  if (!esUuid(categoriaId)) return false; // si no, Postgres tira y la ruta da 500
  const { data, error } = await supabaseServidor()
    .from('categorias')
    .select('id')
    .eq('id', categoriaId)
    .eq('cliente_id', clienteId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function crearItem(
  clienteId: string,
  datos: ItemBorrador,
): Promise<Item> {
  const { data, error } = await supabaseServidor()
    .from('items')
    .insert({
      cliente_id: clienteId,
      categoria_id: datos.categoriaId,
      nombre: datos.nombre,
      subcategoria: datos.subcategoria ?? null,
      orden: datos.orden,
      precio: datos.precio,
      variantes: datos.variantes,
      piezas: datos.piezas ?? null,
      etiquetas: datos.etiquetas,
      descripcion: datos.descripcion ?? null,
      agotado: false,
      activo: true,
    })
    .select('*')
    .single();
  if (error) throw error;
  return aItem(data);
}

/** Aplica una whitelist ya validada (`validarCambiosItem`) a un ítem de este
 *  cliente. El `.eq('cliente_id', clienteId)` es lo que impide que la ruta
 *  de un cliente edite el ítem de otro aunque adivine el id. */
export async function editarItem(
  clienteId: string,
  itemId: string,
  cambios: CambiosItem,
): Promise<Item | null> {
  const columnas: Record<string, unknown> = {};
  if ('nombre' in cambios) columnas.nombre = cambios.nombre;
  if ('categoriaId' in cambios) columnas.categoria_id = cambios.categoriaId;
  if ('subcategoria' in cambios) columnas.subcategoria = cambios.subcategoria ?? null;
  if ('orden' in cambios) columnas.orden = cambios.orden;
  if ('precio' in cambios) columnas.precio = cambios.precio;
  if ('variantes' in cambios) columnas.variantes = cambios.variantes;
  if ('agotado' in cambios) columnas.agotado = cambios.agotado;
  if ('activo' in cambios) columnas.activo = cambios.activo;
  if ('piezas' in cambios) columnas.piezas = cambios.piezas ?? null;
  if ('etiquetas' in cambios) columnas.etiquetas = cambios.etiquetas;
  if ('descripcion' in cambios) columnas.descripcion = cambios.descripcion ?? null;
  if ('fotoUrl' in cambios) columnas.foto_url = cambios.fotoUrl ?? null;

  const { data, error } = await supabaseServidor()
    .from('items')
    .update(columnas)
    .eq('id', itemId)
    .eq('cliente_id', clienteId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? aItem(data) : null;
}

export async function importarFilas(clienteId: string, filas: ItemBorrador[]): Promise<number> {
  if (!filas.length) return 0;
  const { error } = await supabaseServidor()
    .from('items')
    .insert(
      filas.map((f) => ({
        cliente_id: clienteId,
        categoria_id: f.categoriaId,
        nombre: f.nombre,
        subcategoria: f.subcategoria ?? null,
        orden: f.orden,
        precio: f.precio,
        variantes: f.variantes,
        piezas: f.piezas ?? null,
        etiquetas: f.etiquetas,
        descripcion: f.descripcion ?? null,
        agotado: false,
        activo: true,
      })),
    );
  if (error) throw error;
  return filas.length;
}

export async function listarCategorias(clienteId: string): Promise<Categoria[]> {
  const { data, error } = await supabaseServidor()
    .from('categorias')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('orden', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(aCategoria);
}

export async function crearCategoria(
  clienteId: string,
  datos: { nombre: string; nombreEn?: string; orden: number; subcategorias?: Subcategoria[] },
): Promise<Categoria> {
  const { data, error } = await supabaseServidor()
    .from('categorias')
    .insert({
      cliente_id: clienteId,
      nombre: datos.nombre,
      nombre_en: datos.nombreEn ?? '',
      orden: datos.orden,
      subcategorias: datos.subcategorias ?? [],
    })
    .select('*')
    .single();
  if (error) throw error;
  return aCategoria(data);
}

export async function editarCategoria(
  clienteId: string,
  categoriaId: string,
  cambios: Partial<{ nombre: string; nombreEn: string; orden: number; subcategorias: Subcategoria[] }>,
): Promise<Categoria | null> {
  const columnas: Record<string, unknown> = {};
  if ('nombre' in cambios) columnas.nombre = cambios.nombre;
  if ('nombreEn' in cambios) columnas.nombre_en = cambios.nombreEn;
  if ('orden' in cambios) columnas.orden = cambios.orden;
  if ('subcategorias' in cambios) columnas.subcategorias = cambios.subcategorias;

  const { data, error } = await supabaseServidor()
    .from('categorias')
    .update(columnas)
    .eq('id', categoriaId)
    .eq('cliente_id', clienteId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? aCategoria(data) : null;
}

/** La config de pedido (WhatsApp, modalidades, medios de pago, zonas,
 *  descuento por retiro, cubierto y notas) vive en la MISMA fila de
 *  `clientes` — ver el comentario de `Cliente` en logica/tipos.ts. */
export type CambiosConfig = Partial<{
  whatsapp: string;
  modalidades: ConfigPedido['modalidades'];
  cabecera: string;
  mediosDePago: ConfigPedido['mediosDePago'];
  zonasEnvio: ConfigPedido['zonasEnvio'];
  descuentoRetiro: ConfigPedido['descuentoRetiro'];
  cubiertoPorPersona: number;
  notas: string[];
}>;

export async function editarConfig(clienteId: string, cambios: CambiosConfig): Promise<void> {
  const columnas: Record<string, unknown> = {};
  if ('whatsapp' in cambios) columnas.whatsapp = cambios.whatsapp;
  if ('modalidades' in cambios) columnas.modalidades = cambios.modalidades;
  if ('cabecera' in cambios) columnas.cabecera = cambios.cabecera;
  if ('mediosDePago' in cambios) columnas.medios_de_pago = cambios.mediosDePago;
  if ('zonasEnvio' in cambios) columnas.zonas_envio = cambios.zonasEnvio;
  if ('descuentoRetiro' in cambios) columnas.descuento_retiro = cambios.descuentoRetiro;
  if ('cubiertoPorPersona' in cambios) columnas.cubierto_por_persona = cambios.cubiertoPorPersona;
  if ('notas' in cambios) columnas.notas = cambios.notas;

  const { error } = await supabaseServidor().from('clientes').update(columnas).eq('id', clienteId);
  if (error) throw error;
}

// --- Back-office: stock, costos y pedidos internos (Party Market) ---------

export type CambiosAdmin = Partial<{
  costo: number;
  margen: number;
  tipoStock: TipoStock;
  stock: number | null;
}>;

/** Edita costo/margen/stock/tipo de un ítem. Si viene un costo cargado,
 *  recalcula el precio de lista (tarjeta) desde costo+margen, así la web y el
 *  admin no muestran precios distintos. Scopeado por `clienteId`. */
export async function actualizarItemAdmin(
  clienteId: string,
  itemId: string,
  cambios: CambiosAdmin,
): Promise<Item | null> {
  const columnas: Record<string, unknown> = {};
  if ('costo' in cambios) columnas.costo = Math.max(0, Math.floor(cambios.costo ?? 0));
  if ('margen' in cambios) columnas.margen = Math.max(0, Math.floor(cambios.margen ?? 0));
  if ('tipoStock' in cambios && esTipoStock(cambios.tipoStock)) columnas.tipo_stock = cambios.tipoStock;
  if ('stock' in cambios) {
    columnas.stock = cambios.stock == null ? null : Math.max(0, Math.floor(cambios.stock));
    // Reponer stock vuelve a vender: el pedido que lo llevó a 0 lo marcó agotado.
    if (((columnas.stock as number | null) ?? 0) > 0) columnas.agotado = false;
  }

  // Recalcular el precio de lista cuando hay costo: efectivo = costo+margen,
  // tarjeta = efectivo/0,9. Sin costo cargado, no se toca el precio.
  const costo = columnas.costo as number | undefined;
  const margen = columnas.margen as number | undefined;
  if (costo != null && costo > 0) {
    const actual = await obtenerItem(clienteId, itemId);
    const margenFinal = margen ?? actual?.margen ?? 0;
    const efectivo = efectivoDeCosto(costo, margenFinal);
    if (efectivo > 0) columnas.precio = tarjetaDeEfectivo(efectivo);
  }

  const { data, error } = await supabaseServidor()
    .from('items')
    .update(columnas)
    .eq('id', itemId)
    .eq('cliente_id', clienteId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? aItem(data) : null;
}

function aPedido(fila: Record<string, unknown>, lineas: LineaPedidoInterno[] = []): PedidoInterno {
  return {
    id: fila.id as string,
    numero: fila.numero as number,
    comprador: (fila.comprador as string) ?? '',
    telefono: (fila.telefono as string) ?? '',
    nota: (fila.nota as string) ?? '',
    medioPago: (fila.medio_pago as string) ?? '',
    total: (fila.total as number) ?? 0,
    creadoEn: (fila.creado_en as string) ?? '',
    lineas,
  };
}

export type NuevoPedido = {
  comprador: string;
  telefono: string;
  nota: string;
  medioPago: string;
  lineas: LineaPedidoInterno[];
};

/** Crea un pedido interno: lo numera (correlativo por cliente), guarda sus
 *  líneas con el precio del momento y descuenta el stock de lo que descuenta
 *  (propio y consignación; "a pedido" no toca stock). Todo en una transacción
 *  de Postgres: ver `crear_pedido_interno` en migrations/0004. */
export async function crearPedidoInterno(clienteId: string, datos: NuevoPedido): Promise<PedidoInterno> {
  const lineas = datos.lineas.filter((l) => l.cantidad > 0);
  if (!lineas.length) throw new Error('El pedido no tiene productos.');

  const { data: pedido, error } = await supabaseServidor().rpc('crear_pedido_interno', {
    p_cliente_id: clienteId,
    p_comprador: datos.comprador,
    p_telefono: datos.telefono,
    p_nota: datos.nota,
    p_medio_pago: datos.medioPago,
    p_lineas: lineas.map((l) => ({
      item_id: l.itemId ?? '',
      nombre: l.nombre,
      variante: l.variante,
      precio_unitario: l.precioUnitario,
      cantidad: l.cantidad,
    })),
  });
  if (error) throw error;
  return aPedido(pedido as Record<string, unknown>, lineas);
}

/** Los pedidos internos del cliente, del más nuevo al más viejo (sin líneas). */
export async function listarPedidosInternos(clienteId: string): Promise<PedidoInterno[]> {
  const { data, error } = await supabaseServidor()
    .from('pedidos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('numero', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((f) => aPedido(f));
}

/** Un pedido interno por su número, con sus líneas. */
export async function leerPedidoInterno(clienteId: string, numero: number): Promise<PedidoInterno | null> {
  const db = supabaseServidor();
  const { data: pedido, error } = await db
    .from('pedidos')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('numero', numero)
    .maybeSingle();
  if (error) throw error;
  if (!pedido) return null;

  const { data: items, error: eItems } = await db
    .from('pedido_items')
    .select('*')
    .eq('pedido_id', pedido.id);
  if (eItems) throw eItems;

  const lineas: LineaPedidoInterno[] = (items ?? []).map((l) => ({
    itemId: l.item_id ?? null,
    nombre: l.nombre,
    variante: l.variante ?? '',
    precioUnitario: l.precio_unitario ?? 0,
    cantidad: l.cantidad ?? 1,
  }));
  return aPedido(pedido, lineas);
}
