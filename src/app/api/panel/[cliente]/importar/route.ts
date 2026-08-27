import { NextResponse, type NextRequest } from 'next/server';
import { importarFilas, listarCategorias } from '@/datos/panel-repo';
import { clienteAutorizado } from '@/datos/panel-guard';
import { leerPlanilla } from '@/logica/planilla';

/** Sin `?commit=1`: solo valida y devuelve la vista previa (filas y
 *  errores), no escribe nada. Con `commit`: inserta las filas válidas. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente: slug } = await params;
  const cliente = await clienteAutorizado(slug);
  if (cliente instanceof NextResponse) return cliente;

  const body = await req.json().catch(() => ({}));
  const csv = typeof body.csv === 'string' ? body.csv : '';
  const commit = body.commit === true;

  const categorias = await listarCategorias(cliente.id);
  const { filas, errores } = leerPlanilla(csv, categorias);

  if (!commit || errores.length) {
    return NextResponse.json({ filas, errores, importadas: 0 });
  }

  const importadas = await importarFilas(cliente.id, filas);
  return NextResponse.json({ filas, errores, importadas });
}
