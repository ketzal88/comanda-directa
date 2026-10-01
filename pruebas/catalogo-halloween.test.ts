import { describe, expect, it } from 'vitest';
import {
  CATALOGO_HALLOWEEN,
  CONFIG_PEDIDO_HALLOWEEN,
  NOMBRE_HALLOWEEN,
} from '../scripts/catalogo-halloween';
import { renumerar } from '../src/logica/numeracion';
import { agregar, lineaDeItem } from '../src/logica/pedido';
import { MAX_ETIQUETA_VARIANTE, MAX_VARIANTES } from '../src/logica/validar-item';
import { armarMensaje, enlaceWhatsApp } from '../src/logica/whatsapp';
import { variantesDe } from '../src/logica/variantes';
import { fotoGrande } from '../src/componentes/carta/halloween/fotos';

/** El catálogo se carga una sola vez con `scripts/seed-halloween.ts`: si algo
 *  está mal escrito, se descubre con el cliente adentro del panel. Estas
 *  pruebas corren sobre los mismos datos que inserta el script. */

const { categorias, items } = CATALOGO_HALLOWEEN;

describe('catálogo de Halloween', () => {
  it('cada ítem cuelga de una categoría que existe', () => {
    const ids = new Set(categorias.map((c) => c.id));
    const huerfanos = items.filter((i) => !ids.has(i.categoriaId)).map((i) => i.nombre);
    expect(huerfanos).toEqual([]);
  });

  it('no hay ids ni nombres repetidos', () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);

    // Un producto cargado dos veces son dos líneas distintas en el pedido:
    // el comprador suma las dos y cree que pidió dos cosas.
    const nombres = items.map((i) => i.nombre.toLowerCase());
    const repetidos = nombres.filter((n, i) => nombres.indexOf(n) !== i);
    expect(repetidos).toEqual([]);
  });

  it('todos los precios son enteros en pesos', () => {
    for (const item of items) {
      expect(Number.isInteger(item.precio), `${item.nombre}: precio`).toBe(true);
      expect(item.precio).toBeGreaterThanOrEqual(0);
      for (const v of item.variantes) {
        expect(Number.isInteger(v.precio), `${item.nombre} · ${v.etiqueta}`).toBe(true);
        expect(v.precio).toBeGreaterThan(0);
      }
    }
  });

  it('las etiquetas de talle entran en lo que el panel acepta', () => {
    for (const item of items) {
      expect(item.variantes.length).toBeLessThanOrEqual(MAX_VARIANTES);
      for (const v of item.variantes) {
        expect(v.etiqueta.length, `${item.nombre} · ${v.etiqueta}`).toBeLessThanOrEqual(
          MAX_ETIQUETA_VARIANTE,
        );
      }
    }
  });

  it('un ítem con talles no deja precio suelto, y uno sin talles sí tiene precio', () => {
    // Con variantes cargadas, `item.precio` no se usa (ver `logica/variantes.ts`):
    // dejarlo en otro valor es un precio fantasma esperando a que alguien lo lea.
    const conTalles = items.filter((i) => i.variantes.length > 0);
    expect(conTalles.every((i) => i.precio === 0)).toBe(true);

    const sinPrecio = items.filter((i) => !i.variantes.length && i.precio === 0);
    expect(sinPrecio.map((i) => i.nombre)).toEqual([]);
  });

  it('numera los 237 productos corridos desde 1, agrupados por categoría', () => {
    const numerados = renumerar(items, categorias);
    expect(numerados).toHaveLength(237);
    expect(numerados.map((i) => i.numero)).toEqual(numerados.map((_, i) => i + 1));

    const porCategoria = categorias.map((c) => items.filter((i) => i.categoriaId === c.id).length);
    // combos, infantiles, adulto, animatrónicos, inflables, accesorios, trick, decoración
    expect(porCategoria).toEqual([3, 13, 10, 133, 25, 20, 17, 16]);
  });
});

describe('pedido de Halloween por WhatsApp', () => {
  const buscar = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error(`falta el ítem ${id}`);
    return item;
  };

  it('el talle elegido viaja en el mensaje', () => {
    const esqueleto = buscar('disfraz-esqueleto-nino');
    const linea = lineaDeItem(esqueleto, 'S (5 a 6)');
    expect(linea).not.toBeNull();

    const pedido = agregar({ lineas: [] }, linea!);
    const mensaje = armarMensaje(
      pedido,
      { nombre: 'Ana', modalidad: 'retiro' },
      NOMBRE_HALLOWEEN,
      { cubiertoPorPersona: CATALOGO_HALLOWEEN.config.cubiertoPorPersona },
    );

    expect(mensaje).toContain('Disfraz Esqueleto Niño · S (5 a 6)');
    expect(mensaje).toContain('Total: $25.400');
    // Sin salón no hay mesa que nombrar.
    expect(mensaje).not.toContain('Mesa');
  });

  it('los talles de la planilla se juntan en un producto, no en dos filas', () => {
    const preso = buscar('disfraz-preso');
    expect(variantesDe(preso).map((v) => v.etiqueta)).toEqual(['Talle M', 'Talle L']);
  });

  it('los combos son sólo los de la hoja, a precio con tarjeta', () => {
    const combos = items.filter((i) => i.categoriaId === 'combos');
    for (const c of combos) expect(c.descripcion, c.nombre).toMatch(/^Incluye: /);
    // El de la planilla "con tarjeta": con el de efectivo el 10% se
    // descontaba dos veces al pagar en efectivo.
    expect(combos.map((c) => [c.nombre, c.precio])).toEqual([
      ['Combo Cumple de Halloween (12 chicos)', 133600],
      ['Combo Casa Embrujada', 47600],
      ['Combo Rincón de fotos', 73400],
    ]);
  });

  it('los animatrónicos se parten en colgantes y de piso, sin que quede ninguno afuera', () => {
    const anim = items.filter((i) => i.categoriaId === 'animatronicos');
    const subs = categorias.find((c) => c.id === 'animatronicos')!.subcategorias.map((s) => s.nombre);
    expect(anim.every((i) => subs.includes(i.subcategoria ?? ''))).toBe(true);
    expect(buscar('colgante-pesadilla-negro-para-colgar').subcategoria).toBe('Colgantes');
    expect(buscar('escoba-caminante-luz-sonido-y-movimiento').subcategoria).toBe('De piso y mesa');
  });

  it('los nombres que corrigió el cliente', () => {
    const nombres = items.map((i) => i.nombre);
    expect(nombres).toEqual(
      expect.arrayContaining(['Set Brujito Hechicero Negro', 'Inflable Momia', 'Colgante Pesadilla Negro']),
    );
    expect(nombres).not.toEqual(expect.arrayContaining(['Inflable Momia Ok']));
  });

  it('el enlace apunta al WhatsApp del cliente', () => {
    const enlace = enlaceWhatsApp(CONFIG_PEDIDO_HALLOWEEN.whatsapp, 'hola');
    expect(enlace).toBe('https://wa.me/5491132556379?text=hola');
  });

  it('los disfraces con un solo talle igual lo ofrecen como variante', () => {
    const monja = buscar('disfraz-monja');
    expect(variantesDe(monja)).toEqual([{ etiqueta: 'Talle M', precio: 32900 }]);
  });
});

describe('fotos de la plantilla', () => {
  const base = 'https://x.supabase.co/storage/v1/object/public/fotos/halloween';

  it('la grande se deduce de la mini', () => {
    expect(fotoGrande(`${base}/medusa.webp`)).toBe(`${base}/medusa@900.webp`);
  });

  it('una foto que no sigue el convenio se devuelve tal cual', () => {
    // el panel deja pegar cualquier URL https: agrandarla mal es feo,
    // pedir un archivo que no existe es una foto rota
    expect(fotoGrande('https://otro.sitio/foto.jpg')).toBe('https://otro.sitio/foto.jpg');
    expect(fotoGrande(undefined)).toBeUndefined();
  });

  it('todos los productos tienen una foto esperada en el bucket', () => {
    // el nombre del archivo sale del id del catálogo (scripts/fotos-halloween.ts):
    // un id con un carácter raro sería una URL que no se puede pedir
    for (const item of items) {
      expect(item.id, `${item.nombre}: el id va en la URL de la foto`).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
