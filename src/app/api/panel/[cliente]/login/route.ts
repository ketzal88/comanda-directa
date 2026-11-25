import { NextResponse, type NextRequest } from 'next/server';
import { leerCliente } from '@/datos/carta-repo';
import { crearSesion, DURACION_SESION_S, esClaveValida, nombreCookiePanel } from '@/datos/panel-auth';

/** Intentos fallidos por IP+slug. Con 5 fallos, 15 minutos sin poder probar.
 *  shortcut: en memoria y por instancia de Vercel; si aparecen intentos
 *  distribuidos, pasar a una regla de rate limit del Firewall de Vercel
 *  sobre /api/panel/<slug>/login o a una tabla en Supabase. */
const MAX_FALLOS = 5;
const BLOQUEO_MS = 15 * 60_000;
const fallos = new Map<string, { n: number; hasta: number }>();

function bloqueado(llave: string, ahora: number): boolean {
  const f = fallos.get(llave);
  if (f && ahora > f.hasta) fallos.delete(llave);
  return Boolean(f && ahora <= f.hasta && f.n >= MAX_FALLOS);
}

function registrarFallo(llave: string, ahora: number): number {
  const f = fallos.get(llave);
  const n = f && ahora <= f.hasta ? f.n + 1 : 1;
  fallos.set(llave, { n, hasta: ahora + BLOQUEO_MS });
  return n;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sin-ip';
  const llave = `${ip}|${slug}`;
  const ahora = Date.now();

  if (bloqueado(llave, ahora)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo en 15 minutos.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const clave = typeof body?.clave === 'string' ? body.clave : '';

  const cliente = await leerCliente(slug);
  if (!cliente || !esClaveValida(clave, cliente.claveHash)) {
    // Nunca se loguea la clave probada.
    const n = registrarFallo(llave, ahora);
    console.warn(`[panel-login] clave incorrecta slug=${slug} ip=${ip} intento=${n}`);
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }

  const sesion = crearSesion(slug, cliente.claveHash!);
  if (!sesion) {
    console.error('[panel-login] falta PANEL_SESSION_SECRET (o tiene menos de 32 caracteres)');
    return NextResponse.json({ error: 'El panel no está configurado. Avisale a Worker.' }, { status: 500 });
  }

  fallos.delete(llave);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(nombreCookiePanel(slug), sesion, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION_SESION_S,
  });
  return res;
}
