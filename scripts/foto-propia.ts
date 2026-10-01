import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import WebSocket from 'ws';
import { CARPETA_FOTOS, CATALOGO_HALLOWEEN, SLUG_HALLOWEEN } from './catalogo-halloween';

/** Sube una foto que mandó el cliente (no sale del mayorista: los combos, por
 *  ejemplo) y la deja en `items.foto_url` del producto con ese nombre.
 *
 *    npm run foto:halloween -- <archivo> "<nombre en la carta>"
 *
 *  Mismo tratamiento que `fotos-halloween.ts` (mini de 360 + grande de 900,
 *  cuadradas sobre blanco), así la carta no distingue de dónde vino. El seed
 *  rescata las fotos por nombre, así que sobrevive a una recarga del catálogo. */

const [archivo, nombre] = process.argv.slice(2);
if (!archivo || !nombre) {
  console.error('Uso: npm run foto:halloween -- <archivo> "<nombre en la carta>"');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

const FONDO = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 };
const MEDIDAS = [
  { lado: 360, calidad: 65, sufijo: '' },
  { lado: 900, calidad: 72, sufijo: '@900' },
] as const;

async function main() {
  const item = CATALOGO_HALLOWEEN.items.find((i) => i.nombre === nombre);
  if (!item) throw new Error(`"${nombre}" no está en el catálogo.`);

  const { data: cliente, error: eCliente } = await db
    .from('clientes')
    .select('id')
    .eq('slug', SLUG_HALLOWEEN)
    .single();
  if (eCliente) throw eCliente;

  const original = await readFile(archivo);
  let urlMini = '';
  for (const { lado, calidad, sufijo } of MEDIDAS) {
    const webp = await sharp(original)
      .resize(lado, lado, { fit: 'contain', background: FONDO })
      .flatten({ background: FONDO })
      .webp({ quality: calidad })
      .toBuffer();
    const ruta = `${CARPETA_FOTOS}/${item.id}${sufijo}.webp`;
    const { error } = await db.storage
      .from('fotos')
      .upload(ruta, webp, { contentType: 'image/webp', upsert: true });
    if (error) throw error;
    if (!sufijo) urlMini = db.storage.from('fotos').getPublicUrl(ruta).data.publicUrl;
  }

  const { data, error } = await db
    .from('items')
    .update({ foto_url: urlMini })
    .eq('cliente_id', cliente.id)
    .eq('nombre', nombre)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error(`"${nombre}" no está en la base: corré antes el seed.`);
  console.log(`✓ ${nombre} → ${urlMini}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
