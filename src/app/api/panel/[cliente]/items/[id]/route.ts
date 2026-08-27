import { NextResponse, type NextRequest } from 'next/server';
import { editarItem } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';
import { validarCambiosItem } from '@/logica/validar-item';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cliente: string; id: string }> },
) {
  const { cliente: slug, id } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = await req.json().catch(() => ({}));
  const { cambios, errores } = validarCambiosItem(body);
  if (errores.length) return NextResponse.json({ errores }, { status: 400 });

  const item = await editarItem(cliente.id, id, cambios);
  if (!item) return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
  return NextResponse.json({ item });
}
