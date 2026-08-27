import { NextResponse, type NextRequest } from 'next/server';
import { crearCategoria, listarCategorias } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  return NextResponse.json({ categorias: await listarCategorias(cliente.id) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = await req.json().catch(() => ({}));
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const orden = typeof body.orden === 'number' ? body.orden : 1;
  if (!nombre) return NextResponse.json({ error: 'Falta el nombre de la categoría' }, { status: 400 });

  const categoria = await crearCategoria(cliente.id, { nombre, orden, nombreEn: body.nombreEn ?? '' });
  return NextResponse.json({ categoria });
}
