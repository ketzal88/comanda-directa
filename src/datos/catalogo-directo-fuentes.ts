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
