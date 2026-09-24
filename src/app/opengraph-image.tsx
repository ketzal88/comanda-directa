import { ImageResponse } from 'next/og';

/** La imagen que se ve cuando alguien comparte el link de la landing por
 *  WhatsApp. Next la genera desde acá y emite las etiquetas `og:image` solas.
 *
 *  Se dibuja en vez de guardarse como PNG para que el texto siga al copy: si
 *  mañana cambia el título, cambia acá y no hay que abrir un editor de
 *  imágenes ni acordarse de que existía un archivo aparte.
 *
 *  Ojo con `satori`, el motor que usa: sólo entiende un subconjunto de CSS.
 *  Nada de `grid`, y todo elemento con más de un hijo necesita `display:flex`
 *  explícito. Por eso el markup de acá abajo es más verboso que el de la
 *  página. */

export const alt = 'Hacé tu pedido — pedidos por WhatsApp con catálogo online';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PAPEL = '#f5ead8';
const TINTA = '#201e1d';
const TERRACOTA = '#c67139';
const OLIVA = '#7a8a5e';
const WHATSAPP = '#25d366';

export default async function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPEL,
          color: TINTA,
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* la mancha del encabezado de la landing, recortada por el borde */}
        <div
          style={{
            position: 'absolute',
            right: -170,
            top: -150,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: '#ffe1d0',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="58" height="58" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="15" fill={TERRACOTA} />
            <path
              fill="#fdfbf7"
              d="M13 14a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v38l-8-6-11 6-11-6-8 6V14Z"
            />
            <rect x="20" y="21" width="24" height="6" rx="3" fill={TINTA} />
            <rect x="20" y="32" width="15" height="6" rx="3" fill={TINTA} opacity="0.4" />
          </svg>
          <div style={{ fontSize: 38, fontWeight: 700 }}>Hacé tu pedido</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              maxWidth: 880,
            }}
          >
            Tus clientes piden por WhatsApp. Vos lo recibís ordenado.
          </div>
          <div style={{ fontSize: 31, marginTop: 24, maxWidth: 760, lineHeight: 1.35 }}>
            Catálogo con link y QR, el pedido completo en tu WhatsApp y el ticket impreso.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              background: WHATSAPP,
              color: '#fff',
              fontSize: 26,
              fontWeight: 700,
              padding: '16px 30px',
              borderRadius: 9999,
            }}
          >
            Sin comisión por pedido
          </div>
          <div
            style={{
              display: 'flex',
              background: OLIVA,
              color: PAPEL,
              fontSize: 26,
              fontWeight: 700,
              padding: '16px 30px',
              borderRadius: 9999,
            }}
          >
            Tu cliente no instala nada
          </div>
          <div style={{ display: 'flex', marginLeft: 'auto', fontSize: 26, opacity: 0.65 }}>
            hace-tu-pedido.site
          </div>
        </div>
      </div>
    ),
    size,
  );
}
