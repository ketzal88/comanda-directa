import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/** Autenticación del panel: UNA clave compartida por cliente (no por
 *  usuario). Modelo de amenaza: lo peor posible es que alguien cambie el
 *  precio de un plato — no amerita cuentas ni 2FA. Lo que sí es obligatorio:
 *  la clave nunca viaja al navegador en claro, se compara su hash, y la
 *  cookie es httpOnly.
 *
 *  A diferencia de presencia-carta/sagrado-sushi-carta (un solo cliente, un
 *  hash en una env var), acá el hash vive en `clientes.clave_panel_hash`
 *  porque cada restaurante tiene su propia clave. La cookie se nombra por
 *  slug para que la sesión de un cliente no autorice el panel de otro. */

export function nombreCookiePanel(slug: string): string {
  return `panel_${slug}`;
}

export function hashClave(clave: string): string {
  return createHash('sha256').update(clave, 'utf8').digest('hex');
}

function comparacionConstante(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function esClaveValida(clave: string, claveHashEsperado: string | null): boolean {
  if (!claveHashEsperado) return false; // sin clave configurada, el panel no abre
  return comparacionConstante(hashClave(clave), claveHashEsperado);
}

/** ¿La request trae la cookie de sesión válida para ESTE cliente? */
export async function esPanelAutorizado(
  slug: string,
  claveHashEsperado: string | null,
): Promise<boolean> {
  if (!claveHashEsperado) return false;
  const jar = await cookies();
  const valor = jar.get(nombreCookiePanel(slug))?.value;
  return Boolean(valor && comparacionConstante(valor, claveHashEsperado));
}
