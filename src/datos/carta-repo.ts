import 'server-only';
import { cache } from 'react';
import { supabaseServidor } from './supabase-servidor';
import { renumerar } from '@/logica/numeracion';
import { TEMA_DEFECTO, configCartaDe } from '@/logica/tipos';
import type { Carta, Categoria, Cliente, Descuento, Item, MedioDePago, Modalidad, Tema, ZonaEnvio } from '@/logica/tipos';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fila = Record<string, any>;

function aTema(crudo: unknown): Tema {
  const t = (crudo ?? {}) as Partial<Tema>;
  return {
    colorFondo: t.colorFondo ?? TEMA_DEFECTO.colorFondo,
    colorTexto: t.colorTexto ?? TEMA_DEFECTO.colorTexto,
    colorTextoSuave: t.colorTextoSuave ?? TEMA_DEFECTO.colorTextoSuave,
    colorAcento: t.colorAcento ?? TEMA_DEFECTO.colorAcento,
    logoUrl: t.logoUrl,
  };
}

function aDescuento(crudo: unknown): Descuento {
  const d = (crudo ?? {}) as Partial<Descuento & { valor?: number }>;
  if (d.tipo === 'porcentaje' || d.tipo === 'monto') {
    return { tipo: d.tipo, valor: typeof d.valor === 'number' ? d.valor : 0 };
  }
  return { tipo: 'ninguno' };
}

export function aCliente(fila: Fila): Cliente {
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    plantilla: fila.plantilla ?? 'clasica',
    tema: aTema(fila.tema),
    activo: fila.activo,
    claveHash: fila.clave_panel_hash ?? null,
    notas: Array.isArray(fila.notas) ? fila.notas : [],
    cubiertoPorPersona: fila.cubierto_por_persona ?? 0,
    whatsapp: fila.whatsapp ?? '',
    modalidades: (Array.isArray(fila.modalidades) ? fila.modalidades : []) as Modalidad[],
    cabecera: fila.cabecera ?? '',
    mediosDePago: (Array.isArray(fila.medios_de_pago) ? fila.medios_de_pago : []) as MedioDePago[],
    zonasEnvio: (Array.isArray(fila.zonas_envio) ? fila.zonas_envio : []) as ZonaEnvio[],
    descuentoRetiro: aDescuento(fila.descuento_retiro),
  };
}

export function aCategoria(fila: Fila): Categoria {
  return {
    id: fila.id,
    nombre: fila.nombre,
    nombreEn: fila.nombre_en ?? '',
    orden: fila.orden,
    subcategorias: Array.isArray(fila.subcategorias) ? fila.subcategorias : [],
  };
}

export function aItem(fila: Fila): Item {
  return {
    id: fila.id,
    numero: 0, // se recalcula siempre con renumerar()
    nombre: fila.nombre,
    categoriaId: fila.categoria_id,
    subcategoria: fila.subcategoria ?? undefined,
    orden: fila.orden,
    precio: fila.precio,
    variantes: Array.isArray(fila.variantes) ? fila.variantes : [],
    agotado: fila.agotado,
    activo: fila.activo,
    piezas: fila.piezas ?? undefined,
    etiquetas: Array.isArray(fila.etiquetas) ? fila.etiquetas : [],
    descripcion: fila.descripcion ?? undefined,
    fotoUrl: fila.foto_url ?? undefined,
  };
}

/** El cliente por slug, o null si no existe o está dado de baja.
 *
 *  Sin cache de Next.js (`unstable_cache`): a diferencia de Firestore (cuota
 *  por lectura), Supabase no penaliza leer seguido, y así "cambiar un precio
 *  y verlo al instante" no depende de ninguna invalidación que haya que
 *  acordarse de disparar. `cache()` de React sí se usa, y por otro motivo:
 *  el layout y la página de `/[cliente]` piden el mismo cliente en el mismo
 *  render, y sin esto pegaría dos veces a la base por request. */
export const leerCliente = cache(async (slug: string): Promise<Cliente | null> => {
  const { data, error } = await supabaseServidor()
    .from('clientes')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  return data ? aCliente(data) : null;
});

/** La carta completa (categorías + ítems, ya renumerados) de un cliente. */
export async function leerCarta(cliente: Cliente): Promise<Carta> {
  const db = supabaseServidor();
  const [{ data: categoriasCrudas, error: e1 }, { data: itemsCrudos, error: e2 }] = await Promise.all([
    db.from('categorias').select('*').eq('cliente_id', cliente.id),
    db.from('items').select('*').eq('cliente_id', cliente.id),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  const categorias = (categoriasCrudas ?? []).map(aCategoria).sort((a, b) => a.orden - b.orden);
  const items = (itemsCrudos ?? []).map(aItem);

  return { categorias, items: renumerar(items, categorias), config: configCartaDe(cliente) };
}
