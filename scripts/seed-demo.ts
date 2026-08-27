import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { CARTA_MUESTRA, CONFIG_PEDIDO_MUESTRA } from '../src/fixtures/carta-muestra';

/** Crea (o reemplaza) el cliente `demo`, con la carta de muestra, para
 *  probar el motor de punta a punta contra Supabase de verdad antes de dar
 *  de alta un cliente real. Clave del panel: `demo1234`. */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (¿corriste con --require ./scripts/cargar-env.cjs?)');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

function hash(clave: string): string {
  return createHash('sha256').update(clave, 'utf8').digest('hex');
}

async function main() {
  const slug = 'demo';
  const claveDemo = 'demo1234';

  const { data: existente } = await db.from('clientes').select('id').eq('slug', slug).maybeSingle();
  let clienteId = existente?.id as string | undefined;

  if (clienteId) {
    await db
      .from('clientes')
      .update({
        nombre: 'Comanda Directa (demo)',
        notas: CARTA_MUESTRA.config.notas,
        cubierto_por_persona: CARTA_MUESTRA.config.cubiertoPorPersona,
        whatsapp: CONFIG_PEDIDO_MUESTRA.whatsapp,
        modalidades: CONFIG_PEDIDO_MUESTRA.modalidades,
        medios_de_pago: CONFIG_PEDIDO_MUESTRA.mediosDePago,
        zonas_envio: CONFIG_PEDIDO_MUESTRA.zonasEnvio,
        descuento_retiro: CONFIG_PEDIDO_MUESTRA.descuentoRetiro,
        clave_panel_hash: hash(claveDemo),
        activo: true,
      })
      .eq('id', clienteId);
    // arranca de cero: borra categorías/ítems viejos del demo antes de recargar
    await db.from('items').delete().eq('cliente_id', clienteId);
    await db.from('categorias').delete().eq('cliente_id', clienteId);
  } else {
    const { data, error } = await db
      .from('clientes')
      .insert({
        slug,
        nombre: 'Comanda Directa (demo)',
        plantilla: 'clasica',
        tema: {},
        notas: CARTA_MUESTRA.config.notas,
        cubierto_por_persona: CARTA_MUESTRA.config.cubiertoPorPersona,
        whatsapp: CONFIG_PEDIDO_MUESTRA.whatsapp,
        modalidades: CONFIG_PEDIDO_MUESTRA.modalidades,
        medios_de_pago: CONFIG_PEDIDO_MUESTRA.mediosDePago,
        zonas_envio: CONFIG_PEDIDO_MUESTRA.zonasEnvio,
        descuento_retiro: CONFIG_PEDIDO_MUESTRA.descuentoRetiro,
        clave_panel_hash: hash(claveDemo),
      })
      .select('id')
      .single();
    if (error) throw error;
    clienteId = data.id;
  }

  const idsCategoria = new Map<string, string>();
  for (const c of CARTA_MUESTRA.categorias) {
    const { data, error } = await db
      .from('categorias')
      .insert({ cliente_id: clienteId, nombre: c.nombre, nombre_en: c.nombreEn, orden: c.orden, subcategorias: c.subcategorias })
      .select('id')
      .single();
    if (error) throw error;
    idsCategoria.set(c.id, data.id);
  }

  for (const item of CARTA_MUESTRA.items) {
    const categoriaId = idsCategoria.get(item.categoriaId);
    if (!categoriaId) continue;
    const { error } = await db.from('items').insert({
      cliente_id: clienteId,
      categoria_id: categoriaId,
      nombre: item.nombre,
      subcategoria: item.subcategoria ?? null,
      orden: item.orden,
      precio: item.precio,
      variantes: item.variantes,
      agotado: item.agotado,
      activo: item.activo,
      piezas: item.piezas ?? null,
      etiquetas: item.etiquetas,
      descripcion: item.descripcion ?? null,
    });
    if (error) throw error;
  }

  console.log(`Listo: /${slug} — panel en /${slug}/panel con la clave "${claveDemo}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
