import type { EntradaManifiesto } from '@/logica/catalogo-directo';

/** Catálogos de "pedidos directos": productos de una unidad que se encargan
 *  sueltos, en una página propia servida en `/<cliente>/<ruta>` (ver
 *  `app/[cliente]/[vitrina]/route.ts`). Hoy, los animatrónicos e inflables de
 *  Halloween de Party Market.
 *
 *  Por qué están acá y no en la carta de Supabase: la carta lee de la base y
 *  el stock se descuenta desde el panel. Este catálogo, en cambio, se lee en
 *  vivo de la hoja "Catálogo" de la planilla del cliente, así cuando él carga
 *  una venta (y el Disponible de la hoja baja a 0) el producto se agota solo,
 *  sin tocar nada más. El precio también sale de la hoja (columnas E y F); el
 *  manifiesto sólo pone lo editorial que la hoja no tiene: nombre lindo,
 *  categoría, descripción y, cuando estén, foto y video.
 *
 *  La hoja trae columnas internas (precio mayorista, link al proveedor, costo,
 *  ganancia). `logica/catalogo-directo.ts` las descarta antes de armar la
 *  página: nada del proveedor llega al navegador.
 *
 *  La URL del CSV NO vive acá: este módulo lo importa un client component
 *  (`CartaHalloween`), así que todo lo de acá termina en el bundle del
 *  navegador. La URL es, de hecho, la llave a la hoja completa (incluidas esas
 *  columnas internas), así que vive en `datos/catalogo-directo-fuentes.ts`,
 *  que es `server-only`. */
export type CatalogoDirecto = {
  /** Segmento de la URL: `/<cliente>/<ruta>`. */
  ruta: string;
  /** Plantilla en `clientes/vitrinas/<cliente>/<plantilla>.html`. */
  plantilla: string;
  titulo: string;
  /** Leyenda fija de envío, abajo del encabezado y en cada pedido. */
  leyenda: string;
  /** Las categorías, en el orden en que se muestran. */
  categorias: string[];
  manifiesto: EntradaManifiesto[];
};

/** Los 12 productos de la sección, con su nombre en la hoja para casar el
 *  precio y el stock. La descripción y el nombre que ve el cliente los dio el
 *  cliente; el precio NO se guarda acá a propósito (sale siempre de la hoja,
 *  para que no haya dos números que mantener). */
const MANIFIESTO_PARTY_MARKET: EntradaManifiesto[] = [
  {
    hoja: 'Inflable Castillo Halloween',
    slug: 'inflable-castillo-halloween',
    nombre: 'Inflable Castillo Halloween',
    categoria: 'Inflables',
    descripcion:
      'Castillo embrujado inflable, fácil de inflar. Ideal para ambientar fiestas de Halloween, eventos temáticos y cumpleaños de terror.',
    medida: '2,7 m',
  },
  {
    hoja: 'Inflable Amigos R.I.P.',
    slug: 'inflable-amigos-rip',
    nombre: 'Inflable Amigos R.I.P.',
    categoria: 'Inflables',
    descripcion:
      'Inflable con temática de cementerio para decorar el jardín, la entrada o el salón de la fiesta.',
    medida: '1,8 m',
  },
  {
    hoja: 'Inflable Esqueleto Fantasma',
    slug: 'inflable-esqueleto-fantasma',
    nombre: 'Inflable Esqueleto Fantasma',
    categoria: 'Inflables',
    descripcion:
      'Esqueleto fantasma inflable para recibir a los invitados en la puerta o sumar al jardín.',
    medida: '1,2 m',
  },
  {
    hoja: 'Magia Negra',
    slug: 'magia-negra',
    nombre: 'Magia Negra',
    categoria: 'Animatronics',
    descripcion:
      'Animatronic de magia oscura, pensado para ser la figura principal de la decoración.',
    medida: '190 × 39 × 45 cm',
  },
  {
    hoja: 'Calabaza Vestida Brillante',
    slug: 'calabaza-vestida-brillante',
    nombre: 'Calabaza Vestida Brillante',
    categoria: 'Animatronics',
    descripcion:
      'Figura de calabaza vestida con detalles brillantes, muy llamativa para la entrada o el living.',
    // Sin `medida` a propósito: el cliente no confirmó la medida (lo más
    // parecido en el Excel, "Calabaza Brillante con Luz" 190 × 146 × 17 cm, no
    // está confirmado que sea el mismo producto). Se suma cuando se verifique.
  },
  {
    hoja: 'Bruja de Pie con Escoba',
    slug: 'bruja-de-pie-con-escoba',
    nombre: 'Bruja de Pie con Escoba',
    categoria: 'Animatronics',
    descripcion: 'Bruja de pie con su escoba, para recibir a los invitados en la entrada.',
    medida: '134 × 88 × 15 cm',
  },
  // "Lápida con Luz y Sonido" se saca a propósito: no tiene ficha en la
  // planilla, así que no hay foto ni video del proveedor y la tarjeta quedaba
  // con el placeholder. Si más adelante aparece la ficha (o una foto propia),
  // se vuelve a sumar acá con su entrada en FICHAS_CATALOGOS.
  {
    hoja: 'Lápida Despertar de los Muertos',
    slug: 'lapida-despertar-de-los-muertos',
    nombre: 'Lápida Despertar de los Muertos',
    categoria: 'Animatronics',
    descripcion: 'Lápida temática para completar el cementerio de Halloween.',
    medida: '56 × 34 × 9,5 cm',
  },
  {
    hoja: 'Escoba Caminante',
    slug: 'escoba-caminante',
    nombre: 'Escoba Caminante',
    categoria: 'Animatronics',
    descripcion: 'Escoba de bruja con luz, sonido y movimiento: camina sola.',
    medida: '68 × 44 × 43 cm',
  },
  {
    hoja: 'Huevo Atrapado',
    slug: 'huevo-atrapado',
    nombre: 'Huevo Atrapado',
    // Es un colgante: va en Colgantes, no en Animatronics.
    categoria: 'Colgantes',
    descripcion:
      'Animatronic de terror para sorprender a los invitados en cualquier rincón de la casa.',
    medida: '42 × 13 × 13 cm',
  },
  {
    hoja: 'Colgante Brujita Macabra',
    slug: 'colgante-brujita-macabra',
    nombre: 'Colgante Brujita Macabra',
    categoria: 'Colgantes',
    descripcion: 'Brujita para colgar del techo, de una puerta o de un árbol.',
    medida: '110 × 26 × 30 cm',
  },
  {
    hoja: 'Colgante Abandonada en el Altar',
    slug: 'colgante-abandonada-en-el-altar',
    nombre: 'Colgante Abandonada en el Altar',
    categoria: 'Colgantes',
    descripcion: 'Novia abandonada para colgar en una puerta, un pasillo o la entrada.',
  },
];

export const CATALOGOS_DIRECTOS: Record<string, CatalogoDirecto> = {
  'party-market': {
    ruta: 'animatronics',
    plantilla: 'animatronics',
    titulo: 'Animatronics e inflables de Halloween',
    leyenda: 'Envío gratis en Villanueva y Nordelta.',
    categorias: ['Inflables', 'Animatronics', 'Colgantes'],
    manifiesto: MANIFIESTO_PARTY_MARKET,
  },
};

/** El catálogo directo del cliente para una ruta pedida, o null. */
export function catalogoDirectoDe(slug: string, ruta: string): CatalogoDirecto | null {
  const cat = CATALOGOS_DIRECTOS[slug];
  return cat && cat.ruta === ruta ? cat : null;
}
