import { describe, expect, it } from 'vitest';
import {
  armarCatalogoDirecto,
  cuotaSinInteres,
  leerHojaCatalogo,
  normalizarNombre,
  type EntradaManifiesto,
} from '../src/logica/catalogo-directo';
import { CATALOGOS_DIRECTOS } from '../src/clientes/pedidos-directos';

// La hoja "Catálogo" real: filas de preámbulo arriba, el encabezado en una
// fila de más abajo, columnas del proveedor (MERAKYS, Ficha con el link) que
// NO tienen que salir, y precios con signo y punto de miles.
const HOJA = [
  'Catálogo Halloween minorista',
  'Descuento del mayorista al vendedor,10%',
  '',
  'Grupo,Producto,Código,MERAKYS,Precio efectivo / transferencia,Precio con tarjeta,Costo del vendedor,Gana el vendedor,Ficha,Cant. compra,Vendido,Disponible',
  'Animatronics e Inflables,Inflable Castillo Halloween,,$227.550,$295.900,$328.800,$204.795,$91.105,https://mayoristas.merakys.com.ar/producto/castillo/,0,0,1',
  'Animatronics e Inflables,Magia Negra,,$137.550,$178.900,$198.800,$123.795,$55.105,Ver ficha,0,0,1',
  'Animatronics e Inflables,Huevo Atrapado,,$19.900,$25.900,$28.800,$17.910,$7.990,Ver ficha,0,0,0',
  'Animatronics e Inflables,Calabaza Vestida Brillante ,,$87.900,$114.300,$127.000,$79.110,$35.190,https://mayoristas.merakys.com.ar/producto/calabaza/,0,0,1',
  'Accesorios,Daga Retráctil,GOAC45,$1.010,$1.400,$1.600,$909,$491,Ver ficha,SIN STOCK,0,#VALUE!',
].join('\n');

const MANIFIESTO: EntradaManifiesto[] = [
  { hoja: 'Inflable Castillo Halloween', slug: 'castillo', nombre: 'Inflable Castillo Halloween', categoria: 'Inflables', descripcion: 'Castillo embrujado.' },
  { hoja: 'Huevo Atrapado', slug: 'huevo', nombre: 'Huevo Atrapado', categoria: 'Animatronics', descripcion: 'Terror.' },
  { hoja: 'Calabaza Vestida Brillante', slug: 'calabaza', nombre: 'Calabaza Vestida Brillante', categoria: 'Animatronics', descripcion: 'Brillante.' },
  { hoja: 'No está en la hoja', slug: 'fantasma', nombre: 'Fantasma', categoria: 'Inflables', descripcion: 'x' },
];

describe('cuotaSinInteres', () => {
  it('divide por 3 al peso de arriba', () => {
    expect(cuotaSinInteres(328800)).toBe(109600); // exacto
    expect(cuotaSinInteres(224200)).toBe(74734); // 74733,33 → arriba
    expect(cuotaSinInteres(28800)).toBe(9600);
  });
  it('con n <= 0 no hay cuotas', () => {
    expect(cuotaSinInteres(1000, 0)).toBe(0);
  });
});

describe('normalizarNombre', () => {
  it('ignora tildes, mayúsculas y espacios de más', () => {
    expect(normalizarNombre('Calabaza Vestida Brillante ')).toBe('calabaza vestida brillante');
    expect(normalizarNombre('LÁPIDA  con   Luz')).toBe('lapida con luz');
  });
});

describe('leerHojaCatalogo', () => {
  it('encuentra el encabezado bajo el preámbulo y lee E, F y Disponible', () => {
    const mapa = leerHojaCatalogo(HOJA);
    expect(mapa.get('inflable castillo halloween')).toEqual({
      efectivo: 295900,
      tarjeta: 328800,
      disponible: 1,
    });
    expect(mapa.get('magia negra')).toEqual({ efectivo: 178900, tarjeta: 198800, disponible: 1 });
  });
  it('un Disponible vacío, 0 o con error de fórmula cuenta como sin stock', () => {
    const mapa = leerHojaCatalogo(HOJA);
    expect(mapa.get('huevo atrapado')?.disponible).toBe(0);
    expect(mapa.get('daga retractil')?.disponible).toBe(0);
  });
  it('casa aunque la hoja traiga un espacio de más en el nombre', () => {
    const mapa = leerHojaCatalogo(HOJA);
    expect(mapa.get('calabaza vestida brillante')?.efectivo).toBe(114300);
  });
});

describe('armarCatalogoDirecto', () => {
  it('sólo productos con stock, en el orden del manifiesto, con la cuota calculada', () => {
    const productos = armarCatalogoDirecto(MANIFIESTO, leerHojaCatalogo(HOJA));
    expect(productos.map((p) => p.slug)).toEqual(['castillo', 'calabaza']);
    expect(productos[0]).toMatchObject({
      nombre: 'Inflable Castillo Halloween',
      efectivo: 295900,
      tarjeta: 328800,
      cuota: 109600,
    });
  });
  it('un producto sin fila en la hoja no sale', () => {
    const productos = armarCatalogoDirecto(MANIFIESTO, leerHojaCatalogo(HOJA));
    expect(productos.some((p) => p.slug === 'fantasma')).toBe(false);
  });
  it('no filtra ningún precio del proveedor: el producto sólo lleva lo mostrable', () => {
    const productos = armarCatalogoDirecto(MANIFIESTO, leerHojaCatalogo(HOJA));
    expect(Object.keys(productos[0]).sort()).toEqual(
      ['categoria', 'cuota', 'descripcion', 'efectivo', 'nombre', 'slug', 'tarjeta'].sort(),
    );
  });
});

describe('manifiesto de party-market', () => {
  const cat = CATALOGOS_DIRECTOS['party-market'];
  it('tiene los 11 productos (sin la lápida sin ficha), con slug único', () => {
    expect(cat.manifiesto).toHaveLength(11);
    expect(new Set(cat.manifiesto.map((m) => m.slug)).size).toBe(11);
    expect(cat.manifiesto.some((m) => m.slug === 'lapida-con-luz-y-sonido')).toBe(false);
  });
  it('cada categoría del manifiesto está declarada en el orden de categorías', () => {
    for (const m of cat.manifiesto) expect(cat.categorias).toContain(m.categoria);
  });
});
