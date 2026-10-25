import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSign } from 'node:crypto';

/** Regenera `scripts/data/party-market.json` leyendo la hoja "Catálogo" de la
 *  planilla del cliente por la API de Google Sheets. Es el comando de
 *  actualización del surtido: cuando el cliente suma o saca productos (no sólo
 *  mueve stock), se corre esto y se vuelve a sembrar.
 *
 *    npm run traer:planilla
 *
 *  Por qué la API y no un CSV: el link de cada ficha (columna I) es un
 *  hyperlink ESCONDIDO atrás del texto "Ver ficha". Un export a CSV se lo come;
 *  la API lo devuelve en el campo `hyperlink` de la celda. Ese link es la
 *  llave para bajar la foto.
 *
 *  Autenticación: un service account de Google con la planilla compartida en
 *  modo lectura. Las credenciales viajan por entorno, NO por el repo:
 *    GOOGLE_SA_EMAIL=...        (client_email del service account)
 *    GOOGLE_SA_PRIVATE_KEY=...  (private_key, con los \n reales o escapados)
 *  El id de la planilla sale de PLANILLA_ID o del valor por defecto de abajo.
 *
 *  Regla de corte (idéntica a la del pedido del cliente): entra lo que tiene
 *  Disponible (col L) > 0 y precio efectivo (col E). Fuera los dos que el
 *  cliente marcó sin ficha y el rubro Cumpleaños. */

const PLANILLA_ID = process.env.PLANILLA_ID ?? '1NrjjQeQIDaHqJzXnZ36PneYNqmgaMDe-1sq2x7umS1k';
const HOJA = 'Catálogo';
// Fila 7 encabezados, de la 8 en adelante productos. Con margen: la hoja ya
// pasó la fila 125 (el 25/10 llegaba a la 135) y lo que quedaba abajo del
// rango no entraba nunca. Las filas vacías del final se caen solas por no
// tener precio.
const ULTIMA_FILA = 300;
const RANGO = `${HOJA}!A7:L${ULTIMA_FILA}`;

const EXCLUIDOS = new Set(['Lápida con Luz y Sonido', 'Vincha con Calabaza LED']);
const GRUPOS_FUERA = new Set(['Cumpleaños']);

/** Nombre en la planilla → nombre publicado, para las filas que el cliente
 *  cargó a mano sin tildes ni mayúsculas. Va acá y no se corrige en la
 *  planilla porque la planilla es del cliente. Importa que sea estable: el
 *  seed rescata las fotos por nombre. */
const RENOMBRES: Record<string, string> = {
  'Mascara La parca': 'Máscara La Parca',
  'Mascara Bruja con pañuelo': 'Máscara Bruja con Pañuelo',
  'Masacra Mujer gato (gatubela)': 'Máscara Látex Mujer Gato (Gatubela)',
  'Mascara Payaso Siniestro Terrifier': 'Máscara Payaso Siniestro (Terrifier)',
  'Disfraz para mascota murcielago': 'Disfraz Murciélago para Mascotas',
  'Disfraz vaquita XSS Bebes': 'Disfraz Vaquita Bebé Talle XXS (6 meses a 2 años)',
  'Disfraz inflable adulto Dinosaurio': 'Disfraz Inflable Dinosaurio Adulto',
  'Mucama Infernal Animatronic': 'Mucama Infernal (animatronic)',
  'Alas de angel color rojo': 'Alas de Ángel Rojas',
  'Guantes satinado rojo': 'Guantes Satinados Rojos Largos',
};

const EMAIL = process.env.GOOGLE_SA_EMAIL;
const CLAVE = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (!EMAIL || !CLAVE) {
  console.error(
    'Faltan GOOGLE_SA_EMAIL / GOOGLE_SA_PRIVATE_KEY: son las credenciales del service account con la planilla compartida en lectura.',
  );
  process.exit(1);
}

function base64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Un access token de Google a partir del service account (flujo JWT bearer),
 *  hecho a mano con node:crypto para no sumar la dependencia de googleapis. */
async function accessToken(): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: ahora,
      exp: ahora + 3600,
    }),
  );
  const firma = base64url(createSign('RSA-SHA256').update(`${header}.${claims}`).sign(CLAVE!));
  const jwt = `${header}.${claims}.${firma}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(`No se pudo autenticar con Google: ${data.error_description ?? res.status}`);
  }
  return data.access_token;
}

type Celda = { formattedValue?: string; hyperlink?: string };

async function leerPlanilla(token: string): Promise<{ valores: string[][]; fichas: (string | null)[] }> {
  const auth = { authorization: `Bearer ${token}` };

  // Valores de todo el rango.
  const rv = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${PLANILLA_ID}/values/${encodeURIComponent(RANGO)}`,
    { headers: auth },
  );
  const dv = (await rv.json()) as { values?: string[][]; error?: { message: string } };
  if (!rv.ok || !dv.values) throw new Error(`No se pudieron leer los valores: ${dv.error?.message ?? rv.status}`);

  // Hyperlinks de la columna Ficha (I), con grid data.
  const rh = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${PLANILLA_ID}?ranges=${encodeURIComponent(
      `${HOJA}!I8:I${ULTIMA_FILA}`,
    )}&includeGridData=true&fields=${encodeURIComponent('sheets.data.rowData.values.hyperlink')}`,
    { headers: auth },
  );
  const dh = (await rh.json()) as {
    sheets?: Array<{ data?: Array<{ rowData?: Array<{ values?: Celda[] }> }> }>;
    error?: { message: string };
  };
  if (!rh.ok) throw new Error(`No se pudieron leer las fichas: ${dh.error?.message ?? rh.status}`);
  const rowData = dh.sheets?.[0]?.data?.[0]?.rowData ?? [];
  const fichas = rowData.map((r) => r.values?.[0]?.hyperlink ?? null);

  return { valores: dv.values, fichas };
}

// Mismo criterio que src/logica/precio.ts.
function parsearPrecio(texto: string | undefined): number | null {
  const limpio = String(texto ?? '').trim().replace(/[$\s]/g, '');
  if (!limpio) return null;
  const soloEnteros = limpio.split(',')[0].replace(/\./g, '');
  if (!/^\d+$/.test(soloEnteros)) return null;
  const valor = Number(soloEnteros);
  return Number.isFinite(valor) && valor >= 0 ? valor : null;
}

function slugDeFicha(url: string | null): string | null {
  const m = String(url ?? '').match(/\/producto\/([^/]+)\/?$/);
  return m ? m[1] : null;
}

/** La descripción del producto, de la store API pública. HTML a texto plano,
 *  sin nada que mencione al proveedor, hasta 300 caracteres. */
function limpiarDescripcion(html: string | undefined): string {
  if (!html) return '';
  let t = String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/\s+/g, ' ')
    .trim();
  if (/merakys/i.test(t)) t = '';
  return t.length > 300 ? t.slice(0, 297).trimEnd() + '…' : t;
}

async function descripcionDe(slug: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://mayoristas.merakys.com.ar/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`,
      { headers: { 'user-agent': 'Mozilla/5.0 (compatible; party-market-catalogo)' } },
    );
    if (!res.ok) return undefined;
    const arr = (await res.json()) as Array<{ slug: string; short_description?: string; description?: string }>;
    const prod = Array.isArray(arr) ? arr.find((x) => x.slug === slug) ?? arr[0] : null;
    if (!prod) return undefined;
    return limpiarDescripcion(prod.short_description) || limpiarDescripcion(prod.description) || undefined;
  } catch {
    return undefined;
  }
}

async function main() {
  const token = await accessToken();
  const { valores, fichas } = await leerPlanilla(token);

  const filas = valores.slice(1); // [0] es el encabezado (fila 7)
  // Las dos lecturas arrancan en la fila 8, así que sólo pueden diferir al
  // final: la de valores corta en la última fila con algo y la de grid data
  // puede traer filas vacías de más. Lo que no puede haber es un link de
  // ficha sin su fila de datos.
  const huerfanas = fichas.slice(filas.length).filter(Boolean);
  if (huerfanas.length) {
    throw new Error(`Desalineados: ${filas.length} filas de datos y ${huerfanas.length} fichas sueltas abajo`);
  }

  type Producto = { grupo: string; nombre: string; efectivo: number; tarjeta: number; disponible: number; slug: string; descripcion?: string };
  const productos: Producto[] = [];
  const sinFicha: string[] = [];

  filas.forEach((f, i) => {
    const grupo = f[0];
    const crudo = String(f[1] ?? '').trim();
    const nombre = RENOMBRES[crudo] ?? crudo;
    const efectivo = parsearPrecio(f[4]);
    const tarjeta = parsearPrecio(f[5]);
    const disponible = parsearPrecio(f[11]) ?? 0;
    const slug = slugDeFicha(fichas[i] ?? null);

    if (EXCLUIDOS.has(nombre) || GRUPOS_FUERA.has(grupo)) return;
    if (disponible <= 0 || efectivo == null || tarjeta == null) return;
    if (!slug) { sinFicha.push(nombre); return; }

    productos.push({ grupo, nombre, efectivo, tarjeta, disponible, slug });
  });

  // Descripciones de la store API, en serie (son ~90 y la API no es nuestra).
  process.stdout.write('Trayendo descripciones');
  for (const p of productos) {
    const d = await descripcionDe(p.slug);
    if (d) p.descripcion = d;
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  const salida = {
    fuente: 'Planilla del cliente, hoja "Catálogo" — solo productos con stock disponible.',
    generado: new Date().toISOString().slice(0, 10),
    productos,
  };
  const ruta = join(import.meta.dirname, 'data', 'party-market.json');
  writeFileSync(ruta, JSON.stringify(salida, null, 2) + '\n');

  const porGrupo: Record<string, number> = {};
  for (const p of productos) porGrupo[p.grupo] = (porGrupo[p.grupo] ?? 0) + 1;
  console.log(`Productos con stock: ${productos.length}`);
  console.log('Por grupo:', porGrupo);
  if (sinFicha.length) console.log('OJO con stock+precio pero SIN ficha (no entraron):', sinFicha);
  console.log('Listo. Ahora: CLAVE_PANEL=... npm run seed:halloween && npm run fotos:halloween');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
