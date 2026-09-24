'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Arana, Bandada, Calabaza, Telarana } from './halloween/Adornos';
import { ModalProducto } from './halloween/ModalProducto';
import { TarjetaProducto } from './halloween/TarjetaProducto';
import { AvisoDesactualizado } from '@/componentes/AvisoDesactualizado';
import { Marca } from '@/componentes/Marca';
import { BarraPedido } from '@/componentes/pedido/BarraPedido';
import type { Carta as CartaDatos, ConfigPedido, Item } from '@/logica/tipos';

type Props = {
  carta: CartaDatos;
  configPedido: ConfigPedido;
  logoUrl?: string;
  desactualizada?: boolean;
};

/** La plantilla "halloween": la misma carta del motor, con la identidad de
 *  la campaña de temporada (el flyer que el cliente manda por WhatsApp).
 *
 *  Es una plantilla y no un retoque de la Clásica porque cambia la forma de
 *  leer, no los colores: la Clásica es una lista de platos con el precio a
 *  la derecha, pensada para una carta de restaurante que se recorre entera.
 *  Un catálogo de cotillón se mira por la foto y se entra al producto. Por
 *  eso acá hay grilla, ficha y no filas.
 *
 *  El `switch` que la elige está en `[cliente]/page.tsx`, por el campo
 *  `clientes.plantilla`. Las dos comparten el motor entero debajo: el
 *  pedido, la hoja, el mensaje de WhatsApp y la barra inferior son los
 *  mismos (`componentes/pedido/`). */
export function CartaHalloween({ carta, configPedido, logoUrl, desactualizada = false }: Props) {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<Item | null>(null);
  const contenido = useRef<HTMLDivElement>(null);

  const categorias = useMemo(
    () => [...carta.categorias].sort((a, b) => a.orden - b.orden),
    [carta.categorias],
  );
  const visibles = useMemo(() => carta.items.filter((i) => i.activo), [carta.items]);

  useEffect(() => {
    const secciones = contenido.current?.querySelectorAll('[data-seccion]');
    if (!secciones?.length) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            setCategoriaActiva(e.target.getAttribute('data-seccion'));
            break;
          }
        }
      },
      { rootMargin: '-72px 0px -70% 0px' },
    );
    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, [visibles.length]);

  const irA = (id: string) =>
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={contenido} className="halloween halloween-fondo min-h-dvh pb-20">
      <header className="relative overflow-hidden px-6 pt-8 pb-7 text-center">
        <Bandada />
        <Telarana className="absolute -left-3 -top-3 w-24 text-[color:var(--h-violeta-medio)] opacity-40" />
        <Arana className="h-cuelga absolute right-6 -top-1 w-7 text-[color:var(--h-violeta)]" />

        <div className="relative">
          {logoUrl ? (
            <Marca nombre="" logoUrl={logoUrl} tamano={76} className="mx-auto" />
          ) : (
            <>
              <p
                className="text-[15px] font-extrabold uppercase tracking-[0.3em]"
                style={{ color: 'var(--h-violeta-medio)' }}
              >
                Se viene
              </p>
              <h1
                className="h-titila text-[52px] leading-[0.92] font-black uppercase tracking-[0.02em]"
                style={{
                  color: 'var(--h-naranja)',
                  textShadow: '2px 3px 0 var(--h-violeta)',
                }}
              >
                Halloween
              </h1>
            </>
          )}

          <p
            className="mx-auto mt-3 max-w-[19rem] text-[15px] font-semibold leading-snug"
            style={{ color: 'var(--h-violeta)' }}
          >
            Disfraces, accesorios y decoración para una noche bien terrorífica.
          </p>

          <p
            className="mt-3 inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-[13px] font-bold"
            style={{
              background: 'var(--h-lila-suave)',
              borderColor: 'var(--h-violeta)',
              color: 'var(--h-violeta)',
            }}
          >
            <Calabaza className="w-5 h-flota text-[color:var(--h-naranja)]" />
            Tocá cualquier producto para verlo en grande
          </p>
        </div>
      </header>

      {categorias.length > 0 && (
        <nav
          aria-label="Secciones del catálogo"
          className="sticky top-0 z-20 border-y-2"
          style={{ background: 'var(--h-crema)', borderColor: 'var(--h-violeta)' }}
        >
          <div className="flex gap-2 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => irA(c.id)}
                aria-current={categoriaActiva === c.id ? 'true' : undefined}
                className="halloween-chip shrink-0 px-3.5 py-1.5 text-[12px] uppercase tracking-[0.06em]"
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </nav>
      )}

      {desactualizada && <AvisoDesactualizado />}

      {categorias.map((c, iCat) => {
        const items = visibles
          .filter((i) => i.categoriaId === c.id)
          .sort((a, b) => a.orden - b.orden || a.numero - b.numero);
        if (!items.length) return null;

        return (
          <section
            key={c.id}
            id={`cat-${c.id}`}
            data-seccion={c.id}
            aria-labelledby={`titulo-${c.id}`}
            className="px-4 pt-8 scroll-mt-[60px]"
          >
            <h2 id={`titulo-${c.id}`} className="mb-4 text-center">
              <span
                className={`halloween-pincelada text-[17px] uppercase ${
                  ['', 'halloween-pincelada-naranja', 'halloween-pincelada-menta'][iCat % 3]
                }`}
              >
                {c.nombre}
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {items.map((item, i) => (
                <TarjetaProducto
                  key={item.id}
                  item={item}
                  onAbrir={setAbierto}
                  // el escalonado se corta a los ocho: más abajo nadie lo ve
                  // entrar, y una tarjeta que aparece medio segundo tarde se
                  // lee como que la página está trabada
                  retraso={Math.min(i, 7) * 45}
                />
              ))}
            </div>
          </section>
        );
      })}

      {!visibles.length && (
        <div className="px-8 py-20 text-center">
          <Calabaza className="mx-auto w-16 h-flota text-[color:var(--h-naranja)]" />
          <p className="mt-4 font-bold" style={{ color: 'var(--h-violeta)' }}>
            Todavía no hay nada cargado en el catálogo.
          </p>
        </div>
      )}

      {carta.config.notas.length > 0 && (
        <footer className="px-6 pt-10">
          <div
            className="rounded-[18px] border-2 px-4 py-3"
            style={{ background: 'var(--h-lila-suave)', borderColor: 'var(--h-violeta)' }}
          >
            {carta.config.notas.map((n, i) => (
              <p
                key={i}
                className="text-[13px] font-semibold leading-snug mt-1 first:mt-0"
                style={{ color: 'var(--h-violeta)' }}
              >
                {n}
              </p>
            ))}
          </div>
        </footer>
      )}

      {abierto && <ModalProducto item={abierto} onCerrar={() => setAbierto(null)} />}

      <BarraPedido
        items={visibles}
        cubiertoPorPersona={carta.config.cubiertoPorPersona}
        configPedido={configPedido}
      />
    </div>
  );
}
