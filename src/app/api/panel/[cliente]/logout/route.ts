import { NextResponse } from 'next/server';
import { nombreCookiePanel } from '@/datos/panel-auth';

export async function POST(_req: Request, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(nombreCookiePanel(slug));
  return res;
}
