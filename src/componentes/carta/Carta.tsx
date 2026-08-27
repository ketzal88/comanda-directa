'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ListaCategoria } from './ListaCategoria';
import { AvisoDesactualizado } from '@/componentes/AvisoDesactualizado';
import { IndiceCategorias } from '@/componentes/IndiceCategorias';
import { Marca } from '@/componentes/Marca';
import { BarraPedido } from '@/componentes/pedido/BarraPedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { formatearPrecio } from '@/logica/precio';
import type { Carta as CartaDatos, ConfigPedido } from '@/logica/tipos';

type Props = {
  carta: CartaDatos;
  configPedido: ConfigPedido;
  logoUrl?: string;
  desactualizada?: boolean;
};

/** La plantilla "Clásica": una sola carta, con categorías agrupadas por
 *  subcategoría, índice pegajoso arriba y la barra del pedido abajo cuando
 *  hay algo cargado. Es el puerto directo de `sagrado-sushi-carta`
 *  (`CartaSushi.tsx`), generalizado para cualquier cliente del motor — ver
 *  el plan de plantillas en el README. */
export function Carta({ carta, configPedido, logoUrl, desactualizada = false }: Props) {
  const { nombre } = useClienteActual();
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const contenido = useRef<HTMLDivElement>(null);

  const categorias = useMemo(
    () => [...carta.categorias].sort((a, b) => a.orden - b.orden),
    [carta.categorias],
  );
  const visibles = useMemo(() => carta.items.filter((i) => i.activo), [carta.items]);

  const notaHablaDelCubierto = carta.config.notas.some((n) => /cubierto/i.test(n));

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
      { rootMargin: '-56px 0px -70% 0px' },
    );
    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, [visibles.length]);

  return (
    <div ref={contenido} className="columna-carta min-h-dvh pb-16">
      <header className="px-6 pt-10 pb-2 text-center">
        <Marca nombre={nombre} logoUrl={logoUrl} tamano={72} className="mx-auto" />
        <hr className="w-10 border-t border-regla mx-auto mt-6" />
      </header>

      <IndiceCategorias
        categorias={categorias}
        activaId={categoriaActiva}
        onIr={(id) => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth' })}
      />

      {desactualizada && <AvisoDesactualizado />}

      {categorias.map((c) => (
        <ListaCategoria
          key={c.id}
          categoria={c}
          items={visibles
            .filter((i) => i.categoriaId === c.id)
            .sort((a, b) => a.orden - b.orden || a.numero - b.numero)}
        />
      ))}

      {!visibles.length && (
        <div className="px-8 py-20 text-center">
          <p className="nombre-item">Todavía no hay platos cargados.</p>
          <p className="metadata-item mt-2">
            La carta se está preparando. Volvé a entrar en un rato o consultá en el local.
          </p>
        </div>
      )}

      {(carta.config.notas.length > 0 || carta.config.cubiertoPorPersona > 0) && (
        <footer className="px-6 pt-12">
          <hr className="w-10 border-t border-regla mb-4" />
          {carta.config.notas.map((n, i) => (
            <p key={i} className="metadata-item mt-1">
              {n}
            </p>
          ))}
          {carta.config.cubiertoPorPersona > 0 && !notaHablaDelCubierto && (
            <p className="metadata-item mt-1">
              Cubierto en el salón: {formatearPrecio(carta.config.cubiertoPorPersona)} por persona.
            </p>
          )}
        </footer>
      )}

      <BarraPedido
        items={visibles}
        cubiertoPorPersona={carta.config.cubiertoPorPersona}
        configPedido={configPedido}
      />
    </div>
  );
}
