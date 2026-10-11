import { describe, expect, it } from 'vitest';
import { filasFeed } from '../src/logica/feed-meta';
import { CUBIERTO } from '../src/logica/pedido';
import { datosDeLineas, esEventoMeta, eventoCapi, idCatalogo, pixelDe } from '../src/logica/pixel-meta';
import type { LineaPedido } from '../src/logica/pedido';
import type { Carta, Cliente } from '../src/logica/tipos';

function linea(parcial: Partial<LineaPedido>): LineaPedido {
  return { clave: 'k', itemId: 'x', nombre: 'X', variante: '', precioUnitario: 1000, cantidad: 1, ...parcial };
}

describe('datosDeLineas', () => {
  it('ids del catálogo, cantidades y valor; el cubierto no viaja', () => {
    const datos = datosDeLineas([
      linea({ itemId: 'preso', variante: 'Talle L', precioUnitario: 2000, cantidad: 2 }),
      linea({ itemId: 'vela', precioUnitario: 500 }),
      linea({ itemId: CUBIERTO, precioUnitario: 900, cantidad: 3 }),
    ]);
    expect(datos.content_ids).toEqual(['preso--Talle L', 'vela']);
    expect(datos.num_items).toBe(3);
    expect(datos.value).toBe(4500);
    expect(datos.currency).toBe('ARS');
  });

  it('el valor se puede pasar a mano (con descuentos, sin envío)', () => {
    expect(datosDeLineas([linea({})], 900).value).toBe(900);
  });
});

describe('pixelDe', () => {
  it('sin ID cargado, no hay pixel', () => {
    expect(pixelDe('no-existe')).toBeNull();
    expect(pixelDe('party-market')).toMatch(/^\d+$/);
  });
});

describe('CAPI', () => {
  it('sólo los eventos del embudo', () => {
    expect(esEventoMeta('Purchase')).toBe(true);
    expect(esEventoMeta('Lead')).toBe(false);
    expect(esEventoMeta(42)).toBe(false);
  });

  it('el mismo event_id que el pixel y sin campos vacíos', () => {
    const e = eventoCapi({ evento: 'AddToCart', eventId: 'abc', url: 'https://x/party-market', fbp: 'fb.1.1.1', ahora: 100 });
    expect(e).toEqual({
      event_name: 'AddToCart',
      event_time: 100,
      event_id: 'abc',
      event_source_url: 'https://x/party-market',
      action_source: 'website',
      user_data: { fbp: 'fb.1.1.1' },
    });
  });
});

it('los ids de los eventos son los mismos que los del feed', () => {
  const carta: Carta = {
    categorias: [{ id: 'c', nombre: 'D', nombreEn: '', orden: 0, subcategorias: [] }],
    items: [
      {
        id: 'preso', numero: 1, nombre: 'Preso', categoriaId: 'c', orden: 0, precio: 0, agotado: false, activo: true,
        etiquetas: [], fotoUrl: '/f.webp', variantes: [{ etiqueta: 'Talle L', precio: 2000 }],
      },
    ],
    config: { notas: [], cubiertoPorPersona: 0 },
  };
  const feed = filasFeed({ slug: 's', nombre: 'S' } as Cliente, carta).map((f) => f.id);
  expect(feed).toEqual([idCatalogo('preso', 'Talle L')]);
});
