/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { armarMensaje } from '../../src/logica/whatsapp';
import type { Pedido } from '../../src/logica/pedido';
import type { DatosComensal } from '../../src/logica/whatsapp';

/** El orden entre imprimir y guardar, que es lo único que este archivo cuida.
 *
 *  `imprimirComanda` abre la ventana con la activación del usuario que dejó el
 *  click en "Imprimir". Si alguna vez el guardado se espera ANTES (un `await`,
 *  una promesa encadenada), esa activación se pierde y el navegador bloquea la
 *  ventana SIEMPRE: la extensión deja de imprimir y el local no puede despachar.
 *  El test mira la secuencia real de llamadas, no el código. */

const pedidoDeMuestra: Pedido = {
  lineas: [
    {
      clave: 'roll::unica',
      itemId: 'roll',
      nombre: 'Roll California',
      variante: '',
      precioUnitario: 12_400,
      cantidad: 2,
    },
  ],
};
const datos: DatosComensal = { nombre: 'Milena', modalidad: 'retiro' };

const orden: string[] = [];
const enviados: unknown[] = [];

beforeAll(async () => {
  // El mensaje tal como lo ve el content script en la página (WhatsApp ya
  // convirtió el markdown de wa.me en negrita, sin asteriscos).
  const texto = armarMensaje(pedidoDeMuestra, datos).replace(/\*(.+?)\*/g, '$1');
  const mensaje = document.createElement('div');
  mensaje.setAttribute('data-pre-plain-text', '[12:00, 26/8/2026] Milena: ');
  mensaje.className = 'copyable-text';
  // `textContent` y no `innerText`: es de donde lo lee `textoDelMensaje()`
  mensaje.textContent = texto;
  document.body.appendChild(mensaje);

  const ventana = {
    document: document.implementation.createHTMLDocument(),
    focus: () => {},
    print: () => {},
  };
  window.open = vi.fn(() => {
    orden.push('imprimir');
    return ventana as unknown as Window;
  });

  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      id: 'extension-de-prueba',
      sendMessage: (solicitud: unknown) => {
        orden.push('guardar');
        enviados.push(solicitud);
        return Promise.resolve({
          ok: true,
          codigo: 'A7F3K2',
          creado: false,
          codigoDelMensaje: 'A7F3K2',
        });
      },
    },
  };

  // se importa DESPUÉS de tener el DOM y los dobles: el módulo escanea al cargar
  await import('../src/content-script');
});

describe('el botón de la burbuja', () => {
  it('imprime PRIMERO y recién después pide el guardado', () => {
    const boton = document.querySelector<HTMLButtonElement>('.comanda-cocina-boton');
    expect(boton).not.toBeNull();
    boton?.click();

    const imprimir = document.querySelector<HTMLButtonElement>('[data-cobro="imprimir"]');
    expect(imprimir).not.toBeNull();
    imprimir?.click();

    expect(orden).toEqual(['imprimir', 'guardar']);
  });

  it('le manda al worker el pedido y el cobro, no el texto del mensaje', () => {
    const solicitud = enviados[0] as {
      tipo: string;
      pedido: { nombre: string };
      cobro: { cuenta: { total: number } };
    };
    expect(solicitud.tipo).toBe('guardar-pedido');
    expect(solicitud.pedido.nombre).toBe('Milena');
    expect(solicitud.cobro.cuenta.total).toBe(24_800);
  });
});
