import { build } from 'esbuild';

/** Las tres partes de la extensión, cada una con su propio bundle: el content
 *  script que corre dentro de WhatsApp Web, el service worker que le habla al
 *  sitio, y la pantalla de opciones.
 *
 *  Los nombres tienen que coincidir con lo que declara `manifest.json`
 *  (`content_scripts[].js`, `background.service_worker`) y con lo que carga
 *  `opciones.html`. Y si acá se agrega una entrada, hay que agregarla también
 *  en `scripts/empaquetar-extension.ts` del repo principal, que es el ZIP que
 *  se baja el local: un manifest que apunta a un archivo que no está en el ZIP
 *  hace que Chrome se niegue a cargar la carpeta entera. */
const ENTRADAS = ['content-script', 'worker', 'opciones'];

await build({
  entryPoints: ENTRADAS.map((nombre) => `src/${nombre}.ts`),
  bundle: true,
  outdir: 'dist',
  format: 'iife',
  target: 'chrome110',
});

console.log(`Build OK: ${ENTRADAS.map((nombre) => `dist/${nombre}.js`).join(', ')}`);
