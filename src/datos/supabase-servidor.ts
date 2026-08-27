import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

let cliente: SupabaseClient | null = null;

export function haySupabaseConfigurado(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** El único cliente de Supabase de todo el motor: usa la SERVICE ROLE key y
 *  corre solo en el servidor (Server Components y rutas de API). El
 *  navegador nunca la ve — es el mismo motivo por el que Firestore en
 *  presencia-carta y sagrado-sushi-carta se escribe siempre con el Admin
 *  SDK y nunca desde el cliente. */
export function supabaseServidor(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno');
  }
  cliente = createClient(url, key, {
    auth: { persistSession: false },
    // Node 20 no trae WebSocket global en todos los entornos donde corre
    // este motor (scripts con tsx, algunos runtimes de Vercel); sin esto
    // supabase-js explota al construirse aunque nunca usemos Realtime.
    realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
  });
  return cliente;
}
