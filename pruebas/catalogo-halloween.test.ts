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

    // La única excepción a "sin talles, precio cargado" es la cortina, que se
    // cotiza por medida.
    const sinPrecio = items.filter((i) => !i.variantes.length && i.precio === 0);
    expect(sinPrecio.map((i) => i.nombre)).toEqual(['Cortina Halloween']);
    expect(sinPrecio[0].descripcion).toContain('900');
  });

  it('numera los 81 productos corridos desde 1, agrupados por categoría', () => {
    const numerados = renumerar(items, categorias);
    expect(numerados).toHaveLength(81);
    expect(numerados.map((i) => i.numero)).toEqual(numerados.map((_, i) => i + 1));

    const porCategoria = categorias.map((c) => items.filter((i) => i.categoriaId === c.id).length);
    expect(porCategoria).toEqual([11, 12, 12, 12, 12, 22]);
  });
});

describe('pedido de Halloween por WhatsApp', () => {
  const buscar = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error(`falta el ítem ${id}`);
    return item;
  };

  it('el talle elegido viaja en el mensaje', () => {
    const esqueleto = buscar('esqueleto-nino');
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
    expect(mensaje).toContain('Total: $20.500');
    // Sin salón no hay mesa que nombrar.
    expect(mensaje).not.toContain('Mesa');
  });

  it('la cortina sin precio deja el total a confirmar, con el parcial de lo demás', () => {
    const cortina = lineaDeItem(buscar('cortina-halloween'));
    const telarana = lineaDeItem(buscar('telarana'));
    const pedido = agregar(agregar({ lineas: [] }, cortina!), telarana!);

    const mensaje = armarMensaje(pedido, { nombre: 'Ana', modalidad: 'retiro' }, NOMBRE_HALLOWEEN);
    expect(mensaje).toContain('Total: a confirmar (parcial $800)');
  });

  it('el enlace apunta al WhatsApp del cliente', () => {
    const enlace = enlaceWhatsApp(CONFIG_PEDIDO_HALLOWEEN.whatsapp, 'hola');
    expect(enlace).toBe('https://wa.me/5491132556379?text=hola');
  });

  it('los disfraces con un solo talle igual lo ofrecen como variante', () => {
    const medusa = buscar('medusa');
    expect(variantesDe(medusa)).toEqual([{ etiqueta: 'Talle L', precio: 28000 }]);
  });
});
