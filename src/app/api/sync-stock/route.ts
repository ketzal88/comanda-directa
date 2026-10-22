import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseServidor } from '@/datos/supabase-servidor';

/** El slug con el que Party Market está EN LA BASE (la URL pública es
 *  /party-market; ver `scripts/catalogo-halloween.ts` y
 *  `src/logica/slugs-renombrados.ts`). Hardcodeado y no importado de
 *  `scripts/` porque esos módulos no entran en el bundle del server. */
const SLUG_HALLOWEEN = 'piedro-shop';

/** Sincroniza el stock de Party Market con la planilla del cliente. Lee un CSV
 *  con dos columnas (Producto + Disponible) y, por cada producto de la carta,
 *  lo OCULTA (`activo = false`) cuando Disponible llega a 0 y lo vuelve a
 *  mostrar cuando hay stock. No toca precios, fotos ni descripciones: eso lo
 *  rehace el seed. No agrega ni borra productos; para cambiar el surtido se
 *  regenera el catálogo y se re-siembra.
 *
 *  Por qué un CSV y no la API de Google: el stock son dos columnas sin datos
 *  sensibles, así que alcanza con una pestaña chica de la planilla
 *  **publicada en la web** (Archivo → Compartir → Publicar en la web → esa
 *  hoja, formato CSV). No hace falta service account ni API key. La pestaña
 *  tiene SOLO "Producto" y "Disponible" (encabezado en la fila 1): nada del
 *  proveedor, ni precios, ni costos, queda público.
 *
 *  Lo dispara el cron de Vercel (ver `vercel.json`). Protegido con
 *  CRON_SECRET: Vercel manda `Authorization: Bearer <CRON_SECRET>`. Para
 *  dispararlo a mano, el mismo header:
 *    curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/sync-stock
 *
 *  Entorno (en Vercel): STOCK_CSV_URL (el link del CSV publicado), CRON_SECRET,
 *  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Mismo criterio que src/logica/precio.ts.
function parsearPrecio(texto: string | undefined): number | null {
  const limpio = String(texto ?? '').trim().replace(/[$\s]/g, '');
  if (!limpio) return null;
  const soloEnteros = limpio.split(',')[0].replace(/\./g, '');
  if (!/^\d+$/.test(soloEnteros)) return null;
  const valor = Number(soloEnteros);
  return Number.isFinite(valor) && valor >= 0 ? valor : null;
}

/** Parser de CSV que respeta comillas (un nombre con coma adentro no parte la
 *  fila). Devuelve filas de celdas. */
function parsearCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = '';
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { celda += '"'; i++; } else enComillas = false;
      } else celda += c;
      continue;
    }
    if (c === '"') enComillas = true;
    else if (c === ',') { fila.push(celda); celda = ''; }
    else if (c === '\n') { fila.push(celda); filas.push(fila); fila = []; celda = ''; }
    else if (c !== '\r') celda += c;
  }
  if (celda.length || fila.length) { fila.push(celda); filas.push(fila); }
  return filas;
}

/** Solo por header `Authorization: Bearer <CRON_SECRET>` (es el que manda el
 *  cron de Vercel). Nada de `?secret=`: un secreto en la URL queda en los logs
 *  y el historial. Comparación en tiempo constante. */
function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const esperado = Buffer.from(`Bearer ${secret}`);
  const recibido = Buffer.from(req.headers.get('authorization') ?? '');
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: 'no autorizado' }, { status: 401 });

  const csvUrl = process.env.STOCK_CSV_URL;
  if (!csvUrl) return NextResponse.json({ error: 'falta STOCK_CSV_URL' }, { status: 500 });

  // El CSV publicado de la pestaña Producto + Disponible.
  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: `no se pudo leer el CSV (HTTP ${res.status})` }, { status: 502 });
  }
  const filas = parsearCsv(await res.text());
  if (!filas.length) return NextResponse.json({ error: 'el CSV vino vacío' }, { status: 502 });

  // Se ubican las columnas por nombre de encabezado, así el orden de la
  // pestaña no importa.
  const encabezado = filas[0].map((c) => c.trim().toLowerCase());
  const iProducto = encabezado.indexOf('producto');
  const iDisponible = encabezado.indexOf('disponible');
  if (iProducto < 0 || iDisponible < 0) {
    return NextResponse.json(
      { error: 'el CSV tiene que tener columnas "Producto" y "Disponible"' },
      { status: 502 },
    );
  }

  const disponiblePorNombre = new Map<string, number>();
  for (const f of filas.slice(1)) {
    const nombre = (f[iProducto] ?? '').trim().toLowerCase();
    if (nombre) disponiblePorNombre.set(nombre, parsearPrecio(f[iDisponible]) ?? 0);
  }

  const db = supabaseServidor();
  const { data: cliente, error: eCliente } = await db
    .from('clientes').select('id').eq('slug', SLUG_HALLOWEEN).single();
  if (eCliente || !cliente) {
    return NextResponse.json({ error: 'cliente no encontrado' }, { status: 404 });
  }

  const { data: items, error: eItems } = await db
    .from('items').select('id,nombre,activo').eq('cliente_id', cliente.id);
  if (eItems) return NextResponse.json({ error: eItems.message }, { status: 502 });

  const ocultados: string[] = [];
  const mostrados: string[] = [];
  for (const it of items ?? []) {
    // Un producto que no está en el CSV no se toca: su ausencia puede ser un
    // nombre que no matchea, no un 0.
    const disp = disponiblePorNombre.get((it.nombre ?? '').trim().toLowerCase());
    if (disp === undefined) continue;
    const debeEstarVisible = disp > 0;
    if (debeEstarVisible === it.activo) continue;
    const { error } = await db.from('items').update({ activo: debeEstarVisible }).eq('id', it.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 502 });
    (debeEstarVisible ? mostrados : ocultados).push(it.nombre);
  }

  return NextResponse.json({
    ok: true,
    revisados: items?.length ?? 0,
    ocultados: ocultados.length,
    mostrados: mostrados.length,
    detalle: { ocultados, mostrados },
  });
}
