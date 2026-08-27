import { guardarAjustes, leerAjustes } from './ajustes';
import { direccionUsable, probarConexion } from './guardar';
import type { Ajustes } from './ajustes';

/** La pantalla de opciones: dirección del sitio y clave del panel.
 *
 *  Se carga una vez, en la computadora del mostrador. El botón de probar
 *  conexión existe porque sin él la única forma de saber si la clave está bien
 *  es imprimir un pedido de verdad y ver si aparece en el historial. */

function campo(id: string): HTMLInputElement {
  const elemento = document.getElementById(id);
  if (!(elemento instanceof HTMLInputElement)) throw new Error(`Falta el campo ${id}`);
  return elemento;
}

function boton(id: string): HTMLButtonElement {
  const elemento = document.getElementById(id);
  if (!(elemento instanceof HTMLButtonElement)) throw new Error(`Falta el botón ${id}`);
  return elemento;
}

const direccion = campo('direccion');
const clave = campo('clave');
const estado = document.getElementById('estado') as HTMLParagraphElement;

function avisar(texto: string, bien: boolean): void {
  estado.textContent = texto;
  estado.className = bien ? 'bien' : 'mal';
}

/** Lo escrito en pantalla, ya normalizado, o `null` si no sirve. La dirección
 *  se guarda sin la barra final para que las URLs no queden con dos. */
function loEscrito(): Ajustes | null {
  const base = direccionUsable(direccion.value);
  if (!base) {
    avisar('La dirección tiene que empezar con https:// (o http:// para localhost).', false);
    return null;
  }
  if (!clave.value.trim()) {
    avisar('Falta la clave del panel.', false);
    return null;
  }
  return { direccion: base, clave: clave.value.trim() };
}

async function guardar(): Promise<Ajustes | null> {
  const ajustes = loEscrito();
  if (!ajustes) return null;
  await guardarAjustes(ajustes);
  // se reescriben los campos con lo normalizado: si le sacamos la barra final,
  // que se vea
  direccion.value = ajustes.direccion;
  clave.value = ajustes.clave;
  return ajustes;
}

boton('guardar').addEventListener('click', () => {
  void (async () => {
    const ajustes = await guardar();
    if (ajustes) avisar('Guardado.', true);
  })();
});

boton('probar').addEventListener('click', () => {
  void (async () => {
    // guarda antes de probar: si no, se puede terminar con una configuración
    // probada que nunca se guardó
    const ajustes = await guardar();
    if (!ajustes) return;

    avisar('Probando…', true);
    const resultado = await probarConexion(ajustes, (url, opciones) => fetch(url, opciones));
    avisar(
      resultado.ok
        ? 'Listo: el sitio contesta y la clave sirve.'
        : `${resultado.motivo} (guardado igual)`,
      resultado.ok,
    );
  })();
});

void (async () => {
  const ajustes = await leerAjustes();
  direccion.value = ajustes.direccion;
  clave.value = ajustes.clave;
})();
