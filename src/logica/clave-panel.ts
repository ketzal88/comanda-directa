/** El nombre del header por el que viaja la clave del panel, en texto plano.
 *
 *  Vive en `logica/` y no adentro de `app/api/` porque el nombre es un
 *  contrato con la extensión de Chrome, y la extensión NO puede importar un
 *  módulo de `app/`: le arrastraría `next/server` y el cliente de Supabase al
 *  bundle, y su `tsconfig.json` ni siquiera resuelve el alias `@/`.
 *  Retipearlo del otro lado sería peor: dos copias que se desfasen dejan la
 *  confirmación devolviendo 401 para siempre, y el local imprimiendo sin que
 *  se guarde nada.
 *
 *  Hoy lo usa sólo `extension-comandas/src/guardar.ts`. El motor todavía no
 *  tiene las rutas `/api/pedidos` que ese módulo llama (el registro de pedidos
 *  está en Sagrado Sushi y no se portó todavía): el archivo está acá porque sin
 *  él la extensión ni siquiera compila, y para que el día que se porte el
 *  registro el nombre del header ya sea uno solo.
 *
 *  Este archivo no importa nada a propósito. Cualquier import que se le
 *  agregue termina adentro del bundle de la extensión. */
export const HEADER_CLAVE = 'x-clave-panel';
