import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import WebSocket from 'ws';
import { CARPETA_FOTOS, CATALOGO_HALLOWEEN, FUENTES, SLUG_HALLOWEEN } from './catalogo-halloween';

/** Baja la foto de cada producto de la **store API pública del proveedor**, la
 *  normaliza y la sube a NUESTRO Supabase Storage; después deja la URL pública
 *  (la de nuestro bucket) en `items.foto_url`. La foto nunca queda enlazada al
 *  dominio del proveedor: se descarga y se re-sube.
 *
 *  Por qué a Storage y no a `public/` del repo: las fotos son de UN cliente y
 *  el repo es el motor de todos. Noventa imágenes en `public/` las arrastra
 *  cada build y cada deploy de cualquier otro cliente, para siempre.
 *
 *  Normalizar es lo que hace que la carta no parezca un collage: el proveedor
 *  sube fotos de cualquier tamaño y proporción. Acá todas terminan cuadradas,
 *  del mismo lado, sobre el mismo fondo blanco y con el mismo peso aproximado.
 *
 *  Es reentrante: volver a correrlo re-baja y pisa. Con `--faltantes` sólo
 *  toca las que no tienen foto todavía, que es lo que conviene cuando una
 *  sola falló.
 */

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

const BUCKET = 'fotos';

/** Dos tamaños por producto, y no uno. Un catálogo se scrollea entero: con una
 *  sola foto de 900px, ver los 90 productos son megas de datos móviles. La
 *  `mini` (360px) es la de la grilla y la `grande` (900px) se baja recién
 *  cuando alguien abre el modal. `foto_url` guarda la mini; la grande se
 *  deduce con el sufijo (ver `fotoGrande()` en la plantilla). */
const MEDIDAS = [
  { lado: 360, calidad: 65, sufijo: '' },
  { lado: 900, calidad: 72, sufijo: '@900' },
] as const;

/** Blanco, el mismo color del recuadro donde se muestra la foto (la tarjeta y
 *  el modal son blancos). Con dos blancos distintos se vería una banda en cada
 *  foto que no sea cuadrada, que son casi todas. */
const FONDO = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 };

const soloFaltantes = process.argv.includes('--faltantes');

const NAVEGADOR = {
  'user-agent': 'Mozilla/5.0 (compatible; party-market-catalogo)',
};

const API = (slug: string) =>
  `https://mayoristas.merakys.com.ar/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`;

/** La primera foto del producto en la store API. Null si la ficha no existe o
 *  no trae imágenes. Se toma `src` (la grande), no `thumbnail`. */
async function fotoDeLaApi(slug: string): Promise<string | null> {
  const res = await fetch(API(slug), { headers: NAVEGADOR });
  if (!res.ok) return null;
  const arr = (await res.json()) as Array<{ slug: string; images?: Array<{ src?: string }> }>;
  if (!Array.isArray(arr) || !arr.length) return null;
  const prod = arr.find((x) => x.slug === slug) ?? arr[0];
  return prod.images?.[0]?.src ?? null;
}

async function normalizar(bytes: ArrayBuffer, lado: number, calidad: number): Promise<Buffer> {
  return sharp(Buffer.from(bytes))
    .resize(lado, lado, { fit: 'contain', background: FONDO })
    .flatten({ background: FONDO })
    .webp({ quality: calidad })
    .toBuffer();
}

async function main() {
  // El bucket es público: son fotos de catálogo, las ve cualquiera que abra la
  // carta. Sin esto habría que firmar una URL por imagen por request.
  const { error: eBucket } = await db.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '5MB',
  });
  if (eBucket && !/already exists/i.test(eBucket.message)) throw eBucket;

  const { data: cliente, error: eCliente } = await db
    .from('clientes')
    .select('id')
    .eq('slug', SLUG_HALLOWEEN)
    .single();
  if (eCliente) throw eCliente;

  const { data: filas, error: eItems } = await db
    .from('items')
    .select('id,nombre,foto_url')
    .eq('cliente_id', cliente.id);
  if (eItems) throw eItems;

  // La base guarda uuid; el catálogo, ids legibles (que son el slug). El
  // nombre es lo único que comparten, y no se repite.
  const idPorNombre = new Map(CATALOGO_HALLOWEEN.items.map((i) => [i.nombre, i.id]));

  let subidas = 0;
  const fallaron: string[] = [];

  for (const fila of filas) {
    const idCatalogo = idPorNombre.get(fila.nombre);
    const slug = idCatalogo ? FUENTES[idCatalogo] : undefined;
    if (!idCatalogo || !slug) {
      fallaron.push(`${fila.nombre} (sin fuente)`);
      continue;
    }
    if (soloFaltantes && fila.foto_url) continue;

    try {
      const origen = await fotoDeLaApi(slug);
      if (!origen) throw new Error('la ficha no tiene foto en la store API');

      const descarga = await fetch(origen, { headers: NAVEGADOR });
      if (!descarga.ok) throw new Error(`descarga HTTP ${descarga.status}`);

      const original = await descarga.arrayBuffer();
      let urlMini = '';
      let pesos = '';

      for (const { lado, calidad, sufijo } of MEDIDAS) {
        const webp = await normalizar(original, lado, calidad);
        const ruta = `${CARPETA_FOTOS}/${idCatalogo}${sufijo}.webp`;

        const { error: eSubida } = await db.storage
          .from(BUCKET)
          .upload(ruta, webp, { contentType: 'image/webp', upsert: true });
        if (eSubida) throw eSubida;

        if (!sufijo) urlMini = db.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
        pesos += `${pesos ? ' + ' : ''}${Math.round(webp.length / 1024)} KB`;
      }

      const { error: eUpdate } = await db.from('items').update({ foto_url: urlMini }).eq('id', fila.id);
      if (eUpdate) throw eUpdate;

      subidas++;
      console.log(`  ✓ ${fila.nombre} — ${pesos}`);
    } catch (err) {
      fallaron.push(`${fila.nombre}: ${(err as Error).message}`);
      console.log(`  ✗ ${fila.nombre} — ${(err as Error).message}`);
    }
  }

  console.log(`\nSubidas: ${subidas} de ${filas.length}`);
  if (fallaron.length) {
    console.log(`Sin foto (${fallaron.length}):`);
    for (const f of fallaron) console.log(`  - ${f}`);
    console.log('\nPara reintentar sólo esas: npm run fotos:halloween -- --faltantes');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
