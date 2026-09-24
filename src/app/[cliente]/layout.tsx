import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProveedorCliente } from '@/componentes/ClienteContext';
import { leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { TEMA_DEFECTO } from '@/logica/tipos';
import type { Tema } from '@/logica/tipos';

export const dynamic = 'force-dynamic';

type Props = { children: React.ReactNode; params: Promise<{ cliente: string }> };

/** El título de la pestaña y la vista previa al compartir el link.
 *
 *  Sin esto quedaba el del layout raíz, o sea que la carta de un cliente se
 *  compartía por WhatsApp con el nombre de NUESTRO producto: el comprador
 *  recibía "Comanda Directa" en vez de "Piedro Shop". El nombre del motor es
 *  asunto nuestro, no de la marca que el comensal tiene que reconocer.
 *
 *  El ícono sale del logo del cliente si lo cargó; si no, hereda el de
 *  `app/icon.svg`, que es la marca del producto — mejor eso que la hoja en
 *  blanco del navegador.
 *
 *  `leerCliente` está cacheado con `cache()` de React y el layout ya lo pide
 *  abajo: esto no suma una consulta más. */
export async function generateMetadata({ params }: { params: Props['params'] }): Promise<Metadata> {
  const { cliente: slug } = await params;
  if (!haySupabaseConfigurado()) return {};

  const cliente = await leerCliente(slug);
  if (!cliente) return {};

  return {
    title: cliente.nombre,
    description: `Catálogo de ${cliente.nombre}. Pedidos por WhatsApp.`,
    ...(cliente.tema.logoUrl ? { icons: { icon: cliente.tema.logoUrl } } : {}),
  };
}

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
      <>
        <TemaDelCliente tema={TEMA_DEFECTO} />
        <ProveedorCliente slug={slug} nombre={slug}>
          {children}
        </ProveedorCliente>
      </>
    );
  }

  const cliente = await leerCliente(slug);
  if (!cliente) notFound();

  return (
    <>
      <TemaDelCliente tema={cliente.tema} />
      <ProveedorCliente slug={cliente.slug} nombre={cliente.nombre}>
        {children}
      </ProveedorCliente>
    </>
  );
}

/** Pinta el tema del cliente en `:root` y no en un `<div>` envolvente.
 *
 *  La diferencia no es de estilo. `globals.css` tiene `body { background:
 *  var(--color-fondo) }`, y `body` está POR ENCIMA de cualquier div: con las
 *  variables en el div, `body` resolvía contra el `:root` de `globals.css`
 *  —el gris por defecto— mientras la carta usaba el color del cliente. El
 *  resultado eran dos fondos distintos en la misma pantalla, y se veía como
 *  bandas en el índice pegajoso y en la barra del pedido.
 *
 *  Es un `<style>` y no un atributo en `<html>` porque este layout está
 *  anidado adentro del layout raíz y no puede tocar esa etiqueta. Se
 *  renderiza en el servidor, una sola vez por request, y cada request sirve
 *  a un solo cliente: no hay dos temas compitiendo en la misma página. */
function TemaDelCliente({ tema }: { tema: Tema }) {
  const css = `:root{--color-fondo:${color(tema.colorFondo, TEMA_DEFECTO.colorFondo)};--color-texto:${color(tema.colorTexto, TEMA_DEFECTO.colorTexto)};--color-texto-suave:${color(tema.colorTextoSuave, TEMA_DEFECTO.colorTextoSuave)};--color-acento:${color(tema.colorAcento, TEMA_DEFECTO.colorAcento)}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/** El color tal como se puede meter adentro de un `<style>`, o el de por
 *  defecto. Hoy `clientes.tema` sólo se escribe a mano o por script, pero
 *  esto se interpola en una etiqueta `<style>`: un valor con `}</style>` se
 *  escaparía del bloque y podría inyectar HTML en la página del cliente. Se
 *  valida en vez de confiar, porque el día que el panel deje editar los
 *  colores nadie se va a acordar de volver acá. */
function color(crudo: string | undefined, porDefecto: string): string {
  return typeof crudo === 'string' && /^#[0-9a-f]{3,8}$/i.test(crudo.trim())
    ? crudo.trim()
    : porDefecto;
}
