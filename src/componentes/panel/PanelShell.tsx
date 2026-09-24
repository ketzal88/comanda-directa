'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiPanel } from './api';

const CLASE_LINK = 'text-sm font-medium hover:underline underline-offset-4';

/** Layout común del panel: nav simple + salir. Deliberadamente neutro (no
 *  usa el tema del cliente): tiene que leerse bien pase lo que pase con los
 *  colores que ese restaurante haya elegido para su carta. */
export function PanelShell({
  slug,
  nombre,
  children,
}: {
  slug: string;
  /** El nombre comercial del cliente. El slug es la URL, no la marca: un
   *  panel que dice "halloween" cuando el local se llama "Piedro Shop" hace
   *  dudar de si se entró al lugar correcto. */
  nombre?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/${slug}/panel`;

  const activo = (ruta: string) => pathname === ruta;

  const salir = async () => {
    await apiPanel(slug).logout();
    router.push(base);
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-5 px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Panel · {nombre || slug}
          </span>
          <nav className="flex flex-wrap gap-4">
            <Link href={base} className={`${CLASE_LINK} ${activo(base) ? 'text-orange-400' : ''}`}>
              Ítems
            </Link>
            <Link href={`${base}/categorias`} className={CLASE_LINK}>
              Categorías
            </Link>
            <Link href={`${base}/importar`} className={CLASE_LINK}>
              Importar
            </Link>
            <Link href={`${base}/pedido`} className={CLASE_LINK}>
              Pedido
            </Link>
            <Link href={`${base}/comandas`} className={CLASE_LINK}>
              Comandas
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link href={`/${slug}`} className={CLASE_LINK} target="_blank">
              Ver la carta ↗
            </Link>
            <button type="button" onClick={salir} className="text-sm text-neutral-400 hover:text-white">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}
