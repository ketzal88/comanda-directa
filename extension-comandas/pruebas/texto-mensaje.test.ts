/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { parsearMensaje } from '../src/parser';
import { telefonoDelChat, textoDelMensaje } from '../src/texto-mensaje';

/** La fila de mensaje tal cual la arma WhatsApp Web, capturada del navegador
 *  real el 26/8/2026 sobre el pedido de prueba. Lo que importa del fixture y
 *  no se puede tocar:
 *
 *  - cada línea del pedido es un `<span>` aparte y el salto de línea va
 *    ADENTRO del span (por eso hay saltos reales en medio del HTML: si se
 *    reindenta o se normaliza, el fixture deja de reproducir el DOM real);
 *  - el título del ícono de la colita del globo ("tail-out") está FUERA del
 *    `.copyable-text`;
 *  - la hora aparece dos veces al final, una de ellas en un `aria-hidden`
 *    que sí está adentro del `.copyable-text`, pegado a las aclaraciones;
 *  - los asteriscos de negrita llegan renderizados como `<strong>`, así que
 *    el texto extraído no los tiene (que es lo que espera `parsearMensaje`).
 *
 *  `@@PLANTILLA@@` está en lugar del valor real del atributo decorativo
 *  `data-app-text-template`, que es un signo de dólar seguido de llaves y se
 *  interpolaría dentro del template literal. Se repone abajo. */
const FILA_HTML_CRUDA = `<div tabindex="-1" class="x1n2onr6 xscbp6u" data-id="3EB07DC7F8222875F0598F" data-testid="conv-msg-3EB07DC7F8222875F0598F"><div class="x78zum5 xdt5ytf" data-virtualized="false"><div><div class="x78zum5 xdt5ytf focusable-list-item"><span class=""></span><div data-testid="msg-container" class="x1liijdw xu342n7"><span data-testid="tail-out" aria-hidden="true" data-icon="tail-out" class="x1lliihq"><svg viewBox="0 0 8 13" height="13" width="8"><title>tail-out</title><path d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z"></path></svg></span><div class="x1liijdw xelbjmh"><div><span aria-label="Tú:"></span><div><div class="x9f619 x1hx0egp"><div class="copyable-text" data-pre-plain-text="[12:33 a. m., 26/8/2026] Gabriel Uccello: "><div class="x1n2onr6 x1mzt3pk"><span data-testid="selectable-text" dir="ltr" class="selectable-text copyable-text" style="min-height: 0px;"><span class="x1lliihq"><strong class="selectable-text copyable-text" data-testid="selectable-text" data-app-text-template="*@@PLANTILLA@@*">Pedido — Sagrado Sushi</strong>
</span><span class="x1lliihq">
</span><span class="x1lliihq">Delivery
</span><span class="x1lliihq">Pedido de prueba borrar
</span><span class="x1lliihq">
</span><span class="x1lliihq">Dirección: bulevard de todos los santos 5700, Lote 135
</span><span class="x1lliihq">
</span><span class="x1lliihq">1 × DUMPLINGS (4 U.) — $7.200
</span><span class="x1lliihq">1 × DUMPLING DE MARISCOS (4 U.) — $11.150
</span><span class="x1lliihq">1 × MOLLEJA — $8.400
</span><span class="x1lliihq">1 × EBICADO · 10 pz — $17.200
</span><span class="x1lliihq">1 × ALASKA ROLL · 5 pz — $10.300
</span><span class="x1lliihq">1 × PACÍFICO · 10 pz — $20.700
</span><span class="x1lliihq">
</span><span class="x1lliihq"><strong class="selectable-text copyable-text" data-testid="selectable-text" data-app-text-template="*@@PLANTILLA@@*">Total: $74.950</strong>
</span><span class="x1lliihq">
</span><span class="">Aclaraciones: es una prueba no hacer</span></span><span class=""><span class="x3nfvp2 xxymvpz" aria-hidden="true"><span class="x1c4vz4f xn6xy2s"></span><span class="x1c4vz4f">12:33 a. m.</span></span></span></div></div><div class="x1n2onr6 x1n327nk"><div class="x1bvqhpb xx3o462" data-testid="msg-meta" role="button"><span class="x1rg5ohu" dir="auto"><span class="x193iq5w">12:33 a. m.</span></span><div class="xhslqc4"><span aria-hidden="false" aria-label=" Entregado "><svg viewBox="0 0 24 24" width="16" fill="currentColor"><title>wds-ic-read</title><path d="M14.73 6.01a1 1 0 0 1 1.41-.15Z"></path></svg></span></div></div></div></div></div><span class=""></span><div class="x10l6tqk"></div></div></div></div><div class="x78zum5 xbfrwjf" data-testid="addon-bubble-container"></div></div></div></div>`;

const FILA_PEDIDO_HTML = FILA_HTML_CRUDA.replace(/@@PLANTILLA@@/g, () => '${appText}');

/** Lo que devolvía `innerText` sobre esta misma fila, medido en el navegador
 *  real (la implementación vieja, rota). Se guarda literal porque jsdom no
 *  implementa `innerText` y no puede reproducirlo: acá abajo no se puede
 *  llamar a `innerText` y esperar el bug, así que la evidencia es este valor
 *  capturado. Notar los `\n\n` entre TODAS las líneas, no solo entre bloques. */
const INNER_TEXT_DEL_NAVEGADOR =
  'Pedido — Sagrado Sushi\n\n\n\nDelivery\n\nPedido de prueba borrar\n\n\n\n' +
  'Dirección: bulevard de todos los santos 5700, Lote 135\n\n\n\n' +
  '1 × DUMPLINGS (4 U.) — $7.200\n\n1 × DUMPLING DE MARISCOS (4 U.) — $11.150\n\n' +
  '1 × MOLLEJA — $8.400\n\n1 × EBICADO · 10 pz — $17.200\n\n' +
  '1 × ALASKA ROLL · 5 pz — $10.300\n\n1 × PACÍFICO · 10 pz — $20.700\n\n\n\n' +
  'Total: $74.950\n\n\n\nAclaraciones: es una prueba no hacer\n12:33 a. m.';

/** El mensaje de sistema del cifrado de punta a punta: matchea el mismo
 *  selector de fila que un mensaje, pero no tiene `.copyable-text` adentro. */
const FILA_SISTEMA_HTML = `<div tabindex="-1" data-id="3EB0SISTEMA" data-testid="conv-msg-3EB0SISTEMA"><div><div data-testid="msg-container"><div><span>Los mensajes están cifrados de extremo a extremo.</span></div></div></div></div>`;

const SELECTOR_MENSAJE = '[data-testid^="conv-msg-"]';

/** Levanta el fixture con DOMParser en vez de asignar `innerHTML`: el HTML es
 *  una constante de este archivo y así el documento del test queda intacto. */
function filaDeMensaje(html: string): HTMLElement {
  const documento = new DOMParser().parseFromString(html, 'text/html');
  const fila = documento.querySelector<HTMLElement>(SELECTOR_MENSAJE);
  if (!fila) throw new Error('El fixture no tiene ninguna fila de mensaje');
  return fila;
}

function lineasUtiles(texto: string): string[] {
  return texto.split('\n').filter((linea) => linea.trim() !== '');
}

describe('textoDelMensaje sobre el DOM real de WhatsApp Web', () => {
  it('no arrastra el título del ícono de la colita del globo', () => {
    const texto = textoDelMensaje(filaDeMensaje(FILA_PEDIDO_HTML));

    expect(texto.startsWith('tail-out')).toBe(false);
    expect(texto).not.toContain('tail-out');
    expect(texto.startsWith('Pedido — Sagrado Sushi')).toBe(true);
  });

  it('no incluye la hora del mensaje, ni pegada al texto ni suelta al final', () => {
    const texto = textoDelMensaje(filaDeMensaje(FILA_PEDIDO_HTML));

    expect(texto).not.toContain('12:33 a. m.');
    expect(texto).not.toContain('12:33');
  });

  it('la última línea útil termina en las aclaraciones, sin nada pegado atrás', () => {
    const texto = textoDelMensaje(filaDeMensaje(FILA_PEDIDO_HTML));
    const lineas = lineasUtiles(texto);

    expect(lineas[lineas.length - 1]).toBe('Aclaraciones: es una prueba no hacer');
  });

  it('deja "Delivery" y el nombre en líneas consecutivas (regresión del bug de innerText)', () => {
    const texto = textoDelMensaje(filaDeMensaje(FILA_PEDIDO_HTML));
    const lineas = texto.split('\n');
    const indiceModalidad = lineas.indexOf('Delivery');

    expect(indiceModalidad).toBeGreaterThan(-1);
    // Un solo \n entre las dos: si se cuela una línea en blanco en el medio,
    // partirBloques() del parser las toma como dos bloques distintos, no
    // encuentra el nombre y descarta el pedido entero.
    expect(lineas[indiceModalidad + 1]).toBe('Pedido de prueba borrar');
    expect(texto).toContain('Delivery\nPedido de prueba borrar');
    expect(texto).not.toContain('Delivery\n\nPedido de prueba borrar');
  });

  it('separa los bloques del pedido con una sola línea en blanco', () => {
    const texto = textoDelMensaje(filaDeMensaje(FILA_PEDIDO_HTML));

    expect(texto).toBe(
      [
        'Pedido — Sagrado Sushi',
        '',
        'Delivery',
        'Pedido de prueba borrar',
        '',
        'Dirección: bulevard de todos los santos 5700, Lote 135',
        '',
        '1 × DUMPLINGS (4 U.) — $7.200',
        '1 × DUMPLING DE MARISCOS (4 U.) — $11.150',
        '1 × MOLLEJA — $8.400',
        '1 × EBICADO · 10 pz — $17.200',
        '1 × ALASKA ROLL · 5 pz — $10.300',
        '1 × PACÍFICO · 10 pz — $20.700',
        '',
        'Total: $74.950',
        '',
        'Aclaraciones: es una prueba no hacer',
      ].join('\n'),
    );
  });

  it('una fila sin .copyable-text adentro devuelve cadena vacía', () => {
    const fila = filaDeMensaje(FILA_SISTEMA_HTML);

    expect(textoDelMensaje(fila)).toBe('');
    expect(parsearMensaje(textoDelMensaje(fila))).toBeNull();
  });

  it('no toca el DOM original: los aria-hidden se borran sobre el clon', () => {
    const fila = filaDeMensaje(FILA_PEDIDO_HTML);
    textoDelMensaje(fila);

    const contenedor = fila.querySelector<HTMLElement>('.copyable-text');
    expect(contenedor?.querySelectorAll('[aria-hidden="true"]').length).toBe(1);
    expect(contenedor?.textContent).toContain('12:33 a. m.');
  });
});

describe('textoDelMensaje + parsearMensaje de punta a punta', () => {
  it('el pedido del DOM real se parsea entero', () => {
    const pedido = parsearMensaje(textoDelMensaje(filaDeMensaje(FILA_PEDIDO_HTML)));

    expect(pedido).not.toBeNull();
    expect(pedido?.modalidad).toBe('delivery');
    expect(pedido?.lineaContacto).toBe('Delivery');
    expect(pedido?.nombre).toBe('Pedido de prueba borrar');
    expect(pedido?.direccion).toBe('bulevard de todos los santos 5700, Lote 135');
    expect(pedido?.total).toBe('$74.950');
    expect(pedido?.aclaraciones).toBe('es una prueba no hacer');
    expect(pedido?.items).toHaveLength(6);
    expect(pedido?.items[0]).toEqual({
      texto: '1 × DUMPLINGS (4 U.) — $7.200',
      importe: 7_200,
    });
    // el · del nombre de la variante no interfiere con el corte del importe
    expect(pedido?.items[5]).toEqual({
      texto: '1 × PACÍFICO · 10 pz — $20.700',
      importe: 20_700,
    });
  });

  it('el texto que devolvía innerText en el navegador real se descartaba entero', () => {
    // La línea en blanco de más entre la modalidad y el nombre: partirBloques()
    // los toma como dos bloques, el parser no encuentra el nombre y devuelve
    // null. Con eso el botón de imprimir no aparecía en ningún pedido.
    expect(INNER_TEXT_DEL_NAVEGADOR).toContain('Delivery\n\nPedido de prueba borrar');
    expect(parsearMensaje(INNER_TEXT_DEL_NAVEGADOR)).toBeNull();
  });
});

describe('telefonoDelChat', () => {
  /** Una fila mínima con los dos atributos de los que se puede sacar el
   *  número, para no repetir el fixture gigante en cada caso. */
  function fila(dataId: string, prePlainText: string): HTMLElement {
    const documento = new DOMParser().parseFromString(
      `<div data-id="${dataId}"><div class="copyable-text" data-pre-plain-text="${prePlainText}">x</div></div>`,
      'text/html',
    );
    return documento.querySelector<HTMLElement>('[data-pre-plain-text]')!;
  }

  it('saca el número del JID de la fila cuando el build lo trae', () => {
    const nodo = fila('false_5491100000000@c.us_3EB0AA', '[12:33, 9/9/2026] Alguien: ');
    expect(telefonoDelChat(nodo)).toBe('+5491100000000');
  });

  it('en un grupo toma el JID de quien escribió, que va al final', () => {
    const nodo = fila('false_120363000000000000@g.us_3EB0AA_5491100000000@c.us', '[12:33, 9/9/2026] Alguien: ');
    expect(telefonoDelChat(nodo)).toBe('+5491100000000');
  });

  it('sin JID cae al encabezado, que trae el número si el contacto no está agendado', () => {
    const nodo = fila('3EB07DC7F8222875F0598F', '[12:33 a. m., 9/9/2026] +54 9 11 0000-0000: ');
    expect(telefonoDelChat(nodo)).toBe('+54 9 11 0000-0000');
  });

  it('un contacto agendado no deja número: devuelve null en vez del nombre', () => {
    const nodo = fila('3EB07DC7F8222875F0598F', '[12:33 a. m., 9/9/2026] Gabriel Uccello: ');
    expect(telefonoDelChat(nodo)).toBeNull();
  });

  /** El DOM real capturado del navegador: el `data-id` de la fila es solo el id
   *  del mensaje y el contacto está agendado, así que por ninguno de los dos
   *  caminos hay número. Es el caso que justifica que el campo de la carta
   *  exista: el respaldo del chat no siempre puede. */
  it('sobre la captura real no inventa un número', () => {
    expect(telefonoDelChat(filaDeMensaje(FILA_PEDIDO_HTML))).toBeNull();
  });
});
