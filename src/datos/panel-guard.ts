import 'server-only';
import { NextResponse } from 'next/server';
import { leerCliente } from './carta-repo';
import { esPanelAutorizado } from './panel-auth';
import type { Cliente } from '@/logica/tipos';

/** Guardia común de las rutas de `/api/panel/[cliente]/*`: resuelve el
 *  cliente y exige la cookie de sesión de ESE cliente. Se usa así en cada
 *  ruta: `const cliente = await clienteAutorizado(slug); if (cliente
 *  instanceof NextResponse) return cliente;` */
export async function clienteAutorizado(slug: string): Promise<Cliente | NextResponse> {
  const cliente = await leerCliente(slug);
  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });

  const autorizado = await esPanelAutorizado(slug, cliente.claveHash);
  if (!autorizado) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  return cliente;
}
