'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AdornosEncabezado, TituloAnimado } from './halloween/Adornos';
import { BarraPedidoHalloween } from './halloween/BarraPedidoHalloween';
import { ModalProducto } from './halloween/ModalProducto';
import { TarjetaProducto } from './halloween/TarjetaProducto';
import { CLASES_FUENTES } from './halloween/tipografia';
import { AvisoDesactualizado } from '@/componentes/AvisoDesactualizado';
import { useClienteActual } from '@/componentes/ClienteContext';
import { fijarVencimiento } from '@/datos/pedido-almacen';
import { useSincronizarPedido } from '@/componentes/pedido/usePedido';
import { formatearPrecio } from '@/logica/precio';
import { precioDesde } from '@/logica/variantes';
import { ETIQUETA_MEDIO, enlaceWhatsApp } from '@/logica/whatsapp';
import type { Carta as CartaDatos, Categoria, ConfigPedido, Descuento, Item } from '@/logica/tipos';

type Props = {
  carta: CartaDatos;
  configPedido: ConfigPedido;
  logoUrl?: string;
  desactualizada?: boolean;
};

/** Cuántos productos se ven antes de tocar "ver más". Doce son seis filas de
 *  dos en un teléfono: alcanza para entender qué hay en la sección sin que
 *  una categoría larga tape a las que siguen. */
const TOPE_SIN_DESPLEGAR = 12;

/** Color de fondo del cartel de cada categoría, rotando. */
const COLORES = ['var(--h-lila)', 'var(--h-durazno)', 'var(--h-menta)'];

/** Ícono y bajada de cada categoría, por nombre.
 *
 *  Vive acá y no en la base porque `categorias` no tiene dónde guardarlos, y
 *  sumarle dos columnas a una tabla que comparten todos los clientes por un
 *  adorno de una plantilla es al revés. La contra es que si el cliente
 *  renombra una categoría desde el panel pierde su ícono y su bajada: la
 *  categoría sigue funcionando igual, sólo queda más sobria. Es la razón por
 *  la que hay un caso por defecto y no un `!`. */
const ADORNO_CATEGORIA: Record<string, { icono: string; bajada: string }> = {
  'DISFRACES INFANTILES': {
    icono: '🧙',
    bajada: 'Para los más chicos: brujitas, vampiros, esqueletos y más ♥',
  },
  'DISFRACES ADULTO': { icono: '🧛', bajada: 'Para los grandes que se animan a todo.' },
  ANIMATRÓNICOS: {
    icono: '💀',
    bajada: 'Se mueven, hablan y tienen luz. Lo que hace que la casa sea LA casa del barrio.',
  },
  'INFLABLES GIGANTES': {
    icono: '🎈',
    bajada: 'Para el jardín o la entrada: se inflan solos y se ven desde la vereda.',
  },
  ACCESORIOS: { icono: '🎩', bajada: 'Sombreros, máscaras, tatuajes, medias y mucho más.' },
  'TRICK OR TREAT': { icono: '🍬', bajada: 'Platos, vasos, guirnaldas y golosineros para la fiesta.' },
  DECORACIÓN: {
    icono: '🕸️',
    bajada: 'Arañas, velas, calderos, lápidas y colgantes para asustar a todos.',
  },
};

/** Condiciones de la temporada. Viven acá, como los adornos de categoría,
 *  porque la base no tiene dónde guardarlas y son de esta campaña.
 *
 *  Los animatrónicos y los inflables no están en el local: se encargan al
 *  mayorista. El aviso va una vez, abajo del título de la sección (en cada
 *  tarjeta eran 158 copias del mismo cartel), y en la ficha del producto. */
const CORTE_ENCARGOS = 'Pedidos hasta el 20/10 · animatrónicos e inflables hasta el 17/10';
const AVISO_A_PEDIDO =
  'A pedido: entrega de 7 a 10 días. Encargá hasta el 17/10 para tenerlo antes de Halloween.';
const CATEGORIAS_A_PEDIDO = new Set(['ANIMATRÓNICOS', 'INFLABLES GIGANTES']);

/** "10% OFF en efectivo o transferencia", armado desde la config de pedido:
 *  el cartel no puede prometer un descuento que el total no aplica. */
function textoDescuentoPago(config: ConfigPedido): string {
  const medios = config.mediosDePago.filter((m) => config.descuentosPago[m]?.tipo === 'porcentaje');
  if (!medios.length) return '';
  const valores = new Set(medios.map((m) => (config.descuentosPago[m] as { valor: number }).valor));
  if (valores.size > 1) return '';
  return `${[...valores][0]}% OFF en ${medios.map((m) => ETIQUETA_MEDIO[m].toLowerCase()).join(' o ')}`;
}

/** El descuento pagando en efectivo, de la misma config que usa el total:
 *  la línea "en efectivo" de cada tarjeta no puede prometer otro número. */
function descuentoEfectivo(config: ConfigPedido): Descuento {
  const d = config.descuentosPago.efectivo;
  return config.mediosDePago.includes('efectivo') && d ? d : { tipo: 'ninguno' };
}

/** Minúsculas y sin tildes: "animatronico" encuentra "Animatrónico". */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Las tres fotos del collage del encabezado. Se eligen por nombre —son las
 *  que quedaron mejor en el diseño— y si alguna no está se cae a las
 *  primeras con foto: el encabezado no puede depender de que un producto
 *  puntual siga en la carta. */
const PREFERIDAS = ['Set Brujita Chispeante Rosa', 'Disfraz Vampira Niña', 'Balde Caramelera'];

function fotosDelCollage(items: Item[]): Item[] {
  const conFoto = items.filter((i) => i.fotoUrl);
  const elegidas = PREFERIDAS.map((n) => conFoto.find((i) => i.nombre === n)).filter(
    (i): i is Item => i != null,
  );
  const faltan = conFoto.filter((i) => !elegidas.includes(i)).slice(0, 3 - elegidas.length);
  return [...elegidas, ...faltan].slice(0, 3);
}

/** La plantilla "halloween": puerto del artboard de Claude Design.
 *
 *  Es una plantilla y no un retoque de la Clásica porque cambia la forma de
 *  leer, no los colores. La Clásica es una lista de platos con el precio a la
 *  derecha, para una carta de restaurante que se recorre entera. Un catálogo
 *  de cotillón se mira por la foto y se entra al producto.
 *
 *  Del artboard salen los colores, las tipografías, el movimiento y el
 *  layout. NO los datos: el artboard traía los 81 productos escritos adentro
 *  y acá vienen de Supabase, que es lo que hace que el cliente pueda cambiar
 *  un precio o marcar algo sin stock sin tocar el código.
 *
 *  Lo mismo con el pedido: el artboard tenía su propio carrito que armaba un
 *  mensaje de WhatsApp. Acá abajo está el del motor (`componentes/pedido/`),
 *  que además pregunta retiro o envío, nombre, teléfono y forma de pago, y es
 *  el mismo que ya usan los otros clientes. */
/** Una semana: ver `fijarVencimiento`. */
const VENCE_PEDIDO_MS = 7 * 24 * 60 * 60 * 1000;

export function CartaHalloween({ carta, configPedido, logoUrl, desactualizada = false }: Props) {
  const { nombre, slug } = useClienteActual();
  // Antes de cualquier `usePedido` de abajo: es el que lee el guardado.
  fijarVencimiento(slug, VENCE_PEDIDO_MS);
  const [activa, setActiva] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<Item | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const fila = useRef<HTMLDivElement>(null);

  const categorias = useMemo(
    () => [...carta.categorias].sort((a, b) => a.orden - b.orden),
    [carta.categorias],
  );
  const visibles = useMemo(() => carta.items.filter((i) => i.activo), [carta.items]);
  useSincronizarPedido(slug, carta.items);
  const collage = useMemo(() => fotosDelCollage(visibles), [visibles]);

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, Item[]>();
    for (const c of categorias) {
      mapa.set(
        c.id,
        visibles
          .filter((i) => i.categoriaId === c.id)
          .sort((a, b) => a.orden - b.orden || a.numero - b.numero),
      );
    }
    return mapa;
  }, [categorias, visibles]);

  const conProductos = categorias.filter((c) => (porCategoria.get(c.id)?.length ?? 0) > 0);

  const aPedido = useMemo(
    () => new Set(categorias.filter((c) => CATEGORIAS_A_PEDIDO.has(c.nombre)).map((c) => c.id)),
    [categorias],
  );
  const avisoDe = (item: Item) => (aPedido.has(item.categoriaId) ? AVISO_A_PEDIDO : undefined);
  const descuentoPago = textoDescuentoPago(configPedido);
  const efectivo = descuentoEfectivo(configPedido);

  // Con 240 productos, el que viene a buscar "la máscara del Joker" no
  // recorre ocho secciones. Busca por nombre y por lo que trae un combo.
  const consulta = normalizar(busqueda.trim());
  const encontrados = useMemo(() => {
    if (!consulta) return [];
    const palabras = consulta.split(/\s+/);
    const orden = new Map(categorias.map((c, i) => [c.id, i]));
    return visibles
      .filter((i) => {
        const texto = normalizar(`${i.nombre} ${i.descripcion ?? ''}`);
        return palabras.every((p) => texto.includes(p));
      })
      .sort(
        (a, b) =>
          (orden.get(a.categoriaId) ?? 0) - (orden.get(b.categoriaId) ?? 0) || a.orden - b.orden,
      );
  }, [consulta, visibles, categorias]);
  const gratis = configPedido.zonasEnvio.filter((z) => z.precio === 0).map((z) => z.nombre);
  const zonasGratis =
    gratis.length > 1 ? `${gratis.slice(0, -1).join(', ')} y ${gratis.at(-1)}` : (gratis[0] ?? '');

  useEffect(() => {
    const secciones = document.querySelectorAll('[data-seccion]');
    if (!secciones.length) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            setActiva(e.target.getAttribute('data-seccion'));
            break;
          }
        }
      },
      { rootMargin: '-72px 0px -70% 0px' },
    );
    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, [visibles.length, consulta]);

  // el chip activo se trae solo a la vista: con seis categorías y una fila
  // que se arrastra, el que corresponde suele quedar fuera de pantalla
  useEffect(() => {
    if (!activa) return;
    const chip = fila.current?.querySelector(`[data-chip="${activa}"]`);
    if (chip instanceof HTMLElement && fila.current) {
      fila.current.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
    }
  }, [activa]);

  const irA = (id: string) => {
    setBusqueda('');
    const el = document.getElementById(`cat-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
  };

  const linkConsulta = enlaceWhatsApp(
    configPedido.whatsapp,
    `¡Hola ${nombre}! Estoy buscando algo que no encontré en el catálogo: `,
  );

  return (
    <div className={`halloween ${CLASES_FUENTES} min-h-dvh overflow-x-hidden`}>
      <p
        className="m-0 px-4 py-2 text-center text-[14px] font-semibold tracking-[0.02em]"
        style={{ background: 'var(--h-naranja)', color: '#fff' }}
      >
        {CORTE_ENCARGOS}
      </p>

      <header className="relative max-w-[1100px] mx-auto px-5 pt-7 pb-2 text-center">
        <AdornosEncabezado />

        <div className="relative">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nombre} className="hw-rise mx-auto h-[76px] w-auto" />
          ) : (
            <>
              <div className="hw-rise font-bold uppercase leading-none tracking-[0.02em] text-[clamp(34px,9vw,64px)]">
                Se viene
              </div>
              <h1
                aria-label="Halloween"
                className="halloween-terror hw-glow flex justify-center mt-0.5 leading-[0.9] tracking-[0.01em] text-[clamp(76px,22vw,172px)]"
                style={{ color: 'var(--h-naranja)' }}
              >
                <TituloAnimado texto="Halloween" />
              </h1>
            </>
          )}

          <div className="flex justify-center mt-4">
            <p
              className="halloween-mano halloween-recorte-globo m-0 max-w-[420px] px-[22px] pt-3 pb-3.5 leading-[1.2] text-pretty text-[clamp(20px,5.4vw,26px)] -rotate-[1.5deg]"
              style={{ background: 'var(--h-lila)' }}
            >
              Disfraces + accesorios + decoración para una noche bien terrorífica ♥
            </p>
          </div>

          {collage.length === 3 && (
            <div className="relative z-[2] mx-auto mt-8 flex max-w-[460px] items-end justify-center h-[clamp(170px,48vw,230px)]">
              {collage.map((item, i) => {
                const forma = [
                  { ancho: '36%', giro: -7, retraso: '0s', margen: { marginRight: '-4%' }, z: 1, pad: 26 },
                  { ancho: '40%', giro: 3, retraso: '-1.6s', margen: { marginBottom: 22 }, z: 2, pad: 30 },
                  { ancho: '34%', giro: 8, retraso: '-3s', margen: { marginLeft: '-4%' }, z: 1, pad: 24 },
                ][i];
                return (
                  <div
                    key={item.id}
                    className="halloween-polaroid hw-float"
                    style={{
                      width: forma.ancho,
                      transform: `rotate(${forma.giro}deg)`,
                      ['--r' as string]: `${forma.giro}deg`,
                      animationDelay: forma.retraso,
                      zIndex: forma.z,
                      paddingBottom: forma.pad,
                      ...forma.margen,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.fotoUrl}
                      alt=""
                      className="block w-full aspect-square object-cover"
                      style={{ background: 'var(--h-foto)' }}
                    />
                  </div>
                );
              })}

              <div
                className="halloween-mano absolute right-[-6px] top-[-18px] z-[3] max-w-[118px] px-3 py-2 text-[16px] leading-[1.1] rotate-[9deg]"
                style={{
                  background: 'var(--h-lila)',
                  borderRadius: '10px 26px 10px 22px',
                  boxShadow: '0 4px 10px rgb(42 27 69 / 0.1)',
                }}
              >
                ¡Pedidos hasta el 20 de octubre! Stock limitado ♥
              </div>
            </div>
          )}

          {(zonasGratis || descuentoPago) && (
            <div className="flex flex-wrap justify-center gap-2.5 mt-6">
              {descuentoPago && (
                <div
                  className="flex items-center rounded-full px-5 py-2.5 text-[16px] font-bold"
                  style={{ background: 'var(--h-naranja)', color: '#fff' }}
                >
                  {descuentoPago}
                </div>
              )}
              {/* Un solo chip con las zonas sin cargo: una por chip se leía como
                  una lista de precios. Las zonas con costo o a convenir no se
                  anuncian acá: se ven al elegir el envío en el pedido. */}
              {zonasGratis && (
                <div
                  className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-medium"
                  style={{ background: 'var(--h-tinta)', color: 'var(--h-crema)' }}
                >
                  <span className="font-bold" style={{ color: 'var(--h-naranja)' }}>
                    Envío gratis
                  </span>
                  <span>en {zonasGratis}</span>
                </div>
              )}
            </div>
          )}

          <p className="halloween-mano mt-4 text-[19px]" style={{ color: 'var(--h-tinta-suave)' }}>
            Tocá un producto para verlo en grande · sumá con +
          </p>
        </div>
      </header>

      {conProductos.length > 0 && (
        <nav
          aria-label="Secciones del catálogo"
          className="sticky top-0 z-20 mt-3.5 backdrop-blur-[10px]"
          style={{
            background: 'rgb(251 246 238 / 0.92)',
            borderBottom: '1px solid rgb(42 27 69 / 0.08)',
          }}
        >
          <div className="max-w-[1100px] mx-auto px-4 pt-3">
            <label className="relative block">
              <span className="sr-only">Buscar en el catálogo</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[16px]"
              >
                🔍
              </span>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={`Buscar entre ${visibles.length} productos`}
                className="w-full rounded-full border-2 bg-white py-2.5 pl-11 pr-4 text-[16px] outline-none"
                style={{ borderColor: 'var(--h-tinta)', color: 'var(--h-tinta)' }}
              />
            </label>
          </div>
          <div
            ref={fila}
            className="halloween-sin-barra flex gap-2 overflow-x-auto px-4 py-3 max-w-[1100px] mx-auto"
          >
            {conProductos.map((c, i) => {
              const esActiva = activa === c.id;
              return (
                <button
                  key={c.id}
                  data-chip={c.id}
                  onClick={() => irA(c.id)}
                  aria-current={esActiva ? 'true' : undefined}
                  className="shrink-0 rounded-full border-2 px-3.5 py-2 text-[14px] font-semibold uppercase tracking-[0.03em] whitespace-nowrap"
                  style={{
                    borderColor: 'var(--h-tinta)',
                    background: esActiva ? 'var(--h-tinta)' : COLORES[i % 3],
                    color: esActiva ? 'var(--h-crema)' : 'var(--h-tinta)',
                  }}
                >
                  {c.nombre}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {desactualizada && <AvisoDesactualizado />}

      <main className="max-w-[1100px] mx-auto px-4 pt-2">
        {consulta ? (
          <section aria-live="polite" className="pt-6">
            <p className="halloween-mano mb-4 text-[20px]" style={{ color: 'var(--h-tinta-suave)' }}>
              {encontrados.length
                ? `${encontrados.length} ${encontrados.length === 1 ? 'producto' : 'productos'} para “${busqueda.trim()}”`
                : `No encontramos “${busqueda.trim()}”. Escribinos y te lo conseguimos.`}
            </p>
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
              {encontrados.map((item) => (
                <TarjetaProducto
                  key={item.id}
                  item={item}
                  onAbrir={setAbierto}
                  efectivo={efectivo}
                />
              ))}
            </div>
          </section>
        ) : (
          conProductos.map((c, i) => (
            <SeccionCategoria
              key={c.id}
              categoria={c}
              items={porCategoria.get(c.id) ?? []}
              color={COLORES[i % 3]}
              inclinacion={i % 2 ? '1.2deg' : '-1.4deg'}
              onAbrir={setAbierto}
              aviso={aPedido.has(c.id) ? AVISO_A_PEDIDO : undefined}
              efectivo={efectivo}
            />
          ))
        )}

        {!visibles.length && (
          <div className="px-8 py-20 text-center">
            <div className="hw-bob text-[64px]" aria-hidden="true">
              🎃
            </div>
            <p className="halloween-mano mt-4 text-[24px]">
              Todavía no hay nada cargado en el catálogo.
            </p>
          </div>
        )}

        {linkConsulta && (
          <section
            className="halloween-recorte-panel relative mt-12 overflow-hidden px-[22px] pt-[30px] pb-7"
            style={{ background: 'var(--h-tinta)', color: 'var(--h-crema)' }}
          >
            <div aria-hidden="true">
              <div
                className="absolute top-3.5 right-5 text-[20px]"
                style={{ color: 'var(--h-naranja)', animation: 'hw-twinkle 2.2s ease-in-out infinite' }}
              >
                ✦
              </div>
              <div
                className="absolute bottom-[18px] right-11 text-[14px]"
                style={{
                  color: 'var(--h-lila-medio)',
                  animation: 'hw-twinkle 2.8s ease-in-out -1s infinite',
                }}
              >
                ✦
              </div>
              <div
                className="hw-bob absolute top-[26px] text-[clamp(46px,12vw,80px)]"
                style={{ right: 'clamp(20px,8vw,90px)', ['--r' as string]: '-10deg' }}
              >
                🎃
              </div>
              <div
                className="hw-ghost absolute top-24 text-[clamp(26px,7vw,40px)]"
                style={{ right: 'clamp(64px,22vw,200px)' }}
              >
                👻
              </div>
            </div>

            <div className="relative">
              <h2
                className="m-0 max-w-[70%] font-bold leading-[1] text-[clamp(30px,8vw,48px)]"
                style={{ color: 'var(--h-naranja)' }}
              >
                ¿No encontrás lo que buscás?
              </h2>
              <p
                className="halloween-mano mt-3.5 max-w-[460px] text-[21px] leading-[1.25] text-pretty"
                style={{ color: '#e9e0f7' }}
              >
                Tenemos muchos más disfraces, accesorios y decoración. Contanos qué necesitás y te lo
                conseguimos.
              </p>
              <a
                href={linkConsulta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 mt-5 rounded-full px-[22px] py-3.5 font-semibold text-[16px] text-white no-underline"
                style={{ background: 'var(--h-naranja)' }}
              >
                Pedilo por WhatsApp →
              </a>
            </div>
          </section>
        )}
      </main>

      <footer
        className="relative mt-20 px-5 pt-11 pb-10 text-center"
        style={{
          background: 'var(--h-tinta)',
          color: 'var(--h-crema)',
          borderRadius: '50% 50% 0 0 / 36px 36px 0 0',
        }}
      >
        <div aria-hidden="true">
          <div
            className="hw-bob absolute -top-11 text-[54px]"
            style={{ left: 'clamp(12px,6vw,80px)', ['--r' as string]: '-8deg' }}
          >
            🎃
          </div>
          <div
            className="absolute -top-[30px] text-[38px]"
            style={{
              right: 'clamp(16px,8vw,100px)',
              ['--r' as string]: '10deg',
              animation: 'hw-bob 3.6s ease-in-out -1.2s infinite',
            }}
          >
            🎃
          </div>
          <div className="hw-ghost absolute top-3.5 right-[28%] text-[22px]">🦇</div>
        </div>

        <div className="relative mx-auto flex max-w-[560px] flex-col items-center gap-3.5">
          <div className="text-[28px] font-bold leading-none">{nombre}</div>

          {zonasGratis && (
            <div className="text-[20px] font-bold uppercase tracking-[0.04em]">
              Envío gratis
              <span
                className="block mt-1.5 text-[13px] font-medium tracking-[0.08em]"
                style={{ color: 'var(--h-lila-medio)' }}
              >
                en {zonasGratis}
              </span>
            </div>
          )}

          {carta.config.notas.map((n, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? 'halloween-mano m-0 text-[19px] leading-[1.3] text-pretty'
                  : 'm-0 text-[12.5px]'
              }
              style={{ color: i === 0 ? '#e9e0f7' : '#9c8db8' }}
            >
              {n}
            </p>
          ))}
        </div>
      </footer>

      {abierto && (
        <ModalProducto item={abierto} aviso={avisoDe(abierto)} onCerrar={() => setAbierto(null)} />
      )}

      <BarraPedidoHalloween items={visibles} configPedido={configPedido} />
    </div>
  );
}

function SeccionCategoria({
  categoria,
  items,
  color,
  inclinacion,
  onAbrir,
  aviso,
  efectivo,
}: {
  categoria: Categoria;
  items: Item[];
  color: string;
  inclinacion: string;
  onAbrir: (item: Item) => void;
  /** Condición de venta de toda la sección, abajo del título. */
  aviso?: string;
  efectivo: Descuento;
}) {
  const [desplegada, setDesplegada] = useState(false);
  const [subgrupo, setSubgrupo] = useState<string | null>(null);

  // Los subgrupos que de verdad tienen productos, en el orden de la categoría.
  const subgrupos = [...categoria.subcategorias]
    .sort((a, b) => a.orden - b.orden)
    .map((s) => ({ nombre: s.nombre, cantidad: items.filter((i) => i.subcategoria === s.nombre).length }))
    .filter((s) => s.cantidad > 0);
  const delSubgrupo = subgrupo ? items.filter((i) => i.subcategoria === subgrupo) : items;

  const adorno = ADORNO_CATEGORIA[categoria.nombre];
  const conPrecio = items.map(precioDesde).filter((p) => p > 0);
  const desde = conPrecio.length ? Math.min(...conPrecio) : 0;

  // Con 133 animatrónicos en una sola grilla, quien entró a mirar tres
  // disfraces se come cuarenta pantallas de scroll para llegar a la sección
  // siguiente. Se muestran los primeros y el resto se despliega: el que vino
  // a comprar un animatrónico toca el botón, el que no, sigue de largo.
  const visibles = desplegada ? delSubgrupo : delSubgrupo.slice(0, TOPE_SIN_DESPLEGAR);
  const ocultos = delSubgrupo.length - visibles.length;

  return (
    <section
      id={`cat-${categoria.id}`}
      data-seccion={categoria.id}
      aria-labelledby={`titulo-${categoria.id}`}
      className="pt-[34px] scroll-mt-[70px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 mb-1.5">
        <h2
          id={`titulo-${categoria.id}`}
          className="halloween-mano halloween-recorte m-0 flex items-center gap-2.5 px-[18px] pt-1.5 pb-2 uppercase leading-[1.1] tracking-[0.02em] text-[clamp(28px,7.5vw,38px)]"
          style={{ background: color, transform: `rotate(${inclinacion})` }}
        >
          {adorno && (
            <span className="hw-wiggle text-[0.8em]" aria-hidden="true">
              {adorno.icono}
            </span>
          )}
          {categoria.nombre}
        </h2>

        {desde > 0 && (
          <div className="halloween-mano text-[20px] whitespace-nowrap">
            Desde{' '}
            <span className="font-bold" style={{ fontFamily: 'var(--h-fuente)', color: 'var(--h-naranja)' }}>
              {formatearPrecio(desde)}
            </span>
          </div>
        )}
      </div>

      {adorno && (
        <p
          className="halloween-mano mt-2.5 mb-4 text-[19px] text-pretty"
          style={{ color: 'var(--h-tinta-suave)' }}
        >
          {adorno.bajada}
        </p>
      )}

      {aviso && (
        <p
          className="mt-1 mb-4 rounded-[10px] px-3.5 py-2.5 text-[14.5px] font-semibold leading-[1.35] text-pretty"
          style={{ background: 'var(--h-durazno)', color: 'var(--h-tinta)' }}
        >
          {aviso}
        </p>
      )}

      {subgrupos.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={`Filtrar ${categoria.nombre}`}>
          {[{ nombre: null, cantidad: items.length }, ...subgrupos].map((s) => {
            const elegido = subgrupo === s.nombre;
            return (
              <button
                key={s.nombre ?? 'todos'}
                type="button"
                aria-pressed={elegido}
                onClick={() => {
                  setSubgrupo(s.nombre);
                  setDesplegada(false);
                }}
                className="rounded-full border-2 px-3.5 py-1.5 text-[14px] font-semibold"
                style={{
                  borderColor: 'var(--h-tinta)',
                  background: elegido ? 'var(--h-tinta)' : 'var(--h-crema)',
                  color: elegido ? 'var(--h-crema)' : 'var(--h-tinta)',
                }}
              >
                {s.nombre ?? 'Todos'} · {s.cantidad}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
        {visibles.map((item) => (
          <TarjetaProducto key={item.id} item={item} onAbrir={onAbrir} efectivo={efectivo} />
        ))}
      </div>

      {(ocultos > 0 || desplegada) && (
        <button
          type="button"
          onClick={() => setDesplegada((v) => !v)}
          aria-expanded={desplegada}
          className="mt-4 w-full rounded-full border-2 py-3 text-[15px] font-semibold"
          style={{ borderColor: 'var(--h-tinta)', color: 'var(--h-tinta)' }}
        >
          {desplegada ? 'Ver menos' : `Ver los ${delSubgrupo.length} →`}
        </button>
      )}
    </section>
  );
}
