import { NextResponse, type NextRequest } from 'next/server';
import { clienteAutorizado } from '@/datos/panel-guard';
import { actualizarItemAdmin, type CambiosAdmin } from '@/datos/panel-repo';
import { esTipoStock } from '@/logica/precios-admin';

/** Guarda costo/margen/stock/tipo de un ítem (admin de precios y stock).
 *  Una fila por request: el admin guarda al salir de cada campo. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const itemId = typeof body.itemId === 'string' ? body.itemId : '';
  if (!itemId) return NextResponse.json({ error: 'Falta itemId' }, { status: 400 });

  const cambios: CambiosAdmin = {};
  if ('costo' in body) cambios.costo = Math.max(0, Math.floor(Number(body.costo) || 0));
  if ('margen' in body) cambios.margen = Math.max(0, Math.floor(Number(body.margen) || 0));
  if ('tipoStock' in body && esTipoStock(body.tipoStock)) cambios.tipoStock = body.tipoStock;
  if ('stock' in body) {
    cambios.stock = body.stock == null || body.stock === '' ? null : Math.max(0, Math.floor(Number(body.stock) || 0));
  }

  const item = await actualizarItemAdmin(cliente.id, itemId, cambios);
  if (!item) return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });
  return NextResponse.json({ item });
}
