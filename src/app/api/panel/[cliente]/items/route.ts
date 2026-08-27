import { NextResponse, type NextRequest } from 'next/server';
import { crearItem, listarItemsPanel } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';
import { validarCambiosItem } from '@/logica/validar-item';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  return NextResponse.json({ items: await listarItemsPanel(cliente.id) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = await req.json().catch(() => ({}));
  const { cambios, errores } = validarCambiosItem(body);
  if (!cambios.nombre || !cambios.categoriaId || typeof cambios.orden !== 'number') {
    errores.push({ campo: 'general', mensaje: 'Faltan nombre, categoría u orden' });
  }
  if (errores.length) return NextResponse.json({ errores }, { status: 400 });

  const item = await crearItem(cliente.id, {
    nombre: cambios.nombre!,
    categoriaId: cambios.categoriaId!,
    subcategoria: cambios.subcategoria,
    orden: cambios.orden!,
    precio: cambios.precio ?? 0,
    variantes: cambios.variantes ?? [],
    piezas: cambios.piezas,
    etiquetas: cambios.etiquetas ?? [],
    descripcion: cambios.descripcion,
    fotoUrl: cambios.fotoUrl,
  });
  return NextResponse.json({ item });
}
