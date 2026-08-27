import { ETIQUETAS, type Etiqueta, type Item, type Variante } from './tipos';

/** Tope de medidas por ítem y de largo de la etiqueta de medida: la fila de
 *  la carta muestra una línea por medida en una pantalla de 390px. */
export const MAX_VARIANTES = 6;
export const MAX_ETIQUETA_VARIANTE = 16;

/** Campos de un ítem que el panel puede tocar — whitelist EXPLÍCITA. Todo lo
 *  que no esté acá se descarta con error, no en silencio. */
const CAMPOS_PERMITIDOS = [
  'nombre',
  'categoriaId',
  'subcategoria',
  'orden',
  'precio',
  'variantes',
  'agotado',
  'activo',
  'piezas',
  'etiquetas',
  'descripcion',
  'fotoUrl',
] as const;
type CampoPermitido = (typeof CAMPOS_PERMITIDOS)[number];

export type CambiosItem = Partial<Pick<Item, CampoPermitido>>;
export type ErrorCampo = { campo: string; mensaje: string };

/** Valida un body de creación/edición. Devuelve solo los campos permitidos y
 *  válidos, con TODOS los errores acumulados (no corta en el primero). */
export function validarCambiosItem(body: Record<string, unknown>): {
  cambios: CambiosItem;
  errores: ErrorCampo[];
} {
  const cambios: CambiosItem = {};
  const errores: ErrorCampo[] = [];
  const err = (campo: string, mensaje: string) => errores.push({ campo, mensaje });

  for (const campo of Object.keys(body)) {
    if (!(CAMPOS_PERMITIDOS as readonly string[]).includes(campo)) {
      err(campo, `El campo "${campo}" no se puede editar desde el panel`);
    }
  }

  const texto = (campo: CampoPermitido, obligatorioNoVacio = false) => {
    if (!(campo in body)) return;
    const v = body[campo];
    if (typeof v !== 'string') return err(campo, 'Tiene que ser texto');
    const limpio = v.trim();
    if (obligatorioNoVacio && !limpio) return err(campo, 'No puede quedar vacío');
    (cambios as Record<string, unknown>)[campo] = limpio;
  };
  const textoOpcionalBorrable = (campo: CampoPermitido) => {
    if (!(campo in body)) return;
    const v = body[campo];
    if (v === null || v === '') return void ((cambios as Record<string, unknown>)[campo] = undefined);
    if (typeof v !== 'string') return err(campo, 'Tiene que ser texto');
    (cambios as Record<string, unknown>)[campo] = v.trim();
  };
  const enteroEnRango = (campo: CampoPermitido, min: number, max: number, borrable: boolean) => {
    if (!(campo in body)) return;
    const v = body[campo];
    if (borrable && (v === null || v === '')) {
      (cambios as Record<string, unknown>)[campo] = undefined;
      return;
    }
    if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
      return err(campo, `Tiene que ser un número entero entre ${min} y ${max}`);
    }
    (cambios as Record<string, unknown>)[campo] = v;
  };
  const booleano = (campo: CampoPermitido) => {
    if (!(campo in body)) return;
    const v = body[campo];
    if (typeof v !== 'boolean') return err(campo, 'Tiene que ser verdadero o falso');
    (cambios as Record<string, unknown>)[campo] = v;
  };

  texto('nombre', true);
  texto('categoriaId', true);
  textoOpcionalBorrable('subcategoria');
  textoOpcionalBorrable('descripcion');
  enteroEnRango('orden', 1, 10_000, false);
  enteroEnRango('precio', 0, 100_000_000, false);
  enteroEnRango('piezas', 1, 200, true);
  booleano('agotado');
  booleano('activo');

  if ('fotoUrl' in body) {
    const v = body.fotoUrl;
    if (v === null || v === '') {
      cambios.fotoUrl = undefined;
    } else if (typeof v !== 'string') {
      err('fotoUrl', 'Tiene que ser texto');
    } else {
      const url = v.trim();
      if (!/^\/[\w./-]+$/.test(url) && !/^https:\/\/[^\s]+$/.test(url)) {
        err('fotoUrl', 'Tiene que ser una ruta del sitio (/fotos/…) o una URL https');
      } else {
        cambios.fotoUrl = url;
      }
    }
  }

  if ('variantes' in body) {
    const v = body.variantes;
    if (!Array.isArray(v)) {
      err('variantes', 'Tiene que ser una lista de medidas');
    } else if (v.length > MAX_VARIANTES) {
      err('variantes', `Hasta ${MAX_VARIANTES} medidas por ítem`);
    } else {
      const limpias: Variante[] = [];
      const vistas = new Set<string>();

      v.forEach((bruta, i) => {
        const fila = `medida ${i + 1}`;
        if (!bruta || typeof bruta !== 'object') return err('variantes', `${fila}: formato inválido`);

        const cruda = bruta as Record<string, unknown>;
        const etiqueta = typeof cruda.etiqueta === 'string' ? cruda.etiqueta.trim() : '';
        const precio = cruda.precio;

        if (!etiqueta) return err('variantes', `${fila}: falta el nombre (ej. "5 pz")`);
        if (etiqueta.length > MAX_ETIQUETA_VARIANTE) {
          return err('variantes', `${fila}: el nombre tiene que ser más corto`);
        }
        if (vistas.has(etiqueta.toLowerCase())) {
          return err('variantes', `"${etiqueta}" está dos veces`);
        }
        if (typeof precio !== 'number' || !Number.isInteger(precio) || precio < 0 || precio > 100_000_000) {
          return err('variantes', `${fila}: el precio tiene que ser un entero en pesos`);
        }

        vistas.add(etiqueta.toLowerCase());
        limpias.push({ etiqueta, precio });
      });

      if (!errores.some((e) => e.campo === 'variantes')) cambios.variantes = limpias;
    }
  }

  if ('etiquetas' in body) {
    const v = body.etiquetas;
    if (!Array.isArray(v) || v.some((e) => typeof e !== 'string')) {
      err('etiquetas', 'Tiene que ser una lista de etiquetas');
    } else {
      const invalidas = v.filter((e) => !(ETIQUETAS as readonly string[]).includes(e));
      if (invalidas.length) {
        err('etiquetas', `Etiquetas no permitidas: ${invalidas.join(', ')}`);
      } else {
        cambios.etiquetas = v as Etiqueta[];
      }
    }
  }

  return { cambios, errores };
}
