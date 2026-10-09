/** Selecciones: catálogos chicos, armados para UN comprador, que se le pasan
 *  por link (`/<cliente>/p/<codigo>`). El comprador ve sólo esos productos,
 *  con sus cantidades, agrupados en opciones, y elige una para el pedido.
 *
 *  Viven acá y no en la base porque `clientes` no tiene dónde guardarlas, y
 *  la tabla es de todos los clientes. La contra: sumar una selección es un
 *  commit y un deploy. Si se vuelve rutina, va a la base con su pantalla en
 *  el panel.
 *
 *  - El código es al azar (6 letras y números) y NO dice de quién es: el link
 *    se comparte y la selección suele estar armada para una casa puntual.
 *    Nada de direcciones ni nombres de compradores en este archivo.
 *  - Los productos se nombran como en la carta. Precio y foto salen de la
 *    carta, no de acá: si el precio cambia, la selección lo toma solo. La
 *    prueba `pruebas/selecciones.test.ts` verifica que cada nombre exista.
 *  - `acumulativas`: cada opción suma a la anterior (B = A + lo de B). */

export type LineaSeleccion = {
  producto: string;
  cantidad: number;
  /** Dónde va o para qué: se muestra debajo del producto. */
  nota?: string;
};

export type OpcionSeleccion = {
  letra: string;
  nombre: string;
  lineas: LineaSeleccion[];
};

export type Seleccion = {
  titulo: string;
  bajada?: string;
  acumulativas: boolean;
  opciones: OpcionSeleccion[];
};

export const SELECCIONES: Record<string, Record<string, Seleccion>> = {
  'party-market': {
    // Presupuesto del 08/10/2026 (planilla "pedido" que armó Cinthia).
    upopj6: {
      titulo: 'Tu presupuesto de Halloween',
      bajada: 'Para una fachada colonial con jardín. Cada opción suma a la anterior: elegí hasta dónde llegar.',
      acumulativas: true,
      opciones: [
        {
          letra: 'A',
          nombre: 'Cementerio del jardín',
          lineas: [
            { producto: 'Sepulcro Olvidado', cantidad: 1, nota: 'Centro del pasto (pieza principal)' },
            { producto: 'Piedra de Descanso Eterno', cantidad: 1, nota: 'Pasto' },
            { producto: 'Tumba Maldita Muerte', cantidad: 1, nota: 'Pasto' },
            { producto: 'Lápida Embrujo de la Muerte', cantidad: 2, nota: 'Pasto' },
            { producto: 'Set Lápidas Abandonadas', cantidad: 1, nota: 'Pasto' },
            { producto: 'Brazo Esqueleto con Mano V para clavar', cantidad: 4, nota: 'Saliendo de la tierra' },
            {
              producto: 'Set Calavera y Brazos de la Cripta LED',
              cantidad: 1,
              nota: 'Delante del sepulcro, saliendo de la tierra',
            },
            { producto: 'Vela LED Mano Tenebrosa', cantidad: 6, nota: 'Sobre las tumbas' },
            { producto: 'Colgante Novia Embrujada', cantidad: 1, nota: 'Balcón sobre la puerta' },
            { producto: 'Vela LED Calavera Macabra', cantidad: 4, nota: 'Galería de entrada' },
            { producto: 'Telaraña Halloween', cantidad: 6, nota: 'Cerco de boj' },
            { producto: 'Telaraña Glow in the Dark', cantidad: 4, nota: 'Cerco de boj' },
            { producto: 'Set Arañas', cantidad: 2, nota: 'Cerco de boj' },
            { producto: 'Telaraña para las Ventanas', cantidad: 6, nota: 'Ventanas' },
            {
              producto: 'Set Murciélagos x4',
              cantidad: 4,
              nota: 'Agrupados alrededor de la ventana central de arriba',
            },
            { producto: 'Murciélago Peludo', cantidad: 2, nota: 'Pared, uno a cada lado del balcón' },
          ],
        },
        {
          letra: 'B',
          nombre: 'Mansión embrujada',
          lineas: [
            { producto: 'Lápida Súper Macabra', cantidad: 1, nota: 'Cementerio' },
            { producto: 'Lápida Ángel', cantidad: 1, nota: 'Cementerio' },
            { producto: 'Columpio del Espiritu para Colgar', cantidad: 1, nota: 'Arco de la cochera' },
            { producto: 'Fantasma en Jaula', cantidad: 1, nota: 'Galería, al lado de la puerta' },
            { producto: 'Colgante Fantasma Diabólico', cantidad: 1, nota: 'Árbol izquierdo' },
            { producto: 'Colgante Pesadilla Blanco', cantidad: 1, nota: 'Árbol derecho' },
          ],
        },
        {
          letra: 'C',
          nombre: 'Noche en el cementerio',
          lineas: [
            { producto: 'Guardián Macabro del Cementerio', cantidad: 1, nota: 'Custodiando el sepulcro' },
            { producto: 'Zombie Aliento de Tumba', cantidad: 1, nota: 'Saliendo de una tumba' },
            { producto: 'Recolector de Almas Desgraciadas', cantidad: 1, nota: 'Recibiendo en la puerta' },
          ],
        },
      ],
    },
  },
};

/** Las líneas de una opción, ya acumuladas si corresponde. */
export function lineasDeOpcion(seleccion: Seleccion, letra: string): LineaSeleccion[] {
  const i = seleccion.opciones.findIndex((o) => o.letra === letra);
  if (i < 0) return [];
  const hasta = seleccion.acumulativas ? seleccion.opciones.slice(0, i + 1) : [seleccion.opciones[i]];
  return hasta.flatMap((o) => o.lineas);
}
