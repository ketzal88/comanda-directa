import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearSesion, DURACION_SESION_S, esSesionValida, hashClave } from '../src/datos/panel-auth';

const hash = hashClave('una-clave');
const ahora = 1_800_000_000;

describe('sesión del panel', () => {
  beforeEach(() => {
    process.env.PANEL_SESSION_SECRET = 'x'.repeat(40);
  });
  afterEach(() => {
    delete process.env.PANEL_SESSION_SECRET;
  });

  it('la cookie no es el hash y valida para el mismo slug', () => {
    const s = crearSesion('demo', hash, ahora)!;
    expect(s).not.toContain(hash);
    expect(esSesionValida(s, 'demo', hash, ahora)).toBe(true);
  });

  it('no sirve para otro cliente, otra clave, vencida o adulterada', () => {
    const s = crearSesion('demo', hash, ahora)!;
    expect(esSesionValida(s, 'otro', hash, ahora)).toBe(false);
    expect(esSesionValida(s, 'demo', hashClave('nueva'), ahora)).toBe(false);
    expect(esSesionValida(s, 'demo', hash, ahora + DURACION_SESION_S)).toBe(false);
    const [vence, firma] = s.split('.');
    expect(esSesionValida(`${Number(vence) + 999}.${firma}`, 'demo', hash, ahora)).toBe(false);
    expect(esSesionValida(hash, 'demo', hash, ahora)).toBe(false);
  });

  it('sin secreto (o corto) el panel no abre', () => {
    const s = crearSesion('demo', hash, ahora)!;
    process.env.PANEL_SESSION_SECRET = 'corto';
    expect(crearSesion('demo', hash, ahora)).toBeNull();
    expect(esSesionValida(s, 'demo', hash, ahora)).toBe(false);
  });
});
