/** Etiquetas de un ítem: lista CERRADA. Con texto libre, "sin tacc" y
 *  "Sin TACC" convivirían y el filtro (o el aviso al comensal) devolvería la
 *  mitad de lo que corresponde. */
export const ETIQUETAS = [
  'vegetariano',
  'vegano',
  'sin TACC',
  'picante',
  'crudo',
  'cocido',
  'sin lactosa',
  'recomendado',
  'nuevo',
] as const;
export type Etiqueta = (typeof ETIQUETAS)[number];

export type Subcategoria = { nombre: string; orden: number };

/** Un tamaño (o una variante) del mismo plato, con su propio precio.
 *  `etiqueta` es lo que se le muestra: "5 pz", "10 pz", "pollo". */
export type Variante = { etiqueta: string; precio: number };

export type Categoria = {
  id: string;
  nombre: string;
  nombreEn: string;
  orden: number;
  subcategorias: Subcategoria[];
};

export type Item = {
  id: string;
  /** Derivado del orden, corrido desde 1 en toda la carta. Nunca se edita a mano. */
  numero: number;
  nombre: string;
  categoriaId: string;
  subcategoria?: string;
  orden: number;
  /** ENTERO en pesos. Nunca "$12.400". 0 = "sin precio cargado": la pantalla
   *  lo oculta, jamás muestra $0. Con `variantes` cargadas este campo NO se
   *  usa: el precio sale de la variante elegida (ver `logica/variantes.ts`). */
  precio: number;
  /** Los tamaños del plato. Vacío = un solo precio, el de `precio`. */
  variantes: Variante[];
  agotado: boolean;
  /** false = borrado suave, no aparece en la carta */
  activo: boolean;
  /** Cuántas piezas trae. Sin dato no se inventa: la fila no lo muestra. */
  piezas?: number;
  etiquetas: Etiqueta[];
  descripcion?: string;
  /** Ruta propia ("/fotos/x.webp") o URL https. */
  fotoUrl?: string;
};

/** El pie de la carta y el cubierto del salón.
 *  `cubiertoPorPersona` es ENTERO en pesos. 0 = sin cargar: el pedido no lo
 *  suma ni lo ofrece, en vez de mostrar $0. */
export type ConfigCarta = {
  notas: string[];
  cubiertoPorPersona: number;
};

/** Las tres formas de recibir un pedido. Se pueden apagar por separado desde
 *  el panel: un martes sin cadetes, delivery se apaga y deja de ofrecerse. */
export const MODALIDADES = ['salon', 'retiro', 'delivery'] as const;
export type Modalidad = (typeof MODALIDADES)[number];

/** Un descuento tal como lo carga el local. `ninguno` existe para no usar
 *  null en todos lados. */
export type Descuento =
  | { tipo: 'ninguno' }
  | { tipo: 'porcentaje'; valor: number } // 0 a 100
  | { tipo: 'monto'; valor: number }; // ENTERO en pesos

export const MEDIOS_DE_PAGO = ['transferencia', 'efectivo', 'link'] as const;
export type MedioDePago = (typeof MEDIOS_DE_PAGO)[number];

/** Una zona de envío con su precio. El local las asigna a mano según el
 *  barrio: la app no calcula distancias.
 *
 *  `precio` distingue TRES casos y no dos: un entero es lo que sale, `0` es
 *  sin cargo —el local lo bonifica— y `null` es "a convenir", todavía no se
 *  sabe. Sin el tercero, una zona sin cotizar habría que cargarla en 0 y la
 *  carta le prometería envío gratis a alguien a quien después hay que
 *  cobrarle. */
export type ZonaEnvio = { nombre: string; precio: number | null };

/** Cómo sale el pedido por WhatsApp para este cliente. */
export type ConfigPedido = {
  /** Solo dígitos, con código de país. Vacío = el botón no se muestra. */
  whatsapp: string;
  /** Qué modalidades están abiertas hoy. Vacío = ninguna. */
  modalidades: Modalidad[];
  /** Una línea que el local quiera meter arriba del mensaje. */
  cabecera: string;
  mediosDePago: MedioDePago[];
  zonasEnvio: ZonaEnvio[];
  /** Descuento automático por retirar en el local. */
  descuentoRetiro: Descuento;
};

export type Carta = {
  categorias: Categoria[];
  items: Item[];
  config: ConfigCarta;
};

/** Los cuatro colores de marca de un cliente. Se aplican como variables CSS
 *  en tiempo de request (`[cliente]/layout.tsx`): a diferencia de un
 *  `@theme` de Tailwind (que es compile-time), acá cada cliente pinta su
 *  propia carta con el mismo build. */
export type Tema = {
  colorFondo: string;
  colorTexto: string;
  colorTextoSuave: string;
  colorAcento: string;
  /** URL https (o ruta propia). Sin logo, `Marca` muestra el nombre en texto. */
  logoUrl?: string;
};

export const TEMA_DEFECTO: Tema = {
  colorFondo: '#171717',
  colorTexto: '#ffffff',
  colorTextoSuave: '#a3a3a3',
  colorAcento: '#e2703a',
};

/** Un cliente de Comanda Directa: un restaurante con su propia carta, tema y
 *  configuración de pedido. Categorías e ítems cuelgan de acá por
 *  `clienteId`; `ConfigCarta` y `ConfigPedido` (lo que ya conocen los
 *  componentes portados) son vistas derivadas de estos mismos campos, no
 *  tablas aparte — acá vive todo en una sola fila por simplicidad. */
export type Cliente = {
  id: string;
  slug: string;
  nombre: string;
  plantilla: string;
  tema: Tema;
  activo: boolean;
  claveHash: string | null;
  notas: string[];
  cubiertoPorPersona: number;
  whatsapp: string;
  modalidades: Modalidad[];
  cabecera: string;
  mediosDePago: MedioDePago[];
  zonasEnvio: ZonaEnvio[];
  descuentoRetiro: Descuento;
};

export function configCartaDe(cliente: Cliente): ConfigCarta {
  return { notas: cliente.notas, cubiertoPorPersona: cliente.cubiertoPorPersona };
}

export function configPedidoDe(cliente: Cliente): ConfigPedido {
  return {
    whatsapp: cliente.whatsapp,
    modalidades: cliente.modalidades,
    cabecera: cliente.cabecera,
    mediosDePago: cliente.mediosDePago,
    zonasEnvio: cliente.zonasEnvio,
    descuentoRetiro: cliente.descuentoRetiro,
  };
}
