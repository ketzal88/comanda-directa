import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { CATALOGO_HALLOWEEN, SLUG_HALLOWEEN } from './catalogo-halloween';

/** Suma a Party Market los productos del catálogo que la base todavía no
 *  tiene, SIN tocar los que ya están.
 *
 *  Existe porque `seed-halloween.ts` borra y reescribe todo: desde el
 *  back-office el stock vive en la base y las ventas de `/panel/armar` lo
 *  descuentan, así que re-sembrar para agregar un producto pisaría el stock
 *  vendido y los precios editados en `/panel/stock`. Acá sólo se inserta.
 *
 *  El cruce es por nombre (igual que las fotos en el seed y en
 *  `fotos-halloween.ts`). Un producto que ya existe no se actualiza aunque
 *  cambie en la planilla: para eso está el panel.
 *
 *    npm run sumar:halloween -- --ver   (sólo lista lo que insertaría)
 *    npm run sumar:halloween
 *    npm run fotos:halloween -- --faltantes
 */

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    'Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (¿corriste con --require ./scripts/cargar-env.cjs?)',
  );
  process.exit(1);
}

const soloVer = process.argv.includes('--ver');

const db = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

const clave = (nombre: string) => nombre.trim().toLowerCase();

async function main() {
  const { data: cliente, error: eCliente } = await db
    .from('clientes')
    .select('id')
    .eq('slug', SLUG_HALLOWEEN)
    .single();
  if (eCliente) throw eCliente;
  const clienteId = cliente.id as string;

  const [{ data: cats, error: eCats }, { data: previos, error: ePrevios }] = await Promise.all([
    db.from('categorias').select('id,nombre,orden').eq('cliente_id', clienteId),
    db.from('items').select('nombre,categoria_id,orden').eq('cliente_id', clienteId),
  ]);
  if (eCats) throw eCats;
  if (ePrevios) throw ePrevios;

  const yaEstan = new Set((previos ?? []).map((p) => clave(p.nombre)));
  const nuevos = CATALOGO_HALLOWEEN.items.filter((i) => !yaEstan.has(clave(i.nombre)));

  if (!nuevos.length) {
    console.log('No hay productos nuevos: la base ya tiene todo el catálogo.');
    return;
  }

  // Las categorías se cruzan por nombre publicado: en la base son uuid y en
  // el catálogo ids legibles. Si falta una, se crea al final.
  const idPorNombre = new Map((cats ?? []).map((c) => [c.nombre as string, c.id as string]));
  let ultimoOrdenCat = Math.max(0, ...(cats ?? []).map((c) => c.orden as number));
  const ultimoOrden = new Map<string, number>();
  for (const p of previos ?? []) {
    ultimoOrden.set(p.categoria_id, Math.max(ultimoOrden.get(p.categoria_id) ?? 0, p.orden));
  }

  console.log(`${nuevos.length} producto(s) nuevo(s):`);
  for (const i of nuevos) {
    console.log(`  + ${i.nombre} — $${i.precio.toLocaleString('es-AR')} — stock ${i.stock ?? '-'}`);
  }
  if (soloVer) {
    console.log('\n(--ver: no se insertó nada)');
    return;
  }

  const filas = [];
  for (const item of nuevos) {
    const cat = CATALOGO_HALLOWEEN.categorias.find((c) => c.id === item.categoriaId);
    if (!cat) throw new Error(`El ítem "${item.nombre}" apunta a una categoría que no existe`);

    let categoriaId = idPorNombre.get(cat.nombre);
    if (!categoriaId) {
      const { data, error } = await db
        .from('categorias')
        .insert({
          cliente_id: clienteId,
          nombre: cat.nombre,
          nombre_en: cat.nombreEn,
          orden: ++ultimoOrdenCat,
          subcategorias: cat.subcategorias,
        })
        .select('id')
        .single();
      if (error) throw error;
      categoriaId = data.id as string;
      idPorNombre.set(cat.nombre, categoriaId);
      console.log(`  (categoría nueva: ${cat.nombre})`);
    }

    const orden = (ultimoOrden.get(categoriaId) ?? 0) + 1;
    ultimoOrden.set(categoriaId, orden);

    filas.push({
      cliente_id: clienteId,
      categoria_id: categoriaId,
      nombre: item.nombre,
      subcategoria: item.subcategoria ?? null,
      orden,
      precio: item.precio,
      variantes: item.variantes,
      agotado: item.agotado,
      activo: item.activo,
      piezas: item.piezas ?? null,
      etiquetas: item.etiquetas,
      descripcion: item.descripcion ?? null,
      foto_url: item.fotoUrl ?? null,
      stock: item.stock ?? null,
      costo: item.costo ?? 0,
      margen: item.margen ?? 0,
      tipo_stock: item.tipoStock ?? 'propio',
    });
  }

  const { error } = await db.from('items').insert(filas);
  if (error) throw error;

  console.log(`\nListo: ${filas.length} insertado(s) en /${SLUG_HALLOWEEN}, sin tocar los existentes.`);
  console.log('Fotos: npm run fotos:halloween -- --faltantes');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
