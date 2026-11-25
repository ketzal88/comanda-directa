import { NextResponse, type NextRequest } from 'next/server';
import { editarConfig, type CambiosConfig } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';
import { configPedidoDe, MEDIOS_DE_PAGO, MODALIDADES } from '@/logica/tipos';
import { validarCubierto, validarDescuento, validarNotas, validarZonas } from '@/logica/validar-config';

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
  // Lo que la carta después lee y suma al total: si viene mal, se rechaza el
  // PUT entero en vez de guardar basura en la fila del cliente.
  const invalidos: string[] = [];
  const validar = <T,>(campo: string, crudo: unknown, fn: (v: unknown) => T | null, poner: (v: T) => void) => {
    if (crudo === undefined) return;
    const v = fn(crudo);
    if (v === null) invalidos.push(campo);
    else poner(v);
  };
  validar('zonasEnvio', body.zonasEnvio, validarZonas, (v) => (cambios.zonasEnvio = v));
  validar('descuentoRetiro', body.descuentoRetiro, validarDescuento, (v) => (cambios.descuentoRetiro = v));
  validar('cubiertoPorPersona', body.cubiertoPorPersona, validarCubierto, (v) => (cambios.cubiertoPorPersona = v));
  validar('notas', body.notas, validarNotas, (v) => (cambios.notas = v));
  if (invalidos.length) {
    return NextResponse.json({ error: `Datos inválidos: ${invalidos.join(', ')}` }, { status: 400 });
  }

  await editarConfig(cliente.id, cambios);
  return NextResponse.json({ ok: true });
}
