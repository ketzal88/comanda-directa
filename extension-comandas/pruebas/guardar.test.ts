import { describe, expect, it } from 'vitest';
import { HEADER_CLAVE } from '../../src/logica/clave-panel';
import { armarCobro, seleccionInicial } from '../src/formulario';
import {
  armarCuerpo,
  coincideElRegistro,
  direccionUsable,
  guardarPedido,
  probarConexion,
} from '../src/guardar';
import type { OpcionesHttp, RespuestaHttp, Traer } from '../src/guardar';
import type { PedidoParseado } from '../src/parser';

const CLAVE = 'la-clave-del-panel';
const AJUSTES = { direccion: 'https://carta.sagradosushi.com', clave: CLAVE };

const pedidoConCodigo: PedidoParseado = {
  lineaContacto: 'Retiro por el local',
  modalidad: 'retiro',
  mesa: null,
  nombre: 'Milena',
  direccion: null,
  telefono: null,
  items: [
    { texto: '2 × Roll California — $24.800', importe: 24_800 },
    { texto: '1 × Sake de la casa — a confirmar', importe: null },
  ],
  total: '$22.320',
  aclaraciones: 'sin palta',
  medioDePago: 'transferencia',
  envio: null,
  descuentoRetiro: 2_480,
  codigo: 'A7F3K2',
};

const pedidoSinCodigo: PedidoParseado = { ...pedidoConCodigo, codigo: null };

function cobroDe(pedido: PedidoParseado) {
  return armarCobro(pedido, seleccionInicial(pedido));
}

const respuesta = (status: number, cuerpo: unknown = {}): RespuestaHttp => ({
  status,
  json: async () => cuerpo,
});

type Llamada = { url: string; opciones?: OpcionesHttp };

/** Un `fetch` de mentira que anota lo que le pidieron. La lista de llamadas es
 *  la mitad de lo que se verifica acá: que NO se pegue a una URL armada con un
 *  código inválido, y que no se postee cuando la clave está mal, no se ven en
 *  el resultado. */
function espiar(manejar: (url: string) => RespuestaHttp | Promise<RespuestaHttp>) {
  const llamadas: Llamada[] = [];
  const traer: Traer = async (url, opciones) => {
    llamadas.push({ url, opciones });
    return manejar(url);
  };
  return { traer, llamadas };
}

const deps = (traer: Traer, codigoNuevo = 'NUEVO9') => ({
  traer,
  generarCodigo: () => codigoNuevo,
});

describe('direccionUsable', () => {
  it('saca la barra final para que la URL no quede con dos', () => {
    expect(direccionUsable('https://carta.sagradosushi.com/')).toBe(
      'https://carta.sagradosushi.com',
    );
  });

  it('rechaza lo que no es una dirección http', () => {
    expect(direccionUsable('')).toBeNull();
    expect(direccionUsable('carta.sagradosushi.com')).toBeNull();
    expect(direccionUsable('javascript:alert(1)')).toBeNull();
  });
});

describe('coincideElRegistro', () => {
  it('compara el nombre sin importar mayúsculas ni espacios', () => {
    expect(
      coincideElRegistro(pedidoConCodigo, {
        nombre: '  MILENA ',
        lineas: [{ texto: 'a' }, { texto: 'b' }],
      }),
    ).toBe(true);
  });

  it('no coincide con otro nombre: el código pudo chocar con el pedido de otro', () => {
    expect(
      coincideElRegistro(pedidoConCodigo, {
        nombre: 'Pedro',
        lineas: [{ texto: 'a' }, { texto: 'b' }],
      }),
    ).toBe(false);
  });

  it('no coincide con otra cantidad de líneas: `bonificadas` indexa contra las guardadas', () => {
    expect(coincideElRegistro(pedidoConCodigo, { nombre: 'Milena', lineas: [{ texto: 'a' }] })).toBe(
      false,
    );
  });

  it('no coincide con un registro sin forma', () => {
    expect(coincideElRegistro(pedidoConCodigo, null)).toBe(false);
    expect(coincideElRegistro(pedidoConCodigo, { nombre: 'Milena' })).toBe(false);
  });
});

describe('armarCuerpo', () => {
  it('manda el renglón SIN la cola de precio, igual que lo guarda la carta', () => {
    // El historial tiene que mostrar la misma forma venga de la carta o de la
    // extensión. La carta guarda `textoDeLinea()`, que no lleva la plata: el
    // importe tiene su propio campo, y dejarlo también adentro del texto lo
    // duplicaría en pantalla.
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), null);
    expect(cuerpo.lineas).toEqual([
      { texto: '2 × Roll California', importe: 24_800 },
      { texto: '1 × Sake de la casa', importe: null },
    ]);
  });

  it('manda la modalidad verbatim, incluido el null', () => {
    const sinModalidad = { ...pedidoConCodigo, modalidad: null };
    expect(armarCuerpo(sinModalidad, cobroDe(sinModalidad), null).modalidad).toBeNull();
    expect(armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), null).modalidad).toBe('retiro');
  });

  it('manda los dos descuentos como Descuento, para que la ruta recalcule la cuenta', () => {
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), null);
    expect(cuerpo.descuentoRetiro).toEqual({ tipo: 'monto', valor: 2_480 });
    expect(cuerpo.descuentoManual).toEqual({ tipo: 'ninguno' });
  });

  it('separa lo que eligió el comensal de lo que cobró el local', () => {
    const pedido = { ...pedidoSinCodigo, modalidad: 'delivery' as const, envio: null };
    const cobro = {
      ...cobroDe(pedido),
      medioDePago: 'efectivo' as const,
      envio: { zona: 'Zona 2', precio: 3_000 },
    };
    const cuerpo = armarCuerpo(pedido, cobro, null);
    expect(cuerpo.pagoElegido).toBe('transferencia');
    expect(cuerpo.envioElegido).toBeNull();
    expect(cuerpo.medioDePago).toBe('efectivo');
    expect(cuerpo.envio).toEqual({ zona: 'Zona 2', precio: 3_000 });
  });

  it('no manda `codigo`: el de la URL es el que manda', () => {
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), null);
    expect(cuerpo).not.toHaveProperty('codigo');
    expect(cuerpo).not.toHaveProperty('codigoDelMensaje');
  });

  it('guarda el código original cuando el registro se crea con otro', () => {
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), 'A7F3K2');
    expect(cuerpo.codigoDelMensaje).toBe('A7F3K2');
  });

  it('manda las aclaraciones como notas y no manda la cuenta (la recalcula la ruta)', () => {
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), null);
    expect(cuerpo.notas).toBe('sin palta');
    expect(cuerpo).not.toHaveProperty('cuenta');
  });
});

describe('guardarPedido', () => {
  it('sin dirección o sin clave no toca la red y avisa qué falta', async () => {
    const { traer, llamadas } = espiar(() => respuesta(200));
    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      { direccion: '', clave: '' },
      deps(traer),
    );
    expect(resultado.ok).toBe(false);
    expect(llamadas).toHaveLength(0);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/opciones/i);
  });

  it('con el código del mensaje y un registro que coincide, confirma sobre ese código', async () => {
    const { traer, llamadas } = espiar((url) =>
      url.endsWith('/api/pedidos/A7F3K2')
        ? respuesta(200, { pedido: { nombre: 'milena', lineas: [{}, {}] } })
        : respuesta(200, { ok: true, creado: false }),
    );

    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado).toEqual({
      ok: true,
      codigo: 'A7F3K2',
      creado: false,
      codigoDelMensaje: 'A7F3K2',
    });
    expect(llamadas.map((l) => l.url)).toEqual([
      'https://carta.sagradosushi.com/api/pedidos/A7F3K2',
      'https://carta.sagradosushi.com/api/pedidos/A7F3K2/confirmar',
    ]);
    expect(llamadas[1].opciones?.headers[HEADER_CLAVE]).toBe(CLAVE);
    expect(llamadas[1].opciones?.method).toBe('POST');
  });

  it('si el registro no existe, crea uno con un código nuevo y anota el del mensaje', async () => {
    const { traer, llamadas } = espiar((url) =>
      url.endsWith('/api/pedidos/A7F3K2')
        ? respuesta(404, { error: 'No existe ese pedido' })
        : respuesta(200, { ok: true, creado: true }),
    );

    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado).toEqual({
      ok: true,
      codigo: 'NUEVO9',
      creado: true,
      codigoDelMensaje: 'A7F3K2',
    });
    expect(llamadas[1].url).toBe('https://carta.sagradosushi.com/api/pedidos/NUEVO9/confirmar');
    expect(JSON.parse(llamadas[1].opciones?.body ?? '{}').codigoDelMensaje).toBe('A7F3K2');
  });

  it('si el nombre no coincide, no confirma sobre ese registro: es el pedido de otro', async () => {
    const { traer, llamadas } = espiar((url) =>
      url.endsWith('/api/pedidos/A7F3K2')
        ? respuesta(200, { pedido: { nombre: 'Pedro', lineas: [{}, {}] } })
        : respuesta(200, { ok: true, creado: true }),
    );

    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado.ok && resultado.codigo).toBe('NUEVO9');
    expect(llamadas[1].url).toBe('https://carta.sagradosushi.com/api/pedidos/NUEVO9/confirmar');
  });

  it('si la cantidad de líneas no coincide, tampoco confirma sobre ese registro', async () => {
    const { traer } = espiar((url) =>
      url.endsWith('/api/pedidos/A7F3K2')
        ? respuesta(200, { pedido: { nombre: 'Milena', lineas: [{}] } })
        : respuesta(200, { ok: true, creado: true }),
    );

    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado.ok && resultado.codigo).toBe('NUEVO9');
  });

  it('sin código en el mensaje no busca nada: crea derecho, sin codigoDelMensaje', async () => {
    const { traer, llamadas } = espiar(() => respuesta(200, { ok: true, creado: true }));

    const resultado = await guardarPedido(
      pedidoSinCodigo,
      cobroDe(pedidoSinCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado).toEqual({
      ok: true,
      codigo: 'NUEVO9',
      creado: true,
      codigoDelMensaje: null,
    });
    expect(llamadas).toHaveLength(1);
    expect(llamadas[0].url).toBe('https://carta.sagradosushi.com/api/pedidos/NUEVO9/confirmar');
    expect(JSON.parse(llamadas[0].opciones?.body ?? '{}')).not.toHaveProperty('codigoDelMensaje');
  });

  it('un código deforme del mensaje NUNCA entra en una URL', async () => {
    // "Pedido #../../admin" sale del parser verbatim, y "Pedido #" a secas
    // parsea a ''. Se valida ACÁ, antes de armar la URL: delegárselo a la ruta
    // sería mandarle el string igual.
    for (const codigo of ['../../admin', '', 'A7F3K2 ']) {
      const { traer, llamadas } = espiar(() => respuesta(200, { ok: true, creado: true }));
      const pedido = { ...pedidoConCodigo, codigo };
      const resultado = await guardarPedido(pedido, cobroDe(pedido), AJUSTES, deps(traer));

      expect(llamadas).toHaveLength(1);
      expect(llamadas[0].url).toBe('https://carta.sagradosushi.com/api/pedidos/NUEVO9/confirmar');
      expect(JSON.parse(llamadas[0].opciones?.body ?? '{}')).not.toHaveProperty('codigoDelMensaje');
      expect(resultado.ok && resultado.codigoDelMensaje).toBeNull();
    }
  });

  it('con la clave mal no postea nada y lo dice', async () => {
    const { traer, llamadas } = espiar(() => respuesta(401, { error: 'Sin autorización' }));
    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/clave/i);
    expect(llamadas).toHaveLength(1);
  });

  it('un 409 de la confirmación se informa como cualquier otra falla de guardado', async () => {
    const { traer } = espiar((url) =>
      url.endsWith('/confirmar')
        ? respuesta(409, { error: 'El pedido registrado tiene otras líneas' })
        : respuesta(200, { pedido: { nombre: 'Milena', lineas: [{}, {}] } }),
    );

    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toContain('otras líneas');
  });

  it('sin red devuelve el error en vez de tirar la excepción encima de la impresión', async () => {
    const traer: Traer = async () => {
      throw new TypeError('Failed to fetch');
    };
    const resultado = await guardarPedido(
      pedidoConCodigo,
      cobroDe(pedidoConCodigo),
      AJUSTES,
      deps(traer),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/conect/i);
  });
});

describe('probarConexion', () => {
  it('un 404 es la respuesta buena: la clave sirve y ese pedido no existe', async () => {
    const { traer, llamadas } = espiar(() => respuesta(404, { error: 'No existe ese pedido' }));
    const resultado = await probarConexion(AJUSTES, traer);

    expect(resultado.ok).toBe(true);
    expect(llamadas[0].opciones?.headers[HEADER_CLAVE]).toBe(CLAVE);
    // el código de prueba tiene que ser válido, o el 404 no probaría la clave
    expect(llamadas[0].url).toMatch(/\/api\/pedidos\/[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
  });

  it('un 404 con la página de error de otro sitio NO es una conexión buena', async () => {
    // cualquier sitio contesta 404 en una ruta que no tiene: si la dirección
    // está equivocada, esto diría "listo" y después no se guardaría nada
    const traer: Traer = async () => ({
      status: 404,
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON');
      },
    });
    const resultado = await probarConexion(AJUSTES, traer);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/dirección/i);
  });

  it('un 401 es la clave mal', async () => {
    const { traer } = espiar(() => respuesta(401, { error: 'Sin autorización' }));
    const resultado = await probarConexion(AJUSTES, traer);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/clave/i);
  });

  it('sin red lo dice, en vez de tirar la excepción', async () => {
    const traer: Traer = async () => {
      throw new TypeError('Failed to fetch');
    };
    const resultado = await probarConexion(AJUSTES, traer);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/conect/i);
  });
});

describe('el texto de las líneas coincide con el que guarda la carta', () => {
  // Los dos caminos escriben en la misma colección: la carta cuando el comensal
  // manda el pedido, y la extensión cuando el local confirma uno que no estaba
  // registrado. Si guardaran el renglón distinto, el historial mostraría el
  // mismo plato de dos formas según por dónde entró. El importe tiene su propio
  // campo, así que dejarlo también adentro del texto lo duplicaría.
  it('guarda el renglón sin la cola de precio', () => {
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), 'A7F3K2');
    for (const linea of cuerpo.lineas) {
      expect(linea.texto).not.toMatch(/ — [$]/);
      expect(linea.texto).not.toMatch(/a confirmar$/);
    }
  });

  it('el importe sigue viajando aparte, no se pierde', () => {
    const cuerpo = armarCuerpo(pedidoConCodigo, cobroDe(pedidoConCodigo), 'A7F3K2');
    expect(cuerpo.lineas.some((l) => typeof l.importe === 'number')).toBe(true);
  });
});
