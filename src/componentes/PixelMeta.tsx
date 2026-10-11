'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

type Fbq = (accion: string, ...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Manda un evento estándar al pixel. Sin pixel cargado (el cliente no
 *  tiene, o lo bloqueó un adblock) no hace nada: los eventos se disparan
 *  desde el motor compartido y no pueden romper la carta de nadie. */
export function eventoMeta(nombre: string, datos?: object, eventID?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', nombre, datos ?? {}, eventID ? { eventID } : undefined);
}

/** El pixel de Meta del cliente, con su PageView.
 *
 *  Va en el layout de `[cliente]`, así que también está montado en el panel:
 *  ahí no se carga, porque el que entra al panel es el local, no un
 *  comprador, y ensuciaría las audiencias. */
export function PixelMeta({ id }: { id: string }) {
  const ruta = usePathname();
  const enPanel = /\/panel(\/|$)/.test(ruta);

  // El PageView de la carga inicial lo manda el script; éste cubre las
  // navegaciones sin recarga (de la carta a una selección y vuelta). La
  // primera pasada se saltea para no contar dos veces la misma visita.
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (!enPanel) eventoMeta('PageView');
  }, [ruta, enPanel]);

  if (enPanel) return null;

  return (
    <Script id="pixel-meta" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');fbq('track','PageView');`}
    </Script>
  );
}
