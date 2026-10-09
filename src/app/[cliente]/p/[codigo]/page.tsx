import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SELECCIONES } from '@/clientes/selecciones';
import { SeleccionHalloween } from '@/componentes/carta/SeleccionHalloween';
import { leerCarta, leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { configPedidoDe } from '@/logica/tipos';

type Props = { params: Promise<{ cliente: string; codigo: string }> };

/** Una selección armada para un comprador (ver `clientes/selecciones.ts`).
 *  No se indexa: el link es para una persona, no para Google. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cliente: slug, codigo } = await params;
  const seleccion = SELECCIONES[slug]?.[codigo];
  if (!seleccion) return {};
  return { title: seleccion.titulo, robots: { index: false, follow: false } };
}

export default async function PaginaSeleccion({ params }: Props) {
  const { cliente: slug, codigo } = await params;
  const seleccion = SELECCIONES[slug]?.[codigo];
  if (!seleccion || !haySupabaseConfigurado()) notFound();

  const cliente = await leerCliente(slug);
  if (!cliente) notFound();

  const carta = await leerCarta(cliente);
  return <SeleccionHalloween seleccion={seleccion} carta={carta} configPedido={configPedidoDe(cliente)} />;
}
