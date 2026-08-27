import { NextResponse, type NextRequest } from 'next/server';
import { leerCliente } from '@/datos/carta-repo';
import { esClaveValida, nombreCookiePanel } from '@/datos/panel-auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const body = await req.json().catch(() => null);
  const clave = typeof body?.clave === 'string' ? body.clave : '';

  const cliente = await leerCliente(slug);
  if (!cliente || !esClaveValida(clave, cliente.claveHash)) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // El valor de la cookie es el HASH (no la clave): ya es de un solo sentido,
  // así que guardarlo tal cual no expone nada que no estuviera ya en la base.
  res.cookies.set(nombreCookiePanel(slug), cliente.claveHash!, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
