import { describe, expect, it } from 'vitest';
import { parsearMensaje, textoSinImporte } from '../src/parser';

/** Un mensaje de pedido mínimo con los ítems que se le pasen, para no repetir
 *  el andamiaje (ancla, contacto, nombre y total) en cada test. Los ítems van
 *  todos en UN bloque, igual que los manda `armarMensaje()`. */
function mensajeCon(items: string[]): string {
  return [
    'Pedido — Sagrado Sushi',
    '',
    'Retiro por el local',
    'Ana',
    '',
    items.join('\n'),
    '',
    'Total: a confirmar',
  ].join('\n');
}

/** Un mensaje con los campos de plata, cada uno en su bloque y en el lugar que
 *  fija el contrato: después de la dirección y antes de los ítems.
 *
 *  Mezcla delivery con un descuento por retiro a propósito: al parser no le
 *  toca juzgar si la combinación tiene sentido, y así los campos nuevos entran
 *  todos en un solo caso. */
function mensajeConCampos(): string {
  return [
    'Pedido — Sagrado Sushi',
    '',
    'Delivery',
    'Pedro',
    '',
    'Dirección: Av. Siempre Viva 742',
    '',
    'Pago: transferencia',
    '',
    'Envío: Zona 2 — $3.000',
    '',
    'Descuento: retiro 10% — $2.480',
    '',
    '2 × Roll California — $12.400',
    '',
    'Total: $12.920',
  ].join('\n');
}

/** Un mensaje como los que ya están en el chat del local: ninguno de los
 *  campos nuevos. Tiene que seguir imprimiéndose igual. */
const mensajeViejo = [
  'Pedido — Sagrado Sushi',
  '',
  'Delivery',
  'Pedro',
  '',
  'Dirección: Av. Siempre Viva 742',
  '',
  '3 × Roll California — $18.600',
  '',
  'Total: $18.600',
  '',
  'Aclaraciones: Sin wasabi, por favor',
].join('\n');

describe('parsearMensaje', () => {
  it('salón con mesa', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'En el salón · Mesa 5',
      'Ana',
      '',
      '2 × Roll California — $12.400',
      '1 × Sashimi de salmón — $8.900',
      '',
      'Total: $21.300',
    ].join('\n');

    expect(parsearMensaje(texto)).toEqual({
      lineaContacto: 'En el salón · Mesa 5',
      modalidad: 'salon',
      mesa: '5',
      nombre: 'Ana',
      direccion: null,
      items: [
        { texto: '2 × Roll California — $12.400', importe: 12_400 },
        { texto: '1 × Sashimi de salmón — $8.900', importe: 8_900 },
      ],
      total: '$21.300',
      aclaraciones: null,
      medioDePago: null,
      envio: null,
      descuentoRetiro: null,
      codigo: null,
    });
  });

  it('delivery con dirección y aclaraciones, ignorando la cabecera antes del encabezado', () => {
    const texto = [
      'Hola! Quiero hacer un pedido',
      '',
      'Pedido — Sagrado Sushi',
      '',
      'Delivery',
      'Pedro',
      '',
      'Dirección: Av. Siempre Viva 742',
      '',
      '3 × Roll California — $18.600',
      '',
      'Total: $18.600',
      '',
      'Aclaraciones: Sin wasabi, por favor',
    ].join('\n');

    expect(parsearMensaje(texto)).toEqual({
      lineaContacto: 'Delivery',
      modalidad: 'delivery',
      mesa: null,
      nombre: 'Pedro',
      direccion: 'Av. Siempre Viva 742',
      items: [{ texto: '3 × Roll California — $18.600', importe: 18_600 }],
      total: '$18.600',
      aclaraciones: 'Sin wasabi, por favor',
      medioDePago: null,
      envio: null,
      descuentoRetiro: null,
      codigo: null,
    });
  });

  it('retiro, sin dirección ni aclaraciones', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'Retiro por el local',
      'Milena',
      '',
      '1 × Sake de la casa — a confirmar',
      '',
      'Total: a confirmar',
    ].join('\n');

    const resultado = parsearMensaje(texto);
    expect(resultado?.modalidad).toBe('retiro');
    expect(resultado?.mesa).toBeNull();
    expect(resultado?.direccion).toBeNull();
    expect(resultado?.total).toBe('a confirmar');
  });

  it('devuelve null si el texto no tiene el encabezado del pedido', () => {
    expect(parsearMensaje('Hola, ¿tienen delivery hoy?')).toBeNull();
  });

  it('mesa con " · " literal: trunca en vez de fallar (limitación aceptada)', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'En el salón · Mesa 5 · fondo',
      'Rocío',
      '',
      '2 × Roll California — $12.400',
      '',
      'Total: $12.400',
    ].join('\n');

    expect(parsearMensaje(texto)?.mesa).toBe('5');
  });

  it('modalidad no reconocida: no rompe, queda sin identificar', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'Take away urgente',
      'Carla',
      '',
      '1 × Roll California — $12.400',
      '',
      'Total: $12.400',
    ].join('\n');

    const resultado = parsearMensaje(texto);
    expect(resultado?.modalidad).toBeNull();
    expect(resultado?.mesa).toBeNull();
    expect(resultado?.lineaContacto).toBe('Take away urgente');
    expect(resultado?.nombre).toBe('Carla');
  });
});

describe('el importe de cada línea', () => {
  it('extrae el importe de cada línea', () => {
    const r = parsearMensaje(mensajeCon(['2 × Roll California — $12.400']));
    expect(r?.items[0]).toEqual({
      texto: '2 × Roll California — $12.400',
      importe: 12_400,
    });
  });

  it('una línea sin precio queda con importe null', () => {
    const r = parsearMensaje(mensajeCon(['1 × Sake — a confirmar']));
    expect(r?.items[0].importe).toBeNull();
  });

  it('parte por el ÚLTIMO separador: un plato con raya en el nombre no rompe', () => {
    const r = parsearMensaje(mensajeCon(['1 × Roll — especial — $9.000']));
    expect(r?.items[0].importe).toBe(9_000);
  });

  it('el cubierto, que trae un precio adentro del nombre, no confunde el importe', () => {
    const r = parsearMensaje(mensajeCon(['Cubierto (2 personas, $1.500 c/u) — $3.000']));
    expect(r?.items[0].importe).toBe(3_000);
  });

  it('textoSinImporte deja el renglón sin la cola de plata', () => {
    // es lo que le permite al ticket volver a escribir la línea con el importe
    // que decidió el local: un renglón bonificado sale en $0
    expect(textoSinImporte('2 × Roll California — $12.400')).toBe('2 × Roll California');
    expect(textoSinImporte('1 × Roll — especial — $9.000')).toBe('1 × Roll — especial');
    // sin separador no hay nada que sacar: se devuelve tal cual
    expect(textoSinImporte('2 × Roll California')).toBe('2 × Roll California');
  });
});

describe('los campos de plata', () => {
  it('reconoce los campos nuevos y NO los mete en los ítems', () => {
    const r = parsearMensaje(mensajeConCampos());
    expect(r?.medioDePago).toBe('transferencia');
    expect(r?.envio).toEqual({ zona: 'Zona 2', precio: 3_000 });
    expect(r?.descuentoRetiro).toBe(2_480);
    // el único ítem sigue siendo uno: los bloques nuevos no se colaron
    expect(r?.items).toHaveLength(1);
  });

  it('una zona sin cargo da precio 0, no null: el nombre de la zona igual hace falta', () => {
    // el panel permite cargar una zona en $0 y el mensaje manda el bloque
    // igual, para que el ticket del cadete pueda decir a dónde va
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'Delivery',
      'Ana',
      '',
      'Dirección: Av. Siempre Viva 742',
      '',
      'Envío: Centro — sin cargo',
      '',
      '1 × Roll California — $9.000',
      '',
      'Total: $9.000',
    ].join('\n');
    const r = parsearMensaje(texto);
    expect(r?.envio).toEqual({ zona: 'Centro', precio: 0 });
  });

  it('el descuento por monto fijo, sin porcentaje en el texto, también se lee', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'Retiro por el local',
      'Ana',
      '',
      'Descuento: retiro — $2.480',
      '',
      '2 × Roll California — $12.400',
      '',
      'Total: $9.920',
    ].join('\n');
    expect(parsearMensaje(texto)?.descuentoRetiro).toBe(2_480);
  });

  it('un medio de pago desconocido queda en null en vez de viajar como válido', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'Retiro por el local',
      'Ana',
      '',
      'Pago: bitcoin',
      '',
      '2 × Roll California — $12.400',
      '',
      'Total: $12.400',
    ].join('\n');
    const r = parsearMensaje(texto);
    expect(r?.medioDePago).toBeNull();
    // y tampoco se cuela como ítem: el bloque se reconoció por el prefijo
    expect(r?.items).toHaveLength(1);
  });

  it('lee el código del pedido cuando viene', () => {
    const texto = [
      'Pedido — Sagrado Sushi',
      '',
      'Retiro por el local',
      'Ana',
      '',
      'Pedido #A7F3K2',
      '',
      '2 × Roll California — $12.400',
      '',
      'Total: $12.400',
    ].join('\n');
    const r = parsearMensaje(texto);
    expect(r?.codigo).toBe('A7F3K2');
    expect(r?.items).toHaveLength(1);
  });

  it('el ancla no se confunde con el código de pedido', () => {
    // "Pedido — Sagrado Sushi" empieza con "Pedido ", pero el prefijo del
    // código es "Pedido #". OJO: hoy este test pasaría igual con "Pedido " a
    // secas, porque el ancla se busca con indexOf y el loop de prefijos arranca
    // después. Queda como documentación de la decisión, no como candado: el
    // riesgo real es una implementación futura que aplique la tabla de prefijos
    // sobre TODOS los bloques, y ahí el ancla se leería como código y el botón
    // desaparecería en todos los pedidos.
    const r = parsearMensaje(mensajeCon(['1 × Roll — $9.000']));
    expect(r).not.toBeNull();
    expect(r?.codigo).toBeNull();
  });

  it('un mensaje viejo, sin ninguno de los campos nuevos, se sigue entendiendo', () => {
    const r = parsearMensaje(mensajeViejo);
    expect(r?.modalidad).toBe('delivery');
    expect(r?.medioDePago).toBeNull();
    expect(r?.envio).toBeNull();
    expect(r?.descuentoRetiro).toBeNull();
    expect(r?.codigo).toBeNull();
    expect(r?.items.length).toBeGreaterThan(0);
  });
});
