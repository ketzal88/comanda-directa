import { parsearPrecio } from './precio';
import { ETIQUETAS, type Categoria, type Etiqueta, type Item, type Variante } from './tipos';

export type ErrorFila = { fila: number; campo: string; mensaje: string };
export type ItemBorrador = Omit<Item, 'id' | 'numero' | 'agotado' | 'activo'>;

const COLUMNAS = [
  'categoria',
  'subcategoria',
  'nombre',
  'descripcion',
  'piezas',
  'precio',
  'variantes',
  'etiquetas',
] as const;

/** Lee la columna `variantes`: "5 pz:10300;10 pz:17200". */
function leerVariantes(texto: string): { variantes: Variante[]; errores: string[] } {
  const errores: string[] = [];
  const variantes: Variante[] = [];
  const vistas = new Set<string>();

  for (const trozo of texto
    .split(';')
    .map((t) => t.trim())
    .filter(Boolean)) {
    const corte = trozo.lastIndexOf(':');
    if (corte < 0) {
      errores.push(`"${trozo}" tendría que ser medida:precio, como "5 pz:10300"`);
      continue;
    }

    const etiqueta = trozo.slice(0, corte).trim();
    const precio = parsearPrecio(trozo.slice(corte + 1));

    if (!etiqueta) errores.push(`Falta el nombre de la medida en "${trozo}"`);
    else if (vistas.has(etiqueta.toLowerCase())) {
      errores.push(`La medida "${etiqueta}" está dos veces en el mismo ítem`);
    }
    if (precio == null) errores.push(`No se entiende el precio de "${trozo}"`);

    if (!etiqueta || precio == null || vistas.has(etiqueta.toLowerCase())) continue;
    vistas.add(etiqueta.toLowerCase());
    variantes.push({ etiqueta, precio });
  }

  return { variantes, errores };
}

/** Parte una línea de CSV respetando las comillas dobles. */
function partirLinea(linea: string): string[] {
  const campos: string[] = [];
  let actual = '';
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      if (enComillas && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else enComillas = !enComillas;
    } else if (c === ',' && !enComillas) {
      campos.push(actual);
      actual = '';
    } else actual += c;
  }
  campos.push(actual);
  return campos.map((c) => c.trim());
}

/** Lee la planilla completa y ACUMULA todos los errores en vez de cortar en
 *  el primero. */
export function leerPlanilla(
  csv: string,
  categorias: Categoria[],
): { filas: ItemBorrador[]; errores: ErrorFila[] } {
  const errores: ErrorFila[] = [];
  const lineas = csv.split(/\r?\n/);
  if (!lineas.length) return { filas: [], errores };

  const encabezado = partirLinea(lineas[0]).map((c) => c.trim());
  const faltantes = COLUMNAS.filter((c) => !encabezado.includes(c));
  if (faltantes.length) {
    return {
      filas: [],
      errores: [
        {
          fila: 1,
          campo: 'encabezado',
          mensaje: `Faltan estas columnas en la primera fila: ${faltantes.join(', ')}`,
        },
      ],
    };
  }
  const indice = (col: string) => encabezado.indexOf(col);

  const porNombre = new Map(categorias.map((c) => [c.nombre.toUpperCase(), c]));
  const contadorOrden = new Map<string, number>();
  const filas: ItemBorrador[] = [];

  for (let n = 1; n < lineas.length; n++) {
    const bruto = lineas[n];
    if (!bruto.replace(/[,\s]/g, '')) continue;

    const campos = partirLinea(bruto);
    const leer = (col: string) => (campos[indice(col)] ?? '').trim();
    const numeroFila = n + 1;
    const erroresFila: ErrorFila[] = [];
    const err = (campo: string, mensaje: string) =>
      erroresFila.push({ fila: numeroFila, campo, mensaje });

    const categoria = porNombre.get(leer('categoria').toUpperCase());
    if (!categoria) err('categoria', `La categoría "${leer('categoria')}" no existe en la carta`);

    const subcategoria = leer('subcategoria');
    if (
      categoria &&
      subcategoria &&
      !categoria.subcategorias.some((s) => s.nombre.toUpperCase() === subcategoria.toUpperCase())
    ) {
      err('subcategoria', `"${subcategoria}" no es una subcategoría de ${categoria.nombre}`);
    }

    const nombre = leer('nombre');
    if (!nombre) err('nombre', 'El nombre del ítem no puede estar vacío');

    const { variantes, errores: erroresVariantes } = leerVariantes(leer('variantes'));
    for (const mensaje of erroresVariantes) err('variantes', mensaje);

    const crudoPrecio = leer('precio');
    const precio = crudoPrecio ? parsearPrecio(crudoPrecio) : variantes.length ? 0 : null;
    if (precio == null) {
      err(
        'precio',
        crudoPrecio
          ? `No se entiende el precio "${crudoPrecio}"`
          : 'Falta el precio (o cargá la columna variantes)',
      );
    }

    let piezas: number | undefined;
    if (leer('piezas')) {
      const valor = Number(leer('piezas'));
      if (!Number.isInteger(valor) || valor < 1 || valor > 200) {
        err('piezas', `"${leer('piezas')}" no es una cantidad de piezas válida`);
      } else piezas = valor;
    }

    const etiquetas: Etiqueta[] = [];
    for (const cruda of leer('etiquetas')
      .split(';')
      .map((m) => m.trim())
      .filter(Boolean)) {
      const valida = ETIQUETAS.find((e) => e.toLowerCase() === cruda.toLowerCase());
      if (!valida) err('etiquetas', `"${cruda}" no está en la lista de etiquetas permitidas`);
      else if (!etiquetas.includes(valida)) etiquetas.push(valida);
    }

    if (erroresFila.length) {
      errores.push(...erroresFila);
      continue;
    }

    const orden = (contadorOrden.get(categoria!.id) ?? 0) + 1;
    contadorOrden.set(categoria!.id, orden);

    filas.push({
      nombre,
      categoriaId: categoria!.id,
      orden,
      precio: precio!,
      variantes,
      subcategoria: subcategoria || undefined,
      piezas,
      etiquetas,
      descripcion: leer('descripcion') || undefined,
    });
  }

  return { filas, errores };
}

export const ENCABEZADO_PLANILLA = COLUMNAS.join(',');
