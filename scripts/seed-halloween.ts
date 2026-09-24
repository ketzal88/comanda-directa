import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import {
  CATALOGO_HALLOWEEN,
  CONFIG_PEDIDO_HALLOWEEN,
  NOMBRE_HALLOWEEN,
  PLANTILLA_HALLOWEEN,
  SLUG_HALLOWEEN,
  TEMA_HALLOWEEN,
} from './catalogo-halloween';

/** Da de alta (o vuelve a cargar) el catálogo de Halloween como un cliente
 *  más del motor: `/halloween` y su panel en `/halloween/panel`.
 *
 *  Es IDEMPOTENTE y DESTRUCTIVO para ese cliente: borra sus categorías e
 *  ítems y los vuelve a escribir desde `catalogo-halloween.ts`. Correrlo de
 *  nuevo después de que el cliente editó precios en el panel pisa esas
 *  ediciones — para cambios chicos, el panel; este script es para la carga
 *  inicial y para rehacer la lista entera. No toca ningún otro cliente.
 *
 *  La EXCEPCIÓN son las fotos: se rescatan por nombre antes de borrar y se
 *  vuelven a poner. Subirlas son 162 descargas y otros tantos uploads
 *  (`fotos-halloween.ts`), y perderlas por corregir un precio en esta tabla
 *  sería una trampa esperando a que alguien la pise.
 *
 *  La clave del panel NO vive en el repo: viene por entorno.
 *    CLAVE_PANEL=... npm run seed:halloween
 */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    'Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (¿corriste con --require ./scripts/cargar-env.cjs?)',
  );
  process.exit(1);
}

const clave = process.env.CLAVE_PANEL;
if (!clave || clave.length < 8) {
  console.error('Falta CLAVE_PANEL (mínimo 8 caracteres): es la clave con la que entra el cliente al panel.');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

function hash(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex');
}

const campos = {
  nombre: NOMBRE_HALLOWEEN,
  plantilla: PLANTILLA_HALLOWEEN,
  tema: TEMA_HALLOWEEN,
  notas: CATALOGO_HALLOWEEN.config.notas,
  cubierto_por_persona: CATALOGO_HALLOWEEN.config.cubiertoPorPersona,
  whatsapp: CONFIG_PEDIDO_HALLOWEEN.whatsapp,
  modalidades: CONFIG_PEDIDO_HALLOWEEN.modalidades,
  cabecera: CONFIG_PEDIDO_HALLOWEEN.cabecera,
  medios_de_pago: CONFIG_PEDIDO_HALLOWEEN.mediosDePago,
  zonas_envio: CONFIG_PEDIDO_HALLOWEEN.zonasEnvio,
  descuento_retiro: CONFIG_PEDIDO_HALLOWEEN.descuentoRetiro,
  clave_panel_hash: hash(clave),
  activo: true,
};

async function main() {
  const { data: existente, error: eBusca } = await db
    .from('clientes')
    .select('id')
    .eq('slug', SLUG_HALLOWEEN)
    .maybeSingle();
  if (eBusca) throw eBusca;

  let clienteId = existente?.id as string | undefined;

  // nombre del producto -> foto ya subida, para no perderlas en el borrado
  const fotos = new Map<string, string>();

  if (clienteId) {
    const { error } = await db.from('clientes').update(campos).eq('id', clienteId);
    if (error) throw error;

    const { data: previos } = await db
      .from('items')
      .select('nombre,foto_url')
      .eq('cliente_id', clienteId)
      .not('foto_url', 'is', null);
    for (const p of previos ?? []) fotos.set(p.nombre, p.foto_url);

    // Arranca de cero: los ítems cuelgan de las categorías por FK, así que
    // se borran primero.
    await db.from('items').delete().eq('cliente_id', clienteId);
    await db.from('categorias').delete().eq('cliente_id', clienteId);
  } else {
    const { data, error } = await db
      .from('clientes')
      .insert({ slug: SLUG_HALLOWEEN, ...campos })
      .select('id')
      .single();
    if (error) throw error;
    clienteId = data.id;
  }

  // Los ids de `catalogo-halloween.ts` son legibles ('infantiles', 'medusa');
  // los de la base son uuid. Este mapa traduce de uno al otro.
  const idsCategoria = new Map<string, string>();
  for (const c of CATALOGO_HALLOWEEN.categorias) {
    const { data, error } = await db
      .from('categorias')
      .insert({
        cliente_id: clienteId,
        nombre: c.nombre,
        nombre_en: c.nombreEn,
        orden: c.orden,
        subcategorias: c.subcategorias,
      })
      .select('id')
      .single();
    if (error) throw error;
    idsCategoria.set(c.id, data.id);
  }

  const filas = CATALOGO_HALLOWEEN.items.map((item) => {
    const categoriaId = idsCategoria.get(item.categoriaId);
    if (!categoriaId) throw new Error(`El ítem "${item.nombre}" apunta a una categoría que no existe`);
    return {
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
      foto_url: item.fotoUrl ?? fotos.get(item.nombre) ?? null,
    };
  });

  const { error: eItems } = await db.from('items').insert(filas);
  if (eItems) throw eItems;

  const conFoto = filas.filter((f) => f.foto_url).length;
  console.log(
    `Listo: /${SLUG_HALLOWEEN} — ${CATALOGO_HALLOWEEN.categorias.length} categorías, ${filas.length} productos, ${conFoto} con foto.`,
  );
  if (conFoto < filas.length) {
    console.log(`Faltan ${filas.length - conFoto} fotos: npm run fotos:halloween -- --faltantes`);
  }
  console.log(`Panel en /${SLUG_HALLOWEEN}/panel con la clave que pasaste en CLAVE_PANEL.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
