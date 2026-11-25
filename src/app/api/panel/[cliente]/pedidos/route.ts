import { NextResponse, type NextRequest } from 'next/server';
import { clienteAutorizado } from '@/datos/panel-guard';
import { crearPedidoInterno, listarPedidosInternos, type NuevoPedido } from '@/datos/panel-repo';
import type { LineaPedidoInterno } from '@/logica/tipos';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;
  return NextResponse.json({ pedidos: await listarPedidosInternos(cliente.id) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = (await req.json().catch(() => ({}))) as Partial<NuevoPedido>;
  const lineasCrudas = Array.isArray(body.lineas) ? body.lineas : [];
  const lineas: LineaPedidoInterno[] = lineasCrudas
    .map((l) => ({
      itemId: typeof l.itemId === 'string' && UUID.test(l.itemId) ? l.itemId : null,
      nombre: String(l.nombre ?? '').trim(),
      variante: String(l.variante ?? '').trim(),
      precioUnitario: Math.max(0, Math.floor(Number(l.precioUnitario) || 0)),
      cantidad: Math.max(0, Math.floor(Number(l.cantidad) || 0)),
    }))
    .filter((l) => l.nombre && l.cantidad > 0);

  if (!lineas.length) {
    return NextResponse.json({ error: 'El pedido no tiene productos.' }, { status: 400 });
  }

  try {
    const pedido = await crearPedidoInterno(cliente.id, {
      comprador: String(body.comprador ?? '').trim(),
      telefono: String(body.telefono ?? '').trim(),
      nota: String(body.nota ?? '').trim(),
      medioPago: String(body.medioPago ?? '').trim(),
      lineas,
    });
    return NextResponse.json({ pedido });
  } catch (e) {
    // La transacción no dejó nada a medias: se puede reintentar.
    console.error('[panel-pedidos]', (e as Error).message);
    return NextResponse.json({ error: 'No se pudo guardar el pedido. Probá de nuevo.' }, { status: 500 });
  }
}
