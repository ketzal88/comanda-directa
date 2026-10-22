import { NextResponse, type NextRequest } from 'next/server';
import { createSign } from 'node:crypto';
import { supabaseServidor } from '@/datos/supabase-servidor';

/** El slug con el que Party Market está EN LA BASE (la URL pública es
 *  /party-market; ver `scripts/catalogo-halloween.ts` y
 *  `src/logica/slugs-renombrados.ts`). Hardcodeado y no importado de
 *  `scripts/` porque esos módulos no entran en el bundle del server. */
const SLUG_HALLOWEEN = 'piedro-shop';

/** Sincroniza el stock de Party Market con la planilla del cliente. Lee la
 *  hoja "Catálogo" (nombre + Disponible) y, por cada producto de la carta,
 *  lo OCULTA (`activo = false`) cuando Disponible llega a 0 y lo vuelve a
 *  mostrar cuando hay stock. No toca precios, fotos ni descripciones: eso lo
 *  rehace el seed. No agrega ni borra productos; para cambiar el surtido se
 *  corre `traer-planilla` + `seed`.
 *
 *  Lo dispara el cron de Vercel (ver `vercel.json`). Protegido con
 *  CRON_SECRET: Vercel manda `Authorization: Bearer <CRON_SECRET>`, y se puede
 *  disparar a mano con el mismo header o `?secret=`.
 *
 *  Entorno (en Vercel): GOOGLE_SA_EMAIL, GOOGLE_SA_PRIVATE_KEY, CRON_SECRET,
 *  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. PLANILLA_ID es opcional. */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const PLANILLA_ID = process.env.PLANILLA_ID ?? '1NrjjQeQIDaHqJzXnZ36PneYNqmgaMDe-1sq2x7umS1k';
const RANGO = 'Catálogo!A7:L125';

function base64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function accessToken(email: string, clave: string): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: ahora,
      exp: ahora + 3600,
    }),
  );
  const firma = base64url(createSign('RSA-SHA256').update(`${header}.${claims}`).sign(clave));
  const jwt = `${header}.${claims}.${firma}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!res.ok || !data.access_token) throw new Error(`auth Google: ${data.error_description ?? res.status}`);
  return data.access_token;
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

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = req.headers.get('authorization');
  if (bearer === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get('secret') === secret;
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: 'no autorizado' }, { status: 401 });

  const email = process.env.GOOGLE_SA_EMAIL;
  const clave = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !clave) {
    return NextResponse.json({ error: 'faltan credenciales de Google' }, { status: 500 });
  }

  // Disponible por nombre, desde la planilla.
  const token = await accessToken(email, clave);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${PLANILLA_ID}/values/${encodeURIComponent(RANGO)}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  const data = (await res.json()) as { values?: string[][]; error?: { message: string } };
  if (!res.ok || !data.values) {
    return NextResponse.json({ error: data.error?.message ?? 'no se pudo leer la planilla' }, { status: 502 });
  }

  const disponiblePorNombre = new Map<string, number>();
  for (const f of data.values.slice(1)) {
    const nombre = (f[1] ?? '').trim().toLowerCase();
    if (nombre) disponiblePorNombre.set(nombre, parsearPrecio(f[11]) ?? 0);
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
    // Un producto que no está en la planilla no se toca: el stock lo manda la
    // planilla, pero su ausencia puede ser un nombre que no matchea, no un 0.
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
