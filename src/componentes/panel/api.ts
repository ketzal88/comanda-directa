'use client';

/** Helpers de fetch para el panel: siempre a `/api/panel/[cliente]/...`,
 *  siempre con la cookie de sesión (`credentials: 'include'` no hace falta
 *  en same-origin, pero no está de más ser explícito). */

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const cuerpo = await res.json().catch(() => ({}));
  if (!res.ok) {
    const mensaje = cuerpo?.error ?? cuerpo?.errores?.[0]?.mensaje ?? `Error ${res.status}`;
    throw new Error(mensaje);
  }
  return cuerpo as T;
}

export function apiPanel(slug: string) {
  const base = `/api/panel/${slug}`;
  return {
    login: (clave: string) => pedir<{ ok: true }>(`${base}/login`, { method: 'POST', body: JSON.stringify({ clave }) }),
    logout: () => pedir<{ ok: true }>(`${base}/logout`, { method: 'POST' }),

    listarItems: () => pedir<{ items: import('@/logica/tipos').Item[] }>(`${base}/items`),
    crearItem: (datos: Record<string, unknown>) =>
      pedir<{ item: import('@/logica/tipos').Item }>(`${base}/items`, { method: 'POST', body: JSON.stringify(datos) }),
    editarItem: (id: string, cambios: Record<string, unknown>) =>
      pedir<{ item: import('@/logica/tipos').Item }>(`${base}/items/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),

    listarCategorias: () => pedir<{ categorias: import('@/logica/tipos').Categoria[] }>(`${base}/categorias`),
    crearCategoria: (datos: Record<string, unknown>) =>
      pedir<{ categoria: import('@/logica/tipos').Categoria }>(`${base}/categorias`, { method: 'POST', body: JSON.stringify(datos) }),
    editarCategoria: (id: string, cambios: Record<string, unknown>) =>
      pedir<{ categoria: import('@/logica/tipos').Categoria }>(`${base}/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),

    importar: (csv: string, commit: boolean) =>
      pedir<{
        filas: import('@/logica/planilla').ItemBorrador[];
        errores: import('@/logica/planilla').ErrorFila[];
        importadas: number;
      }>(`${base}/importar`, { method: 'POST', body: JSON.stringify({ csv, commit }) }),

    leerConfig: () =>
      pedir<{ configPedido: import('@/logica/tipos').ConfigPedido; cubiertoPorPersona: number; notas: string[] }>(
        `${base}/config`,
      ),
    guardarConfig: (cambios: Record<string, unknown>) =>
      pedir<{ ok: true }>(`${base}/config`, { method: 'PUT', body: JSON.stringify(cambios) }),
  };
}
