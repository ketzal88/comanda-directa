import type { Descuento, ZonaEnvio } from './tipos';

/** Número finito en [0, max], llevado a entero (los inputs del panel mandan
 *  `Number(texto)`, que puede traer decimales). null si no es un número. */
const entero = (v: unknown, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? Math.floor(v) : null;

/** Zonas de envío del panel: nombre no vacío y precio entero ≥ 0 o `null`
 *  ("a convenir", ver `ZonaEnvio`). Devuelve null si alguna no cumple, así el
 *  PUT rechaza todo en vez de guardar una lista a medias. */
export function validarZonas(crudo: unknown): ZonaEnvio[] | null {
  if (!Array.isArray(crudo) || crudo.length > 100) return null;
  const zonas: ZonaEnvio[] = [];
  for (const z of crudo) {
    const { nombre, precio } = (z ?? {}) as Record<string, unknown>;
    if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 100) return null;
    const p = precio === null ? null : entero(precio, 10_000_000);
    if (precio !== null && p === null) return null;
    zonas.push({ nombre: nombre.trim(), precio: p });
  }
  return zonas;
}

export function validarDescuento(crudo: unknown): Descuento | null {
  const { tipo, valor } = (crudo ?? {}) as Record<string, unknown>;
  if (tipo === 'ninguno') return { tipo };
  const v = entero(valor, tipo === 'porcentaje' ? 100 : 10_000_000);
  if ((tipo === 'porcentaje' || tipo === 'monto') && v !== null) return { tipo, valor: v };
  return null;
}

export function validarNotas(crudo: unknown): string[] | null {
  if (!Array.isArray(crudo) || crudo.length > 50) return null;
  if (!crudo.every((n) => typeof n === 'string' && n.length <= 500)) return null;
  return crudo.map((n: string) => n.trim()).filter(Boolean);
}

export const validarCubierto = (v: unknown): number | null => entero(v, 1_000_000);
