import { NextResponse, type NextRequest } from 'next/server';
import { editarConfig, type CambiosConfig } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';
import { configPedidoDe, MEDIOS_DE_PAGO, MODALIDADES } from '@/logica/tipos';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  return NextResponse.json({
    configPedido: configPedidoDe(cliente),
    cubiertoPorPersona: cliente.cubiertoPorPersona,
    notas: cliente.notas,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = await req.json().catch(() => ({}));
  const cambios: CambiosConfig = {};

  if (typeof body.whatsapp === 'string') cambios.whatsapp = body.whatsapp.trim();
  if (typeof body.cabecera === 'string') cambios.cabecera = body.cabecera.trim();
  if (Array.isArray(body.modalidades)) {
    cambios.modalidades = body.modalidades.filter((m: unknown) =>
      (MODALIDADES as readonly string[]).includes(m as string),
    );
  }
  if (Array.isArray(body.mediosDePago)) {
    cambios.mediosDePago = body.mediosDePago.filter((m: unknown) =>
      (MEDIOS_DE_PAGO as readonly string[]).includes(m as string),
    );
  }
  if (Array.isArray(body.zonasEnvio)) cambios.zonasEnvio = body.zonasEnvio;
  if (body.descuentoRetiro) cambios.descuentoRetiro = body.descuentoRetiro;
  if (typeof body.cubiertoPorPersona === 'number') cambios.cubiertoPorPersona = body.cubiertoPorPersona;
  if (Array.isArray(body.notas)) cambios.notas = body.notas;

  await editarConfig(cliente.id, cambios);
  return NextResponse.json({ ok: true });
}
