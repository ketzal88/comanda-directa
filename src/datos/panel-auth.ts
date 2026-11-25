import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/** Autenticación del panel: UNA clave compartida por cliente (no por
 *  usuario). Lo que protege: precios, stock y los pedidos internos (con
 *  nombre y teléfono del comprador). Lo obligatorio: la clave nunca viaja al
 *  navegador en claro, se compara su hash, y la cookie es httpOnly.
 *
 *  A diferencia de presencia-carta/sagrado-sushi-carta (un solo cliente, un
 *  hash en una env var), acá el hash vive en `clientes.clave_panel_hash`
 *  porque cada restaurante tiene su propia clave. La cookie se nombra por
 *  slug para que la sesión de un cliente no autorice el panel de otro.
 *
 *  La cookie NO es el hash de la base: es `<vencimiento>.<HMAC>` firmado con
 *  `PANEL_SESSION_SECRET`. Así un dump de `clientes` no alcanza para armar
 *  una sesión, la expiración la valida el server, y como el HMAC incluye el
 *  hash de la clave, cambiar la clave corta todas las sesiones abiertas. */

export const DURACION_SESION_S = 60 * 60 * 24 * 30;

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

/** Sin secreto (o uno corto) el panel no abre: mejor cerrado que firmado con
 *  algo adivinable. */
function secretoSesion(): string | null {
  const s = process.env.PANEL_SESSION_SECRET?.trim();
  return s && s.length >= 32 ? s : null;
}

function firmar(secreto: string, slug: string, vence: number, claveHash: string): string {
  return createHmac('sha256', secreto).update(`${slug}|${vence}|${claveHash}`).digest('hex');
}

/** El valor de la cookie de sesión, o null si falta `PANEL_SESSION_SECRET`. */
export function crearSesion(slug: string, claveHash: string, ahoraS = Math.floor(Date.now() / 1000)): string | null {
  const secreto = secretoSesion();
  if (!secreto) return null;
  const vence = ahoraS + DURACION_SESION_S;
  return `${vence}.${firmar(secreto, slug, vence, claveHash)}`;
}

export function esSesionValida(
  valor: string | undefined,
  slug: string,
  claveHash: string | null,
  ahoraS = Math.floor(Date.now() / 1000),
): boolean {
  const secreto = secretoSesion();
  if (!secreto || !claveHash || !valor) return false;
  const [venceTexto, firma, ...resto] = valor.split('.');
  const vence = Number(venceTexto);
  if (resto.length || !firma || !Number.isInteger(vence) || vence <= ahoraS) return false;
  return comparacionConstante(firma, firmar(secreto, slug, vence, claveHash));
}

/** ¿La request trae la cookie de sesión válida para ESTE cliente? */
export async function esPanelAutorizado(
  slug: string,
  claveHashEsperado: string | null,
): Promise<boolean> {
  const jar = await cookies();
  return esSesionValida(jar.get(nombreCookiePanel(slug))?.value, slug, claveHashEsperado);
}
