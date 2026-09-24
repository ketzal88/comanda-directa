import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import WebSocket from 'ws';
import {
  CARPETA_FOTOS,
  CATALOGO_HALLOWEEN,
  FUENTES,
  SLUG_HALLOWEEN,
  URL_PRODUCTO,
} from './catalogo-halloween';

/** Baja la foto de cada producto de la página del mayorista, la normaliza y
 *  la sube a Supabase Storage; después deja la URL pública en `items.foto_url`.
 *
 *  Por qué a Storage y no a `public/` del repo: las fotos son de UN cliente y
 *  el repo es el motor de todos. Ochenta imágenes en `public/` las arrastra
 *  cada build y cada deploy de cualquier otro cliente, para siempre.
 *
 *  Normalizar es lo que hace que la carta no parezca un collage: el mayorista
 *  sube fotos de cualquier tamaño y proporción. Acá todas terminan cuadradas,
 *  del mismo lado, sobre el mismo fondo y con el mismo peso aproximado.
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

/** Dos tamaños por producto, y no uno.
 *
 *  Un catálogo se scrollea entero: con una sola foto de 900px, ver los 81
 *  productos son ~2,3 MB de datos móviles. La `mini` es la que va en la
 *  grilla (81 × ~8 KB) y la `grande` se baja recién cuando alguien abre el
 *  modal, de a una.
 *
 *  Supabase Storage no transforma imágenes en el plan gratuito, así que los
 *  dos tamaños se suben hechos. `foto_url` guarda la mini —es la que muestra
 *  la carta, y es lo que el panel espera en ese campo—; la grande se deduce
 *  con `SUFIJO_GRANDE` (ver `fotoGrande()` en la plantilla). */
const MEDIDAS = [
  { lado: 360, calidad: 65, sufijo: '' },
  { lado: 900, calidad: 72, sufijo: '@900' },
] as const;
/** Blanco, y no el crema del flyer: el relleno que se hornea acá tiene que
 *  ser EL MISMO color que el recuadro donde se muestra la foto (la tarjeta y
 *  el modal son blancos, ver `.halloween-tarjeta`). Con dos blancos distintos
 *  se ve una banda de otro tono en cada foto que no sea cuadrada, que son
 *  casi todas. El crema es el papel de la página, no el de la foto. */
const FONDO = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 };

const soloFaltantes = process.argv.includes('--faltantes');

const NAVEGADOR = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
};

/** `og:image` es la foto que el mayorista eligió mostrar cuando alguien
 *  comparte el link: es la del producto y no una miniatura de "productos
 *  relacionados". Null si la página no existe o no la declara. */
async function ogImage(urlPagina: string): Promise<string | null> {
  const res = await fetch(urlPagina, { headers: NAVEGADOR });
  if (!res.ok) return null;
  const html = await res.text();
  return html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ?? null;
}

/** Un cuarto de los links de la lista original da 404: el mayorista renombró
 *  las páginas ("plato-boo-x-6-unidades" hoy es "plato-boo-halloween"). El
 *  buscador del sitio redirige al producto cuando hay una coincidencia
 *  clara, así que sirve de plan B contra el NOMBRE, que no cambió.
 *
 *  Se le saca la cola de cantidad ("x6", "x 20 unidades"): no es parte del
 *  nombre del producto y ensucia la búsqueda. */
async function buscarPorNombre(nombre: string): Promise<{ url: string; foto: string } | null> {
  const consulta = nombre.replace(/\s+x\s*\d+.*$/i, '').trim();
  const busqueda = `https://mayoristas.merakys.com.ar/?s=${encodeURIComponent(consulta)}&post_type=product`;

  const res = await fetch(busqueda, { headers: NAVEGADOR, redirect: 'follow' });
  if (!res.ok) return null;
  const html = await res.text();

  // Si redirigió derecho a una ficha, esa es. Si cayó en el listado, se toma
  // el primer resultado — el buscador ordena por relevancia.
  const candidata = /\/producto\/[a-z0-9-]+\/?$/.test(new URL(res.url).pathname)
    ? res.url
    : html.match(/https:\/\/mayoristas\.merakys\.com\.ar\/producto\/[a-z0-9-]+\//)?.[0];
  if (!candidata) return null;

  const foto = candidata === res.url
    ? (html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ?? null)
    : await ogImage(candidata);
  return foto ? { url: candidata, foto } : null;
}

async function normalizar(bytes: ArrayBuffer, lado: number, calidad: number): Promise<Buffer> {
  return sharp(Buffer.from(bytes))
    .resize(lado, lado, { fit: 'contain', background: FONDO })
    .flatten({ background: FONDO })
    .webp({ quality: calidad })
    .toBuffer();
}

async function main() {
  // El bucket es público: son fotos de catálogo, las ve cualquiera que abra
  // la carta. Sin esto habría que firmar una URL por imagen por request.
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

  // La base guarda uuid; el catálogo, ids legibles. El nombre es lo único que
  // comparten, y no se repite (lo verifica `pruebas/catalogo-halloween.test.ts`).
  const idPorNombre = new Map(CATALOGO_HALLOWEEN.items.map((i) => [i.nombre, i.id]));

  let subidas = 0;
  const fallaron: string[] = [];

  for (const fila of filas) {
    const idCatalogo = idPorNombre.get(fila.nombre);
    const slugProveedor = idCatalogo ? FUENTES[idCatalogo] : undefined;
    if (!idCatalogo || !slugProveedor) {
      fallaron.push(`${fila.nombre} (sin fuente)`);
      continue;
    }
    if (soloFaltantes && fila.foto_url) continue;

    try {
      let origen = await ogImage(URL_PRODUCTO(slugProveedor));
      let reubicado = '';
      if (!origen) {
        const hallado = await buscarPorNombre(fila.nombre);
        if (!hallado) throw new Error('no está en el sitio ni por link ni por búsqueda');
        origen = hallado.foto;
        reubicado = ` (reubicado: ${new URL(hallado.url).pathname})`;
      }

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

      const { error: eUpdate } = await db
        .from('items')
        .update({ foto_url: urlMini })
        .eq('id', fila.id);
      if (eUpdate) throw eUpdate;

      subidas++;
      console.log(`  ✓ ${fila.nombre} — ${pesos}${reubicado}`);
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
