import { NextResponse, type NextRequest } from 'next/server';
import { editarCategoria } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cliente: string; id: string }> },
) {
  const { cliente: slug, id } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = await req.json().catch(() => ({}));
  const cambios: Record<string, unknown> = {};
  if (typeof body.nombre === 'string') cambios.nombre = body.nombre.trim();
  if (typeof body.nombreEn === 'string') cambios.nombreEn = body.nombreEn.trim();
  if (typeof body.orden === 'number') cambios.orden = body.orden;
  if (Array.isArray(body.subcategorias)) cambios.subcategorias = body.subcategorias;

  const categoria = await editarCategoria(cliente.id, id, cambios);
  if (!categoria) return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  return NextResponse.json({ categoria });
}
