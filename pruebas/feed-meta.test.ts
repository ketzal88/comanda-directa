import { describe, expect, it } from 'vitest';
import { filasFeed, xmlFeed } from '../src/logica/feed-meta';
import type { Carta, Cliente, Item } from '../src/logica/tipos';

const cliente = { slug: 'party-market', nombre: 'Party Market' } as Cliente;

function item(parcial: Partial<Item>): Item {
  return {
    id: 'x',
    numero: 1,
    nombre: 'Producto',
    categoriaId: 'c1',
    orden: 0,
    precio: 1000,
    variantes: [],
    agotado: false,
    activo: true,
    etiquetas: [],
    fotoUrl: '/fotos/x.webp',
    ...parcial,
  };
}

function carta(items: Item[]): Carta {
  return {
    categorias: [{ id: 'c1', nombre: 'Disfraces', nombreEn: '', orden: 0, subcategorias: [] }],
    items,
    config: { notas: [], cubiertoPorPersona: 0 },
  };
}

describe('filasFeed', () => {
  it('una fila por talle, agrupadas por el producto', () => {
    const filas = filasFeed(
      cliente,
      carta([item({ id: 'preso', nombre: 'Disfraz Preso', variantes: [{ etiqueta: 'L', precio: 2000 }, { etiqueta: 'XL', precio: 2500 }] })]),
    );
    expect(filas.map((f) => [f.id, f.grupo, f.talle, f.precio])).toEqual([
      ['preso--L', 'preso', 'L', 2000],
      ['preso--XL', 'preso', 'XL', 2500],
    ]);
  });

  it('variantes que no son talles: productos sueltos, sin grupo', () => {
    const filas = filasFeed(
      cliente,
      carta([item({ id: 'd', nombre: 'Disfraz', variantes: [{ etiqueta: 'Brujita', precio: 2000 }, { etiqueta: 'Esqueleto S 5-6', precio: 2000 }] })]),
    );
    expect(filas.map((f) => [f.id, f.grupo, f.talle, f.titulo])).toEqual([
      ['d--Brujita', undefined, undefined, 'Disfraz - Brujita'],
      ['d--Esqueleto S 5-6', undefined, undefined, 'Disfraz - Esqueleto S 5-6'],
    ]);
  });

  it('deja afuera lo que Meta rechazaría y lo dado de baja', () => {
    const filas = filasFeed(
      cliente,
      carta([item({ id: 'a', fotoUrl: undefined }), item({ id: 'b', precio: 0 }), item({ id: 'c', activo: false }), item({ id: 'd' })]),
    );
    expect(filas.map((f) => f.id)).toEqual(['d']);
  });

  it('el agotado sigue, como sin stock', () => {
    expect(filasFeed(cliente, carta([item({ agotado: true })]))[0].disponible).toBe(false);
  });

  it('la foto propia sale con el dominio', () => {
    expect(filasFeed(cliente, carta([item({})]))[0].imagen).toBe('https://www.hace-tu-pedido.site/fotos/x.webp');
  });
});

describe('xmlFeed', () => {
  it('escapa el texto y escribe el precio en ARS', () => {
    const xml = xmlFeed(cliente, carta([item({ nombre: 'Vincha & orejas <negro>' })]));
    expect(xml).toContain('<g:title>Vincha &amp; orejas &lt;negro&gt;</g:title>');
    expect(xml).toContain('<g:price>1000.00 ARS</g:price>');
  });
});
