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
 *  página: nada del proveedor llega al navegador. */
export type CatalogoDirecto = {
  /** Segmento de la URL: `/<cliente>/<ruta>`. */
  ruta: string;
  /** Plantilla en `clientes/vitrinas/<cliente>/<plantilla>.html`. */
  plantilla: string;
  titulo: string;
  /** Leyenda fija de envío, abajo del encabezado y en cada pedido. */
  leyenda: string;
  /** La hoja "Catálogo" exportada como CSV. Se lee del lado del servidor. */
  csv: string;
  /** Las categorías, en el orden en que se muestran. */
  categorias: string[];
  manifiesto: EntradaManifiesto[];
};

/** La planilla `catalogo-minorista-halloween-v2`, hoja "Catálogo"
 *  (`gid=758136050`). Es la misma planilla de las vitrinas de disfraces (ver
 *  `clientes/vitrinas.ts`), otra hoja. Se lee con el export de Google porque
 *  está compartida por link; si se deja de compartir, publicar la hoja como
 *  CSV y cambiar esta URL por la de "Publicar en la web". */
const CSV_CATALOGO_PARTY_MARKET =
  'https://docs.google.com/spreadsheets/d/1NrjjQeQIDaHqJzXnZ36PneYNqmgaMDe-1sq2x7umS1k/export?format=csv&gid=758136050';

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
  },
  {
    hoja: 'Inflable Amigos R.I.P.',
    slug: 'inflable-amigos-rip',
    nombre: 'Inflable Amigos R.I.P.',
    categoria: 'Inflables',
    descripcion:
      'Inflable con temática de cementerio para decorar el jardín, la entrada o el salón de la fiesta.',
  },
  {
    hoja: 'Inflable Esqueleto Fantasma',
    slug: 'inflable-esqueleto-fantasma',
    nombre: 'Inflable Esqueleto Fantasma',
    categoria: 'Inflables',
    descripcion:
      'Esqueleto fantasma inflable para recibir a los invitados en la puerta o sumar al jardín.',
  },
  {
    hoja: 'Magia Negra',
    slug: 'magia-negra',
    nombre: 'Magia Negra',
    categoria: 'Animatronics',
    descripcion:
      'Animatronic de magia oscura, pensado para ser la figura principal de la decoración.',
  },
  {
    hoja: 'Calabaza Vestida Brillante',
    slug: 'calabaza-vestida-brillante',
    nombre: 'Calabaza Vestida Brillante',
    categoria: 'Animatronics',
    descripcion:
      'Figura de calabaza vestida con detalles brillantes, muy llamativa para la entrada o el living.',
  },
  {
    hoja: 'Bruja de Pie con Escoba',
    slug: 'bruja-de-pie-con-escoba',
    nombre: 'Bruja de Pie con Escoba',
    categoria: 'Animatronics',
    descripcion: 'Bruja de pie con su escoba, para recibir a los invitados en la entrada.',
  },
  {
    hoja: 'Lápida con Luz y Sonido',
    slug: 'lapida-con-luz-y-sonido',
    nombre: 'Lápida con Luz y Sonido',
    categoria: 'Animatronics',
    descripcion: 'Lápida con luz y sonido para armar un cementerio en el jardín o la entrada.',
  },
  {
    hoja: 'Lápida Despertar de los Muertos',
    slug: 'lapida-despertar-de-los-muertos',
    nombre: 'Lápida Despertar de los Muertos',
    categoria: 'Animatronics',
    descripcion: 'Lápida temática para completar el cementerio de Halloween.',
  },
  {
    hoja: 'Escoba Caminante',
    slug: 'escoba-caminante',
    nombre: 'Escoba Caminante',
    categoria: 'Animatronics',
    descripcion: 'Escoba de bruja con luz, sonido y movimiento: camina sola.',
  },
  {
    hoja: 'Huevo Atrapado',
    slug: 'huevo-atrapado',
    nombre: 'Huevo Atrapado',
    categoria: 'Animatronics',
    descripcion:
      'Animatronic de terror para sorprender a los invitados en cualquier rincón de la casa.',
  },
  {
    hoja: 'Colgante Brujita Macabra',
    slug: 'colgante-brujita-macabra',
    nombre: 'Colgante Brujita Macabra',
    categoria: 'Colgantes',
    descripcion: 'Brujita para colgar del techo, de una puerta o de un árbol.',
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
    csv: CSV_CATALOGO_PARTY_MARKET,
    categorias: ['Inflables', 'Animatronics', 'Colgantes'],
    manifiesto: MANIFIESTO_PARTY_MARKET,
  },
};

/** El catálogo directo del cliente para una ruta pedida, o null. */
export function catalogoDirectoDe(slug: string, ruta: string): CatalogoDirecto | null {
  const cat = CATALOGOS_DIRECTOS[slug];
  return cat && cat.ruta === ruta ? cat : null;
}
