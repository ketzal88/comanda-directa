'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPanel } from './api';

export function PanelLogin({ slug }: { slug: string }) {
  const router = useRouter();
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await apiPanel(slug).login(clave);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-5 text-white">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-2xl bg-white/5 p-8">
        <h1 className="text-xl font-semibold">Panel de {slug}</h1>
        <label className="mt-6 block text-sm font-medium text-neutral-300">
          Clave del panel
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoFocus
            className="mt-2 w-full rounded-lg border border-white/15 bg-neutral-900 px-3 py-2.5 outline-none focus:border-orange-500"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={enviando || !clave}
          className="mt-6 w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-neutral-950 disabled:opacity-40"
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
