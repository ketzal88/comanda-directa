import { describe, expect, it } from 'vitest';
import { armarMensaje } from '../../src/logica/whatsapp';
import type { DatosComensal } from '../../src/logica/whatsapp';
import type { Pedido } from '../../src/logica/pedido';
import { formatearPrecio } from '../../src/logica/precio';
import { parsearMensaje } from '../src/parser';

/** `armarMensaje()` devuelve el markdown CRUDO (así sale por wa.me): el
 *  encabezado y el total llevan asteriscos de negrita alrededor
 *  (`*Pedido — Sagrado Sushi*`, `*Total: $33.700*`). `parsearMensaje` espera
 *  el texto YA renderizado por WhatsApp Web, que es lo que
 *  `content-script.ts` lee de la página real — ahí WhatsApp convirtió el
 *  markdown en negrita visual y los asteriscos no quedan en el texto. Esta
 *  función simula exactamente esa conversión para que el test compare lo
 *  mismo que va a comparar el content script en producción. */
function comoLoVeWhatsAppWeb(mensaje: string): string {
  return mensaje.replace(/\*(.+?)\*/g, '$1');
}

const pedidoDeMuestra: Pedido = {
  lineas: [
    {
      clave: 'roll::unica',
      itemId: 'roll',
      nombre: 'Roll California',
      variante: '',
      precioUnitario: 12400,
      cantidad: 2,
    },
    {
      clave: 'sashimi::unica',
      itemId: 'sashimi',
      nombre: 'Sashimi de salmón',
      variante: '',
      precioUnitario: 8900,
      cantidad: 1,
    },
  ],
};
const TOTAL_DE_MUESTRA = 12400 * 2 + 8900 * 1;

describe('parsearMensaje entiende lo que arma armarMensaje() de verdad', () => {
  it('salón — el caso real siempre trae mesa, porque validarDatos() la exige', () => {
    const datos: DatosComensal = { nombre: 'Ana', modalidad: 'salon', mesa: '5' };
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(armarMensaje(pedidoDeMuestra, datos)));

    expect(resultado?.modalidad).toBe('salon');
    expect(resultado?.mesa).toBe('5');
    expect(resultado?.nombre).toBe('Ana');
    expect(resultado?.direccion).toBeNull();
    expect(resultado?.total).toBe(formatearPrecio(TOTAL_DE_MUESTRA));
    expect(resultado?.items).toHaveLength(2);
  });

  it('retiro', () => {
    const datos: DatosComensal = { nombre: 'Milena', modalidad: 'retiro' };
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(armarMensaje(pedidoDeMuestra, datos)));

    expect(resultado?.modalidad).toBe('retiro');
    expect(resultado?.mesa).toBeNull();
    expect(resultado?.direccion).toBeNull();
  });

  it('delivery, con dirección y aclaraciones', () => {
    const datos: DatosComensal = {
      nombre: 'Pedro',
      modalidad: 'delivery',
      direccion: 'Av. Siempre Viva 742',
      notas: 'Sin wasabi',
    };
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(armarMensaje(pedidoDeMuestra, datos)));

    expect(resultado?.modalidad).toBe('delivery');
    expect(resultado?.direccion).toBe('Av. Siempre Viva 742');
    expect(resultado?.aclaraciones).toBe('Sin wasabi');
    expect(resultado?.total).toBe(formatearPrecio(TOTAL_DE_MUESTRA));
  });

  it('con cabecera configurada en /panel/pedido, se ignora igual', () => {
    const datos: DatosComensal = { nombre: 'Milena', modalidad: 'retiro' };
    const mensaje = armarMensaje(pedidoDeMuestra, datos, {
      cabecera: 'Hola! Quiero hacer un pedido',
    });
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(mensaje));

    expect(resultado?.modalidad).toBe('retiro');
    expect(resultado?.nombre).toBe('Milena');
  });
});

describe('los campos de plata, contra el armarMensaje() real', () => {
  it('delivery con pago y zona: los bloques nuevos NO caen en la lista de ítems', () => {
    const datos: DatosComensal = {
      nombre: 'Pedro',
      modalidad: 'delivery',
      direccion: 'Av. Siempre Viva 742',
      medioDePago: 'transferencia',
      zona: { nombre: 'Zona 2', precio: 3000 },
    };
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(armarMensaje(pedidoDeMuestra, datos)));

    expect(resultado?.medioDePago).toBe('transferencia');
    expect(resultado?.envio).toEqual({ zona: 'Zona 2', precio: 3000 });
    // el candado de esta task: el pedido tiene dos platos y siguen siendo dos.
    // Con la extensión vieja estos bloques se imprimían como renglones de la
    // comanda ("Pago: transferencia" abajo de los rolls).
    expect(resultado?.items).toHaveLength(2);
    for (const item of resultado?.items ?? []) {
      expect(item.texto).not.toMatch(/^(Pago|Envío|Descuento|Pedido #)/);
    }
    expect(resultado?.total).toBe(formatearPrecio(TOTAL_DE_MUESTRA + 3000));
  });

  it('el importe de cada línea sale igual al del pedido que lo generó', () => {
    const datos: DatosComensal = { nombre: 'Ana', modalidad: 'salon', mesa: '5' };
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(armarMensaje(pedidoDeMuestra, datos)));

    expect(resultado?.items[0].importe).toBe(12400 * 2);
    expect(resultado?.items[1].importe).toBe(8900);
  });

  it('retiro con descuento: el monto que viaja en el texto es el que lee la extensión', () => {
    // es lo que le permite calcular sin leer la config del panel
    const datos: DatosComensal = { nombre: 'Milena', modalidad: 'retiro', medioDePago: 'efectivo' };
    const mensaje = armarMensaje(pedidoDeMuestra, datos, {
      descuentoRetiro: { tipo: 'porcentaje', valor: 10 },
    });
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(mensaje));

    const descuento = Math.floor(TOTAL_DE_MUESTRA * 0.1);
    expect(resultado?.descuentoRetiro).toBe(descuento);
    expect(resultado?.medioDePago).toBe('efectivo');
    expect(resultado?.items).toHaveLength(2);
    expect(resultado?.total).toBe(formatearPrecio(TOTAL_DE_MUESTRA - descuento));
  });

  it('una zona sin cargo: el nombre llega igual, con precio 0 y sin un "$0" en el texto', () => {
    const datos: DatosComensal = {
      nombre: 'Pedro',
      modalidad: 'delivery',
      direccion: 'Av. Siempre Viva 742',
      zona: { nombre: 'Centro', precio: 0 },
    };
    const mensaje = armarMensaje(pedidoDeMuestra, datos);
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(mensaje));

    expect(mensaje).not.toContain('$0');
    // 0 y no null: es un cero conocido, y el ticket del cadete necesita la zona
    expect(resultado?.envio).toEqual({ zona: 'Centro', precio: 0 });
  });

  it('el bloque del código no desplaza nada: el mensaje sigue siendo legible', () => {
    // EL CANDADO DEL FORMATO. `parsearMensaje` arranca en el bloque siguiente al
    // ancla y espera contacto+nombre ahí. Si el bloque del código quedara pegado
    // al ancla se convierte en `resto[0]`, `parsearMensaje` devuelve null y el
    // botón de imprimir DESAPARECE para todos los pedidos. Nada más lo cubre:
    // este test corre contra el `armarMensaje()` real del sitio.
    const datos: DatosComensal = { nombre: 'Ana', modalidad: 'salon', mesa: '5' };
    const mensaje = armarMensaje(pedidoDeMuestra, datos, { codigo: 'A7F3K2' });
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(mensaje));

    expect(resultado).not.toBeNull();
    expect(resultado?.codigo).toBe('A7F3K2');
    expect(resultado?.nombre).toBe('Ana');
    expect(resultado?.mesa).toBe('5');
    expect(resultado?.items).toHaveLength(2);
    expect(resultado?.total).toBe(formatearPrecio(TOTAL_DE_MUESTRA));
  });

  it('el código con todos los otros campos de plata, y sin caer en los ítems', () => {
    const datos: DatosComensal = {
      nombre: 'Pedro',
      modalidad: 'delivery',
      direccion: 'Av. Siempre Viva 742',
      medioDePago: 'transferencia',
      zona: { nombre: 'Zona 2', precio: 3000 },
      notas: 'Sin wasabi',
    };
    const mensaje = armarMensaje(pedidoDeMuestra, datos, { codigo: 'B4M9XZ' });
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(mensaje));

    expect(resultado?.codigo).toBe('B4M9XZ');
    expect(resultado?.direccion).toBe('Av. Siempre Viva 742');
    expect(resultado?.medioDePago).toBe('transferencia');
    expect(resultado?.envio).toEqual({ zona: 'Zona 2', precio: 3000 });
    expect(resultado?.aclaraciones).toBe('Sin wasabi');
    // el pedido tiene dos platos y siguen siendo dos: ningún bloque nuevo se
    // imprime como renglón de la comanda
    expect(resultado?.items).toHaveLength(2);
    for (const item of resultado?.items ?? []) {
      expect(item.texto).not.toMatch(/^(Pago|Envío|Descuento|Pedido #)/);
    }
  });

  it('un mensaje sin ninguno de los campos nuevos, como los que ya están en el chat', () => {
    const datos: DatosComensal = { nombre: 'Ana', modalidad: 'salon', mesa: '5' };
    const resultado = parsearMensaje(comoLoVeWhatsAppWeb(armarMensaje(pedidoDeMuestra, datos)));

    expect(resultado?.medioDePago).toBeNull();
    expect(resultado?.envio).toBeNull();
    expect(resultado?.descuentoRetiro).toBeNull();
    expect(resultado?.codigo).toBeNull();
    expect(resultado?.items).toHaveLength(2);
  });
});
