import { notFound } from 'next/navigation';
import { ProveedorCliente } from '@/componentes/ClienteContext';
import { leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { TEMA_DEFECTO } from '@/logica/tipos';

export const dynamic = 'force-dynamic';

type Props = { children: React.ReactNode; params: Promise<{ cliente: string }> };

/** Resuelve el cliente por slug y pinta su tema como variables CSS antes de
 *  renderizar nada de la carta o el panel: es lo único que necesitan los
 *  componentes portados para verse con los colores de este cliente sin
 *  cambiar una línea de su JSX (ver `globals.css`). */
export default async function LayoutCliente({ children, params }: Props) {
  const { cliente: slug } = await params;

  if (!haySupabaseConfigurado()) {
    // Sin Supabase configurado (desarrollo sin .env.local todavía): se deja
    // pasar con el tema por defecto y sin datos de cliente — la página de
    // cada ruta decide qué mostrar (ver [cliente]/page.tsx).
    return (
      <div style={temaComoVariables(TEMA_DEFECTO)}>
        <ProveedorCliente slug={slug} nombre={slug}>
          {children}
        </ProveedorCliente>
      </div>
    );
  }

  const cliente = await leerCliente(slug);
  if (!cliente) notFound();

  return (
    <div style={temaComoVariables(cliente.tema)}>
      <ProveedorCliente slug={cliente.slug} nombre={cliente.nombre}>
        {children}
      </ProveedorCliente>
    </div>
  );
}

function temaComoVariables(tema: {
  colorFondo: string;
  colorTexto: string;
  colorTextoSuave: string;
  colorAcento: string;
}): React.CSSProperties {
  return {
    ['--color-fondo' as string]: tema.colorFondo,
    ['--color-texto' as string]: tema.colorTexto,
    ['--color-texto-suave' as string]: tema.colorTextoSuave,
    ['--color-acento' as string]: tema.colorAcento,
    minHeight: '100dvh',
  };
}
