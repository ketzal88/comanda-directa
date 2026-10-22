import { describe, expect, it } from 'vitest';
import {
  CATALOGO_HALLOWEEN,
  CONFIG_PEDIDO_HALLOWEEN,
  NOMBRE_HALLOWEEN,
} from '../scripts/catalogo-halloween';
import { renumerar } from '../src/logica/numeracion';
import { agregar, lineaDeItem } from '../src/logica/pedido';
import { armarMensaje, enlaceWhatsApp } from '../src/logica/whatsapp';
import { precioConDescuentoPago } from '../src/logica/cuenta';
import { fotoGrande } from '../src/componentes/carta/halloween/fotos';
import PARTY from '../scripts/data/party-market.json';

/** El catálogo de Party Market se arma desde `scripts/data/party-market.json`
 *  (la hoja "Catálogo" filtrada por stock) y se carga con
 *  `scripts/seed-halloween.ts`. Estas pruebas corren sobre los mismos datos
 *  que inserta el script. */

const { categorias, items } = CATALOGO_HALLOWEEN;

describe('catálogo de Party Market', () => {
  it('tiene solo los productos con stock de la planilla', () => {
    expect(items).toHaveLength(PARTY.productos.length);
    expect(items.length).toBeGreaterThan(0);
  });

  it('cada ítem cuelga de una categoría que existe', () => {
    const ids = new Set(categorias.map((c) => c.id));
    const huerfanos = items.filter((i) => !ids.has(i.categoriaId)).map((i) => i.nombre);
    expect(huerfanos).toEqual([]);
  });

  it('no hay ids ni nombres repetidos', () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);

    const nombres = items.map((i) => i.nombre.toLowerCase());
    const repetidos = nombres.filter((n, i) => nombres.indexOf(n) !== i);
    expect(repetidos).toEqual([]);
  });

  it('el id de cada producto entra en una URL (es su slug)', () => {
    for (const item of items) {
      expect(item.id, `${item.nombre}: el id va en la URL de la foto`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('todos los precios son enteros positivos, sin variantes sueltas', () => {
    for (const item of items) {
      expect(Number.isInteger(item.precio), `${item.nombre}: precio`).toBe(true);
      expect(item.precio, item.nombre).toBeGreaterThan(0);
      // El modelo nuevo no mergea talles: cada fila de la planilla es un
      // producto con un precio, sin variantes.
      expect(item.variantes, item.nombre).toEqual([]);
    }
  });

  it('nada del proveedor queda en lo que se publica', () => {
    const texto = JSON.stringify(CATALOGO_HALLOWEEN).toLowerCase();
    expect(texto).not.toContain('merakys');
  });

  it('numera los productos corridos desde 1, agrupados por categoría', () => {
    const numerados = renumerar(items, categorias);
    expect(numerados).toHaveLength(items.length);
    expect(numerados.map((i) => i.numero)).toEqual(numerados.map((_, i) => i + 1));
  });

  it('las categorías publicadas son las que tienen productos', () => {
    const conProductos = new Set(items.map((i) => i.categoriaId));
    expect(categorias.every((c) => conProductos.has(c.id))).toBe(true);
    expect(categorias.map((c) => c.id)).toEqual([
      'infantiles',
      'adulto',
      'accesorios',
      'trick-or-treat',
      'decoracion',
    ]);
  });
});

describe('precios de Party Market', () => {
  const efectivo = CONFIG_PEDIDO_HALLOWEEN.descuentosPago.efectivo!;

  it('el precio en efectivo del motor es el de la planilla, producto por producto', () => {
    for (const p of PARTY.productos) {
      expect(precioConDescuentoPago(p.tarjeta, efectivo), `${p.nombre} ($${p.tarjeta})`).toBe(
        p.efectivo,
      );
    }
  });

  it('el precio de lista guardado es el de tarjeta', () => {
    const porNombre = new Map(items.map((i) => [i.nombre, i.precio]));
    for (const p of PARTY.productos) {
      expect(porNombre.get(p.nombre), p.nombre).toBe(p.tarjeta);
    }
  });
});

describe('pedido de Party Market por WhatsApp', () => {
  const buscar = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error(`falta el ítem ${id}`);
    return item;
  };

  it('el producto y el total con tarjeta viajan en el mensaje', () => {
    const diablita = buscar('set-diablita'); // tarjeta $14.300
    const pedido = agregar({ lineas: [] }, lineaDeItem(diablita)!);
    const mensaje = armarMensaje(pedido, { nombre: 'Ana', modalidad: 'retiro' }, NOMBRE_HALLOWEEN);
    expect(mensaje).toContain('Set Diablita');
    expect(mensaje).toContain('Total: $14.300');
  });

  it('pagando en efectivo el total es el de la planilla', () => {
    const diablita = buscar('set-diablita'); // efectivo $12.800
    const pedido = agregar({ lineas: [] }, lineaDeItem(diablita)!);
    const mensaje = armarMensaje(
      pedido,
      {
        nombre: 'Ana',
        modalidad: 'delivery',
        direccion: 'x',
        medioDePago: 'efectivo',
        zona: CONFIG_PEDIDO_HALLOWEEN.zonasEnvio[0],
      },
      NOMBRE_HALLOWEEN,
      { descuentosPago: CONFIG_PEDIDO_HALLOWEEN.descuentosPago },
    );
    expect(mensaje).toContain('*Total: $12.800*');
  });

  it('el enlace apunta al WhatsApp del cliente', () => {
    const enlace = enlaceWhatsApp(CONFIG_PEDIDO_HALLOWEEN.whatsapp, 'hola');
    expect(enlace).toBe('https://wa.me/5491139535981?text=hola');
  });
});

describe('fotos de la plantilla', () => {
  const base = 'https://x.supabase.co/storage/v1/object/public/fotos/party-market';

  it('la grande se deduce de la mini', () => {
    expect(fotoGrande(`${base}/set-diablita.webp`)).toBe(`${base}/set-diablita@900.webp`);
  });

  it('una foto que no sigue el convenio se devuelve tal cual', () => {
    expect(fotoGrande('https://otro.sitio/foto.jpg')).toBe('https://otro.sitio/foto.jpg');
    expect(fotoGrande(undefined)).toBeUndefined();
  });
});
