import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { leerCarta, leerCliente } from '@/datos/carta-repo';
import { haySupabaseConfigurado } from '@/datos/supabase-servidor';
import { formatearPrecio } from '@/logica/precio';
import { precioDesde } from '@/logica/variantes';

/** La vista previa del catálogo de un cliente al compartirlo por WhatsApp.
 *
 *  Es la pieza de marketing más repartida de todo el producto: el negocio no
 *  manda su catálogo a una lista de correo, lo pega en un chat. Lo que se ve
 *  ahí decide si lo abren.
 *
 *  Por eso muestra PRODUCTOS REALES del cliente y no un dibujo genérico: tres
 *  fotos con su nombre y su precio, sacadas de la misma carta. Un cartel que
 *  dice "catálogo online" no le dice nada a nadie; tres disfraces con precio,
 *  sí.
 *
 *  `satori`, el motor que dibuja esto, sólo entiende un subconjunto de CSS:
 *  nada de `grid`, y todo elemento con más de un hijo necesita `display:flex`
 *  explícito. */

export const alt = 'Catálogo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ cliente: string }> };

/** La foto, convertida a PNG y embebida.
 *
 *  `satori` —el motor que dibuja esta imagen— NO entiende WebP, y las fotos
 *  del catálogo son todas WebP: puestas directo salían recuadros en blanco.
 *  Así que se bajan, se convierten y se embeben como data URI.
 *
 *  Se convierte acá y no se guarda un tercer archivo por producto en Storage:
 *  serían 81 archivos más para algo que se genera cada tanto, cuando un
 *  scraper pide la vista previa, y que después queda cacheado. Si alguna
 *  falla devuelve null y la tarjeta se dibuja sin foto, que es mejor que una
 *  vista previa rota. */
async function comoPng(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(320, 196, { fit: 'contain', background: '#ffffff' })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Imagen({ params }: Props) {
  const { cliente: slug } = await params;

  const cliente = haySupabaseConfigurado() ? await leerCliente(slug) : null;
  const carta = cliente ? await leerCarta(cliente) : null;

  const nombre = cliente?.nombre ?? 'Catálogo';
  const fondo = cliente?.tema.colorFondo ?? '#f5ead8';
  const tinta = cliente?.tema.colorTexto ?? '#201e1d';
  const acento = cliente?.tema.colorAcento ?? '#c67139';

  // Tres productos con foto y precio: son los que hacen que la vista previa
  // muestre lo que se vende y no una marca abstracta.
  const elegidos = (carta?.items ?? [])
    .filter((i) => i.activo && !i.agotado && i.fotoUrl && precioDesde(i) > 0)
    .slice(0, 3);
  const destacados = await Promise.all(
    elegidos.map(async (item) => ({ item, png: await comoPng(item.fotoUrl) })),
  );

  const cantidad = (carta?.items ?? []).filter((i) => i.activo).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: fondo,
          color: tinta,
          padding: '46px 60px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: '-0.02em' }}>{nombre}</div>
          <div style={{ fontSize: 27, marginTop: 10, opacity: 0.75 }}>
            {cantidad > 0 ? `${cantidad} productos · pedí por WhatsApp` : 'Pedí por WhatsApp'}
          </div>
        </div>

        {destacados.length > 0 && (
          <div style={{ display: 'flex', gap: 24 }}>
            {destacados.map(({ item, png }) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: 320,
                  background: '#fff',
                  borderRadius: 22,
                  overflow: 'hidden',
                }}
              >
                {png ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={png} alt="" width={320} height={196} style={{ background: '#fff' }} />
                ) : (
                  <div style={{ display: 'flex', width: 320, height: 196, background: '#fff' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px 16px' }}>
                  <div style={{ fontSize: 22, color: '#2a1b45', lineHeight: 1.2 }}>
                    {item.nombre.length > 34 ? `${item.nombre.slice(0, 33)}…` : item.nombre}
                  </div>
                  <div style={{ fontSize: 27, fontWeight: 700, color: acento, marginTop: 6 }}>
                    {formatearPrecio(precioDesde(item))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: '#25d366',
              color: '#fff',
              fontSize: 25,
              fontWeight: 700,
              padding: '13px 28px',
              borderRadius: 9999,
            }}
          >
            Hacer el pedido por WhatsApp
          </div>
        </div>
      </div>
    ),
    size,
  );
}
