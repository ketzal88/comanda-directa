/** Los dos datos que el local carga una sola vez en la pantalla de opciones:
 *  a qué sitio se le guarda el pedido y con qué clave.
 *
 *  Van en `chrome.storage.local` y no en `sync`: la clave del panel es de esta
 *  computadora, no de la cuenta de Google de quien esté logueado en Chrome. */

export type Ajustes = {
  /** La dirección del sitio, sin barra final (p. ej. `https://carta.sagradosushi.com`). */
  direccion: string;
  /** La clave del panel, en texto plano: viaja en un header y la ruta la
   *  compara con la del servidor. */
  clave: string;
};

const CLAVE_DIRECCION = 'direccion';
const CLAVE_CLAVE = 'clave';

export async function leerAjustes(): Promise<Ajustes> {
  const guardado = await chrome.storage.local.get([CLAVE_DIRECCION, CLAVE_CLAVE]);
  // strings siempre: el resto del código no tiene que preguntarse si el
  // storage está vacío (lo está la primera vez, y después de un reinstalo)
  return {
    direccion: typeof guardado[CLAVE_DIRECCION] === 'string' ? guardado[CLAVE_DIRECCION] : '',
    clave: typeof guardado[CLAVE_CLAVE] === 'string' ? guardado[CLAVE_CLAVE] : '',
  };
}

export async function guardarAjustes(ajustes: Ajustes): Promise<void> {
  await chrome.storage.local.set({
    [CLAVE_DIRECCION]: ajustes.direccion,
    [CLAVE_CLAVE]: ajustes.clave,
  });
}
