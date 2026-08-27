import 'server-only';
import { aCategoria, aItem } from './carta-repo';
import { supabaseServidor } from './supabase-servidor';
import type { CambiosItem } from '@/logica/validar-item';
import type { Categoria, ConfigPedido, Item, Subcategoria } from '@/logica/tipos';
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
