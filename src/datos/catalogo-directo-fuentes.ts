import 'server-only';

/** Las URLs de las hojas "Catálogo" de los pedidos directos, por cliente.
 *
 *  Viven acá y no en `clientes/pedidos-directos.ts` porque ese módulo lo
 *  importa un client component y todo lo suyo viaja al bundle del navegador.
 *  La URL de export es, en la práctica, la llave a la planilla entera: incluye
 *  las columnas internas (precio mayorista, link al proveedor, costo, ganancia)
 *  que el server descarta antes de armar la página. Si se filtra al cliente,
 *  cualquiera la abre y ve todo eso. `import 'server-only'` garantiza que este
 *  módulo nunca entre en un bundle de cliente.
 *
 *  La planilla `catalogo-minorista-halloween-v2`, hoja "Catálogo"
 *  (`gid=758136050`), es la misma de las vitrinas de disfraces (ver
 *  `clientes/vitrinas.ts`), otra hoja. Se lee con el export de Google porque
 *  está compartida por link; si se deja de compartir, publicar la hoja como
 *  CSV y cambiar esta URL por la de "Publicar en la web". */
export const CSV_CATALOGOS: Record<string, string> = {
  'party-market':
    'https://docs.google.com/spreadsheets/d/1NrjjQeQIDaHqJzXnZ36PneYNqmgaMDe-1sq2x7umS1k/export?format=csv&gid=758136050',
};

/** La página del producto en el proveedor, por `slug` de producto. De ahí sale
 *  la foto (y el video, cuando lo hay): la ruta `/<cliente>/pedido-foto/<slug>`
 *  y `/<cliente>/pedido-video/<slug>` las leen del lado del servidor (página →
 *  og:image / mp4 → bytes) y las sirven bajo NUESTRO dominio. El cliente nunca
 *  ve el link del proveedor, igual que en la ruta de fotos de los disfraces.
 *
 *  Por eso este mapa vive en el módulo `server-only` y no en el manifiesto de
 *  `clientes/pedidos-directos.ts` (que viaja al navegador). `video` marca los
 *  productos que además tienen un video en la página; se verificó a mano. El
 *  que no tiene página (hoy, "Lápida con Luz y Sonido", sin ficha en la
 *  planilla) no está acá y cae al placeholder. */
export type FichaDirecta = { pagina: string; video?: boolean };

const M = (p: string) => `https://mayoristas.merakys.com.ar/producto/${p}/`;

export const FICHAS_CATALOGOS: Record<string, Record<string, FichaDirecta>> = {
  'party-market': {
    'inflable-castillo-halloween': { pagina: M('inflable-castillo-halloween-2'), video: true },
    'inflable-amigos-rip': { pagina: M('inflable-amigos-r-i-p-2'), video: true },
    'inflable-esqueleto-fantasma': { pagina: M('inflable-esqueleto-fantasma'), video: true },
    'magia-negra': { pagina: M('magia-negra') },
    'calabaza-vestida-brillante': { pagina: M('calabaza-brillante-preventa'), video: true },
    'bruja-de-pie-con-escoba': { pagina: M('bruja-de-pie-con-escoba-preventa'), video: true },
    'lapida-despertar-de-los-muertos': { pagina: M('lapida-despertar-de-los-muertos') },
    'escoba-caminante': { pagina: M('escoba-caminante-luz-sonido-y-movimiento'), video: true },
    'huevo-atrapado': { pagina: M('huevo-atrapado') },
    'colgante-brujita-macabra': { pagina: M('colgante-brujita-macabra') },
    'colgante-abandonada-en-el-altar': { pagina: M('colgante-abandonada-en-el-altar') },
  },
};
