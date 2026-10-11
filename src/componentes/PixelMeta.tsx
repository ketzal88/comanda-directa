'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { EventoMeta } from '@/logica/pixel-meta';

type Fbq = ((accion: string, ...args: unknown[]) => void) & {
  queue?: unknown[][];
  callMethod?: (...args: unknown[]) => void;
  push?: Fbq;
  loaded?: boolean;
  version?: string;
};
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** El slug del cliente con pixel que está montado. Null = no hay pixel en
 *  esta página, y los eventos no van a ningún lado. */
let slugActivo: string | null = null;

function cookie(nombre: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${nombre}=`))
    ?.slice(nombre.length + 1);
}

/** `_fbc` lo escribe el pixel cuando la visita viene de un anuncio. Si el
 *  pixel no cargó (bloqueador), se arma desde el `fbclid` de la URL con el
 *  formato que pide Meta, para que la CAPI no pierda el click. */
function fbc(): string | undefined {
  const guardada = cookie('_fbc');
  if (guardada) return guardada;
  const fbclid = new URLSearchParams(location.search).get('fbclid');
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

/** Manda un evento estándar al pixel y, con el mismo id, al servidor para la
 *  Conversions API (ver `api/meta/[cliente]`). Sin pixel en la página no
 *  hace nada: los eventos se disparan desde el motor compartido y no pueden
 *  romper la carta de nadie. */
export function eventoMeta(nombre: EventoMeta, datos?: object, eventId?: string) {
  if (typeof window === 'undefined' || !slugActivo) return;
  const id = eventId ?? crypto.randomUUID();
  window.fbq?.('track', nombre, datos ?? {}, { eventID: id });

  const cuerpo = JSON.stringify({
    evento: nombre,
    eventId: id,
    url: location.href,
    datos,
    fbp: cookie('_fbp'),
    fbc: fbc(),
  });
  // sendBeacon sobrevive a que la pestaña se vaya (el Purchase abre
  // WhatsApp); fetch con keepalive queda de respaldo.
  const enviado = navigator.sendBeacon?.(`/api/meta/${slugActivo}`, new Blob([cuerpo], { type: 'application/json' }));
  if (!enviado) {
    fetch(`/api/meta/${slugActivo}`, { method: 'POST', body: cuerpo, keepalive: true }).catch(() => {});
  }
}

/** El código base de Meta: deja `fbq` encolando de inmediato y baja el
 *  script de verdad en segundo plano. Se instala desde acá, y no con un
 *  `<Script>`, para que el PageView de la primera carga pueda salir por
 *  `eventoMeta` con su id, igual que todos los demás. */
function instalarPixel(id: string) {
  if (window.fbq) return;
  const fbq: Fbq = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  };
  Object.assign(fbq, { queue: [], loaded: true, version: '2.0', push: fbq });
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  fbq('init', id);
}

/** El pixel de Meta del cliente, con su PageView.
 *
 *  Va en el layout de `[cliente]`, así que también está montado en el panel:
 *  ahí no se carga, porque el que entra al panel es el local, no un
 *  comprador, y ensuciaría las audiencias. */
export function PixelMeta({ id, slug }: { id: string; slug: string }) {
  const ruta = usePathname();
  const enPanel = /\/panel(\/|$)/.test(ruta);
  const ultima = useRef<string | null>(null);

  useEffect(() => {
    if (enPanel) {
      slugActivo = null;
      return;
    }
    instalarPixel(id);
    slugActivo = slug;
    // Un PageView por ruta: el StrictMode de desarrollo corre este efecto
    // dos veces y no tiene que contar dos visitas.
    if (ultima.current === ruta) return;
    ultima.current = ruta;
    eventoMeta('PageView');
  }, [id, slug, ruta, enPanel]);

  return null;
}
