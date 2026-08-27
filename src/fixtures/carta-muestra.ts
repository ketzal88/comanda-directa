import type { Carta, ConfigPedido } from '@/logica/tipos';

/** Carta de muestra para el cliente `demo` (ver `scripts/seed-demo.ts`) y
 *  para probar una plantilla nueva sin depender de un cliente real. Nunca se
 *  sirve en producción bajo el slug de un cliente real: cada cliente lee su
 *  propia carta de Supabase, vacía o no. */
export const CARTA_MUESTRA: Carta = {
  categorias: [
    { id: 'entradas', nombre: 'ENTRADAS', nombreEn: 'Starters', orden: 1, subcategorias: [] },
    { id: 'principales', nombre: 'PRINCIPALES', nombreEn: 'Mains', orden: 2, subcategorias: [] },
    { id: 'bebidas', nombre: 'BEBIDAS', nombreEn: 'Drinks', orden: 3, subcategorias: [] },
  ],
  items: [
    {
      id: 'papas',
      numero: 0,
      nombre: 'Papas fritas',
      categoriaId: 'entradas',
      orden: 1,
      precio: 4500,
      variantes: [],
      agotado: false,
      activo: true,
      etiquetas: ['vegetariano'],
      descripcion: 'Con cheddar y panceta.',
    },
    {
      id: 'empanadas',
      numero: 0,
      nombre: 'Empanadas (4 u.)',
      categoriaId: 'entradas',
      orden: 2,
      precio: 0,
      variantes: [
        { etiqueta: 'carne', precio: 5200 },
        { etiqueta: 'jamón y queso', precio: 5200 },
      ],
      agotado: false,
      activo: true,
      piezas: 4,
      etiquetas: [],
    },
    {
      id: 'hamburguesa',
      numero: 0,
      nombre: 'Hamburguesa clásica',
      categoriaId: 'principales',
      orden: 1,
      precio: 9800,
      variantes: [],
      agotado: false,
      activo: true,
      etiquetas: ['recomendado'],
      descripcion: 'Doble carne, cheddar, panceta y papas.',
    },
    {
      id: 'ensalada',
      numero: 0,
      nombre: 'Ensalada de la casa',
      categoriaId: 'principales',
      orden: 2,
      precio: 7200,
      variantes: [],
      agotado: true,
      activo: true,
      etiquetas: ['vegano', 'sin TACC'],
    },
    {
      id: 'gaseosa',
      numero: 0,
      nombre: 'Gaseosa línea Coca-Cola',
      categoriaId: 'bebidas',
      orden: 1,
      precio: 2200,
      variantes: [],
      agotado: false,
      activo: true,
      etiquetas: [],
    },
  ],
  config: { notas: ['Todos los precios incluyen impuestos.'], cubiertoPorPersona: 1500 },
};

export const CONFIG_PEDIDO_MUESTRA: ConfigPedido = {
  whatsapp: '5491100000000',
  modalidades: ['salon', 'retiro', 'delivery'],
  cabecera: '',
  mediosDePago: ['efectivo', 'transferencia'],
  zonasEnvio: [
    { nombre: 'Zona 1', precio: 2000 },
    { nombre: 'Zona 2', precio: 3000 },
  ],
  descuentoRetiro: { tipo: 'porcentaje', valor: 10 },
};
