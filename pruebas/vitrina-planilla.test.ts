import { describe, expect, it } from 'vitest';
import {
  agruparDisfraces,
  fotoDePagina,
  leerCsv,
  leerHoja,
  linkPorDisfraz,
  slugDisfraz,
} from '../src/logica/vitrina-planilla';
import { pestanaDeVitrina } from '../src/clientes/vitrinas';

// Encabezados reales de las hojas. La de hombre no tiene Código ni Nota, y
// trae los precios con signo y punto de miles.
const HOMBRE = [
  'Disfraz,Talle,Precio Merakys (unit.),Link,Costo del vendedor,Precio efectivo / transferencia,Precio con tarjeta,Gana el vendedor',
  'Gladiador,M,$35.900,https://proveedor.test/producto/gladiador-m/,$32.310,$46.700,$51.900,$14.390',
  'Gladiador,L,$35.900,https://proveedor.test/producto/gladiador-l/,$32.310,$46.700,$51.900,$14.390',
  ',,,,,,,',
].join('\n');

const NINO = [
  'Disfraz,Talle,Precio Merakys (unit.),Link,Costo del vendedor,Precio efectivo / transferencia,Precio con tarjeta,Gana el vendedor,Código,Nota',
  'Esqueleto Niño,XS (2-4 años),17480,https://proveedor.test/producto/esq-xs/,15732,22800,25400,7068,DI070XS',
  'Esqueleto Niño,S (5-6 años),17480,https://proveedor.test/producto/esq-s/,15732,24800,27500,7068,DI070S',
  'Inflable Dinosaurio,Infantil,73700,https://proveedor.test/producto/inflable/,66330,95900,106600,29570,AC100,"Por pedido (inflable). Unisex"',
].join('\r\n');

describe('leerCsv', () => {
  it('respeta comillas con comas y saltos de línea adentro', () => {
    expect(leerCsv('a,"b, c","d\ne"\n1,2,3')).toEqual([
      ['a', 'b, c', 'd\ne'],
      ['1', '2', '3'],
    ]);
  });
});

describe('leerHoja', () => {
  it('lee precios con signo y saltea renglones vacíos', () => {
    const filas = leerHoja(HOMBRE);
    expect(filas).toHaveLength(2);
    expect(filas[0]).toMatchObject({ disfraz: 'Gladiador', t: 'M', e: 46700, tj: 51900, c: '', nota: '' });
  });

  it('no deja pasar ninguna columna interna salvo el link', () => {
    const [fila] = leerHoja(NINO);
    expect(Object.keys(fila).sort()).toEqual(['c', 'disfraz', 'e', 'link', 'nota', 't', 'tj']);
    expect(JSON.stringify(fila)).not.toMatch(/17480|15732|7068/);
  });
});

describe('agruparDisfraces', () => {
  const grupo = agruparDisfraces(leerHoja(NINO));

  it('una tarjeta por disfraz con sus talles y códigos', () => {
    expect(grupo.map((d) => d.n)).toEqual(['Esqueleto Niño', 'Inflable Dinosaurio']);
    expect(grupo[0].tal).toEqual([
      { t: 'XS (2-4 años)', e: 22800, tj: 25400, c: 'DI070XS' },
      { t: 'S (5-6 años)', e: 24800, tj: 27500, c: 'DI070S' },
    ]);
  });

  it('marca por encargo lo que dice "Por pedido" en Nota', () => {
    expect(grupo.map((d) => d.encargo)).toEqual([false, true]);
  });

  it('lo que va al navegador no trae el link', () => {
    expect(JSON.stringify(grupo)).not.toContain('proveedor.test');
  });
});

describe('linkPorDisfraz', () => {
  it('usa el link del primer talle', () => {
    expect(linkPorDisfraz(leerHoja(HOMBRE)).get('gladiador')).toBe('https://proveedor.test/producto/gladiador-m/');
  });
});

describe('slugDisfraz', () => {
  it('saca acentos y espacios', () => {
    expect(slugDisfraz('Fórmula 1 Infantil')).toBe('formula-1-infantil');
    expect(slugDisfraz('León Bebé')).toBe('leon-bebe');
  });
});

describe('fotoDePagina', () => {
  const pagina = 'https://proveedor.test/producto/x/';
  it('toma og:image del mismo sitio', () => {
    const html = '<meta property="og:image" content="https://proveedor.test/fotos/x.jpg" />';
    expect(fotoDePagina(html, pagina)).toBe('https://proveedor.test/fotos/x.jpg');
  });
  it('rechaza una foto de otro sitio', () => {
    const html = '<meta property="og:image" content="https://otro.test/x.jpg" />';
    expect(fotoDePagina(html, pagina)).toBeNull();
  });
});

describe('pestanaDeVitrina', () => {
  it('acepta la URL con o sin eñe', () => {
    expect(pestanaDeVitrina('party-market', 'niña')?.id).toBe('nina');
    expect(pestanaDeVitrina('party-market', 'nina')?.id).toBe('nina');
  });
  it('no confunde vitrinas de HTML ni otros clientes', () => {
    expect(pestanaDeVitrina('party-market', 'mujer')).toBeNull();
    expect(pestanaDeVitrina('toString', 'hombre')).toBeNull();
  });
});
