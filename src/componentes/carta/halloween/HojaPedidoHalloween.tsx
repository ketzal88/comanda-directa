'use client';

import { useEffect, useRef } from 'react';
import { useHojaPedido } from '@/componentes/pedido/useHojaPedido';
import { nombreDeLinea } from '@/logica/pedido';
import { formatearPrecio } from '@/logica/precio';
import { ETIQUETA_MEDIO, ETIQUETA_MODALIDAD, MAX_TEXTO } from '@/logica/whatsapp';
import type { ConfigPedido, Item } from '@/logica/tipos';

type Props = { items: Item[]; configPedido: ConfigPedido; onCerrar: () => void };

const CAMPO =
  'mt-1.5 w-full rounded-[14px] border-2 px-3.5 py-2.5 text-[16px] outline-none bg-white';
const ROTULO = 'halloween-mano text-[19px] leading-none';

/** La hoja del pedido con el diseño de la campaña.
 *
 *  Es la misma hoja del motor con otra piel: toda la lógica —los dos pasos,
 *  las validaciones, el total con envío y el armado del mensaje— vive en
 *  `useHojaPedido()`, que comparte con la Clásica. Acá abajo no hay ni una
 *  regla de negocio; si aparece una, va al hook.
 *
 *  Se separó porque la hoja del motor sigue el sistema visual de las cartas
 *  de restaurante (bordes rectos, versalitas, líneas finas) y al lado de este
 *  catálogo se notaba que venía de otro lado. */
export function HojaPedidoHalloween({ items, configPedido, onCerrar }: Props) {
  const hoja = useRef<HTMLDivElement>(null);
  const {
    habilitadas,
    paso,
    setPaso,
    modalidad,
    elegirModalidad,
    campos: { nombre, setNombre, direccion, setDireccion, telefono, setTelefono, notas, setNotas },
    medioDePago,
    setMedioDePago,
    zona,
    setZona,
    mostrarErrores,
    enviado,
    confirmandoVaciar,
    setConfirmandoVaciar,
    copiado,
    copiar,
    avisos,
    pedidas,
    cuenta,
    errores,
    errorDe,
    mensaje,
    enlace,
    puedeEnviar,
    alEnviar,
    continuar,
    cambiarCantidad,
    quitar,
    vaciar,
  } = useHojaPedido({ items, cubiertoPorPersona: 0, configPedido, onCerrar });

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    hoja.current?.focus();
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [onCerrar]);

  const borde = { borderColor: 'rgb(42 27 69 / 0.18)' };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      role="presentation"
      onClick={onCerrar}
      style={{ background: 'rgb(20 12 34 / 0.55)' }}
    >
      <div
        ref={hoja}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="hw-rise flex w-full max-w-[560px] max-h-[88dvh] flex-col overflow-hidden rounded-t-[26px] outline-none"
        style={{ background: 'var(--h-crema)' }}
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-2.5">
          <div className="halloween-mano text-[30px] leading-none">
            {paso === 'pedido' ? 'Tu pedido' : 'Último paso'}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full border-0 text-[20px]"
            style={{ background: '#ede4d6', color: 'var(--h-tinta)' }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="halloween-sin-barra flex-1 overflow-y-auto px-5 pb-3">
          {paso === 'pedido' ? (
            <>
              {avisos.length > 0 && (
                <div className="flex flex-col gap-2 mb-3" aria-live="polite">
                  {avisos.map((a) => (
                    <p
                      key={a.tipo}
                      className="rounded-[14px] px-3.5 py-2.5 text-[14px] font-medium"
                      style={{ background: 'var(--h-durazno)', color: 'var(--h-tinta)' }}
                    >
                      {a.texto}
                    </p>
                  ))}
                </div>
              )}

              {habilitadas.length > 1 && (
                <fieldset className="mb-4">
                  <legend className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                    ¿Cómo lo querés?
                  </legend>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {habilitadas.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => elegirModalidad(m)}
                        aria-pressed={modalidad === m}
                        className="rounded-full border-2 px-4 py-2 text-[14px] font-semibold"
                        style={{
                          borderColor: 'var(--h-tinta)',
                          background: modalidad === m ? 'var(--h-tinta)' : 'transparent',
                          color: modalidad === m ? 'var(--h-crema)' : 'var(--h-tinta)',
                        }}
                      >
                        {ETIQUETA_MODALIDAD[m]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="flex flex-col gap-2.5">
                {pedidas.map((l) => (
                  <div
                    key={l.clave}
                    className="flex items-center gap-3 rounded-[14px] bg-white p-2 pl-3.5"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14.5px] font-medium leading-[1.2]">
                        {nombreDeLinea(l)}
                      </span>
                      <span className="block mt-0.5 text-[14px]" style={{ color: 'var(--h-tinta-suave)' }}>
                        {l.precioUnitario > 0
                          ? `${l.cantidad} × ${formatearPrecio(l.precioUnitario)}`
                          : 'Consultar precio'}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(l.clave, l.cantidad - 1)}
                        aria-label={`Sacar uno de ${nombreDeLinea(l)}`}
                        className="w-8 h-8 rounded-full border-2 bg-transparent text-[17px] font-bold leading-none"
                        style={{ borderColor: 'var(--h-tinta)', color: 'var(--h-tinta)' }}
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                      <span className="min-w-[18px] text-center font-bold tabular-nums">
                        {l.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(l.clave, l.cantidad + 1)}
                        aria-label={`Agregar otro ${nombreDeLinea(l)}`}
                        className="w-8 h-8 rounded-full border-0 text-[17px] font-bold leading-none text-white"
                        style={{ background: 'var(--h-naranja)' }}
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quitar(l.clave)}
                        aria-label={`Quitar ${nombreDeLinea(l)} del pedido`}
                        className="ml-1 w-8 h-8 rounded-full border-0 text-[15px]"
                        style={{ background: 'var(--h-crema)', color: 'var(--h-tinta-suave)' }}
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="halloween-mano text-[19px] mb-3" style={{ color: 'var(--h-tinta-suave)' }}>
                {modalidad ? ETIQUETA_MODALIDAD[modalidad] : ''} ·{' '}
                {cuenta.total > 0 ? formatearPrecio(cuenta.total) : 'total a confirmar'}
              </p>

              <label className="block">
                <span className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                  Tu nombre
                </span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={MAX_TEXTO}
                  autoFocus
                  autoComplete="name"
                  className={CAMPO}
                  style={borde}
                />
                {mostrarErrores && errorDe('nombre') && (
                  <span className="block mt-1 text-[13px] font-semibold" style={{ color: 'var(--h-naranja-hondo)' }}>
                    {errorDe('nombre')}
                  </span>
                )}
              </label>

              {modalidad === 'delivery' && (
                <label className="block mt-4">
                  <span className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                    Dirección de entrega
                  </span>
                  <input
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    maxLength={MAX_TEXTO}
                    autoComplete="street-address"
                    placeholder="Calle, altura, piso y depto"
                    className={CAMPO}
                    style={borde}
                  />
                  {mostrarErrores && errorDe('direccion') && (
                    <span className="block mt-1 text-[13px] font-semibold" style={{ color: 'var(--h-naranja-hondo)' }}>
                      {errorDe('direccion')}
                    </span>
                  )}
                </label>
              )}

              <label className="block mt-4">
                <span className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                  Teléfono (opcional)
                </span>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  maxLength={MAX_TEXTO}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Por si hay que llamarte"
                  className={CAMPO}
                  style={borde}
                />
                {mostrarErrores && errorDe('telefono') && (
                  <span className="block mt-1 text-[13px] font-semibold" style={{ color: 'var(--h-naranja-hondo)' }}>
                    {errorDe('telefono')}
                  </span>
                )}
              </label>

              {modalidad === 'delivery' && configPedido.zonasEnvio.length > 0 && (
                <fieldset className="mt-4">
                  <legend className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                    Zona de envío
                  </legend>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {configPedido.zonasEnvio.map((z) => (
                      <button
                        key={z.nombre}
                        type="button"
                        onClick={() => setZona(z)}
                        aria-pressed={zona?.nombre === z.nombre}
                        className="rounded-full border-2 px-4 py-2 text-[14px] font-semibold"
                        style={{
                          borderColor: 'var(--h-tinta)',
                          background: zona?.nombre === z.nombre ? 'var(--h-tinta)' : 'transparent',
                          color: zona?.nombre === z.nombre ? 'var(--h-crema)' : 'var(--h-tinta)',
                        }}
                      >
                        {z.nombre} · {z.precio > 0 ? formatearPrecio(z.precio) : 'sin cargo'}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {configPedido.mediosDePago.length > 0 && (
                <fieldset className="mt-4">
                  <legend className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                    ¿Cómo pagás?
                  </legend>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {configPedido.mediosDePago.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMedioDePago(m)}
                        aria-pressed={medioDePago === m}
                        className="rounded-full border-2 px-4 py-2 text-[14px] font-semibold"
                        style={{
                          borderColor: 'var(--h-tinta)',
                          background: medioDePago === m ? 'var(--h-tinta)' : 'transparent',
                          color: medioDePago === m ? 'var(--h-crema)' : 'var(--h-tinta)',
                        }}
                      >
                        {ETIQUETA_MEDIO[m]}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <label className="block mt-4">
                <span className={ROTULO} style={{ color: 'var(--h-tinta-suave)' }}>
                  Aclaraciones (opcional)
                </span>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  maxLength={MAX_TEXTO}
                  rows={2}
                  placeholder="Algo que tengan que saber antes de armar tu pedido"
                  className={CAMPO}
                  style={borde}
                />
              </label>

              <details className="mt-4">
                <summary className="text-[13.5px] underline underline-offset-2 cursor-pointer" style={{ color: 'var(--h-tinta-suave)' }}>
                  Ver el mensaje que se envía
                </summary>
                <pre
                  className="mt-2 whitespace-pre-wrap rounded-[14px] bg-white p-3 text-[13px] leading-[1.45]"
                  style={{ fontFamily: 'inherit' }}
                >
                  {mensaje}
                </pre>
              </details>

              <button
                type="button"
                onClick={() => setPaso('pedido')}
                className="mt-4 text-[13.5px] underline underline-offset-2"
                style={{ color: 'var(--h-tinta-suave)' }}
              >
                ← Editar el pedido
              </button>
            </>
          )}
        </div>

        <div
          className="flex flex-col gap-3 border-t border-dashed px-5 pt-3.5"
          style={{ ...borde, paddingBottom: 'calc(18px + env(safe-area-inset-bottom))' }}
        >
          {cuenta.descuentoRetiro > 0 && (
            <div className="flex items-baseline justify-between text-[14px]">
              <span style={{ color: 'var(--h-tinta-suave)' }}>Descuento por retiro</span>
              <span className="font-bold">−{formatearPrecio(cuenta.descuentoRetiro)}</span>
            </div>
          )}
          {cuenta.envio > 0 && (
            <div className="flex items-baseline justify-between text-[14px]">
              <span style={{ color: 'var(--h-tinta-suave)' }}>
                Envío{zona ? ` · ${zona.nombre}` : ''}
              </span>
              <span className="font-bold">{formatearPrecio(cuenta.envio)}</span>
            </div>
          )}

          <div className="flex items-baseline justify-between" aria-live="polite">
            <span className="halloween-mano text-[21px]">
              {cuenta.hayLineasSinPrecio ? 'Total parcial' : 'Total estimado'}
            </span>
            <span className="text-[22px] font-bold">
              {cuenta.total > 0 ? formatearPrecio(cuenta.total) : '—'}
              {cuenta.hayLineasSinPrecio && ' +'}
            </span>
          </div>

          {paso === 'pedido' ? (
            <>
              {puedeEnviar ? (
                <button
                  type="button"
                  onClick={continuar}
                  className="flex h-13 items-center justify-center rounded-full border-0 py-3.5 text-[17px] font-semibold text-white"
                  style={{ background: 'var(--h-naranja)' }}
                >
                  Continuar
                </button>
              ) : (
                <p className="rounded-[14px] bg-white px-3.5 py-2.5 text-[13.5px]">
                  Los pedidos por WhatsApp están cerrados en este momento. Podés copiar el pedido y
                  pasarlo en el local.
                </p>
              )}
              {mostrarErrores && !modalidad && (
                <p className="text-[13px] font-semibold" aria-live="assertive" style={{ color: 'var(--h-naranja-hondo)' }}>
                  Elegí una opción: {habilitadas.map((m) => ETIQUETA_MODALIDAD[m]).join(', ')}.
                </p>
              )}

              <div className="flex items-center justify-between text-[13.5px]">
                <button
                  type="button"
                  onClick={onCerrar}
                  className="underline underline-offset-2"
                  style={{ color: 'var(--h-tinta-suave)' }}
                >
                  Seguir mirando
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={copiar}
                    aria-live="polite"
                    className="underline underline-offset-2"
                    style={{ color: 'var(--h-tinta-suave)' }}
                  >
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => (confirmandoVaciar ? vaciar() : setConfirmandoVaciar(true))}
                    className="underline underline-offset-2"
                    style={{ color: 'var(--h-tinta-suave)' }}
                  >
                    {confirmandoVaciar ? '¿Vaciar el pedido?' : 'Vaciar'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <a
                href={errores.length ? '#' : (enlace ?? '#')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={alEnviar}
                className="flex h-[52px] items-center justify-center rounded-full text-[17px] font-semibold no-underline"
                style={{ background: 'var(--h-whatsapp)', color: 'var(--h-whatsapp-tinta)' }}
              >
                Enviar pedido por WhatsApp
              </a>

              {enviado ? (
                <div className="text-center text-[12.5px]" aria-live="polite" style={{ color: 'var(--h-tinta-suave)' }}>
                  <p>
                    Se abrió WhatsApp con el pedido escrito. Falta que lo envíes en el chat: hasta
                    que no lo mandes, no lo recibimos.
                  </p>
                  <button
                    type="button"
                    onClick={() => vaciar()}
                    className="mt-1 underline underline-offset-2"
                  >
                    Vaciar el pedido
                  </button>
                </div>
              ) : (
                <p className="text-center text-[12.5px]" style={{ color: 'var(--h-tinta-suave)' }}>
                  Te confirmamos stock, envío y forma de pago.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
