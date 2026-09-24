'use client';

import { useEffect, useRef } from 'react';
import { useHojaPedido } from './useHojaPedido';
import { CUBIERTO, claveLinea, nombreDeLinea } from '@/logica/pedido';
import { formatearPrecio } from '@/logica/precio';
import { ETIQUETA_MEDIO, ETIQUETA_MODALIDAD, MAX_TEXTO } from '@/logica/whatsapp';
import type { ConfigPedido, Item } from '@/logica/tipos';

type Props = {
  items: Item[];
  cubiertoPorPersona: number;
  configPedido: ConfigPedido;
  onCerrar: () => void;
};

const CLASE_PRIMARIO =
  'block w-full text-center bg-tinta text-papel text-[13px] tracking-[0.14em] uppercase py-3 active:opacity-70';
const CLASE_CAMPO =
  'mt-1 w-full border border-regla bg-papel px-3 py-2 text-[16px] outline-none focus:border-tinta';

/** El pedido armado, y su salida: WhatsApp. Dos pasos: primero QUÉ (ítems,
 *  modalidad, total), después PARA QUIÉN (nombre, mesa o dirección). La
 *  modalidad va en el primer paso porque cambia el total (el cubierto existe
 *  en el salón y no en un delivery). */
export function HojaPedido({ items, cubiertoPorPersona, configPedido, onCerrar }: Props) {
  const hoja = useRef<HTMLDivElement>(null);
  const {
    habilitadas,
    paso,
    setPaso,
    modalidad,
    elegirModalidad,
    campos: { nombre, setNombre, mesa, setMesa, direccion, setDireccion, telefono, setTelefono, notas, setNotas },
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
    ofreceCubierto,
    cubiertos,
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
    agregarCubierto,
  } = useHojaPedido({ items, cubiertoPorPersona, configPedido, onCerrar });

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

  // La propina se aclara solo donde hay mesa que atender: un cliente que
  // vende para llevar (o que no es gastronómico) no tiene por qué explicarle
  // al comprador que el total no la incluye.
  const hayMesas = habilitadas.includes('salon');
  const aclaracion = [
    cubiertos > 0
      ? 'Calculado sobre los precios de carta, cubierto incluido.'
      : 'Calculado sobre los precios de carta.',
    hayMesas ? 'No suma la propina.' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="fixed inset-0 z-30" role="presentation" onClick={onCerrar}>
      <div className="absolute inset-0 fondo-modal" aria-hidden="true" />
      <div
        ref={hoja}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 inset-x-0 mx-auto max-w-[430px] bg-papel border-t border-x border-tinta px-6 pt-8 pb-10 max-h-[88dvh] overflow-y-auto outline-none"
      >
        {paso === 'pedido' ? (
          <>
            <h2 className="titulo-categoria">TU PEDIDO</h2>
            <hr className="mt-2 border-t border-regla" />

            {avisos.length > 0 && (
              <div className="mt-4 space-y-2" aria-live="polite">
                {avisos.map((a) => (
                  <p key={a.tipo} className="metadata-item border-l border-tinta pl-3 text-tinta">
                    {a.texto}
                  </p>
                ))}
              </div>
            )}

            {habilitadas.length > 1 && (
              <fieldset className="mt-5">
                <legend className="metadata-item tracking-[0.1em] uppercase">¿Cómo lo querés?</legend>
                <div className="flex flex-wrap gap-2 mt-2">
                  {habilitadas.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => elegirModalidad(m)}
                      aria-pressed={modalidad === m}
                      className={`text-[13px] border px-3 py-2 ${
                        modalidad === m ? 'border-tinta bg-tinta text-papel' : 'border-regla'
                      }`}
                    >
                      {ETIQUETA_MODALIDAD[m]}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <ul>
              {pedidas.map((l) => (
                <li key={l.clave} className="py-4 border-b border-regla">
                  <div className="flex gap-3">
                    <span className="flex-1 min-w-0">
                      <span className="nombre-item block">{nombreDeLinea(l)}</span>
                      <span className="metadata-item block mt-[2px]">
                        {l.precioUnitario > 0
                          ? `${formatearPrecio(l.precioUnitario)} c/u`
                          : 'consultar precio'}
                      </span>
                    </span>
                    {l.precioUnitario > 0 && (
                      <span className="numero-item shrink-0 pt-[3px]">
                        {formatearPrecio(l.precioUnitario * l.cantidad)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-5 mt-3">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(l.clave, l.cantidad - 1)}
                        aria-label={`Sacar uno de ${nombreDeLinea(l)}`}
                        className="relative w-7 h-7 rounded-full border border-regla text-[15px] leading-none active:opacity-60 before:absolute before:-inset-[6px] before:content-['']"
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                      <span className="numero-item w-4 text-center" aria-live="polite">
                        {l.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(l.clave, l.cantidad + 1)}
                        aria-label={`Agregar otro ${nombreDeLinea(l)}`}
                        className="relative w-7 h-7 rounded-full border border-regla text-[15px] leading-none active:opacity-60 before:absolute before:-inset-[6px] before:content-['']"
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(l.clave)}
                      className="metadata-item underline underline-offset-2"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {ofreceCubierto && (
              <div className="py-4 border-b border-regla">
                <div className="flex gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="nombre-item block">Cubierto</span>
                    <span className="metadata-item block mt-[2px]">
                      {formatearPrecio(cubiertoPorPersona)} por persona
                      {cubiertos === 0 && ' · ¿cuántos son?'}
                    </span>
                  </span>
                  {cubiertos > 0 && (
                    <span className="numero-item shrink-0 pt-[3px]">
                      {formatearPrecio(cubiertoPorPersona * cubiertos)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(claveLinea(CUBIERTO), cubiertos - 1)}
                    disabled={cubiertos === 0}
                    aria-label="Sacar una persona del cubierto"
                    className="relative w-7 h-7 rounded-full border border-regla text-[15px] leading-none active:opacity-60 disabled:opacity-30 before:absolute before:-inset-[6px] before:content-['']"
                  >
                    <span aria-hidden="true">−</span>
                  </button>
                  <span className="numero-item w-4 text-center tabular-nums" aria-live="polite">
                    {cubiertos}
                  </span>
                  <button
                    type="button"
                    onClick={() => agregarCubierto(cubiertoPorPersona)}
                    aria-label="Agregar una persona al cubierto"
                    className="relative w-7 h-7 rounded-full border border-regla text-[15px] leading-none active:opacity-60 before:absolute before:-inset-[6px] before:content-['']"
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              </div>
            )}

            {cuenta.descuentoRetiro > 0 && (
              <div className="flex items-baseline justify-between mt-6" aria-live="polite">
                <p className="metadata-item">Descuento por retiro</p>
                <p className="numero-item">−{formatearPrecio(cuenta.descuentoRetiro)}</p>
              </div>
            )}
            {cuenta.envio > 0 && (
              <div
                className={`flex items-baseline justify-between ${cuenta.descuentoRetiro > 0 ? 'mt-2' : 'mt-6'}`}
                aria-live="polite"
              >
                <p className="metadata-item">Envío{zona ? ` · ${zona.nombre}` : ''}</p>
                <p className="numero-item">{formatearPrecio(cuenta.envio)}</p>
              </div>
            )}

            <div
              className={`flex items-baseline justify-between ${cuenta.descuentoRetiro > 0 || cuenta.envio > 0 ? 'mt-3' : 'mt-6'}`}
              aria-live="polite"
            >
              <p className="text-[14px] tracking-[0.12em] uppercase">Total</p>
              <p className="nombre-item text-[20px]">
                {cuenta.total > 0 ? formatearPrecio(cuenta.total) : '—'}
              </p>
            </div>
            <p className="metadata-item mt-2">{aclaracion}</p>

            {puedeEnviar ? (
              <>
                <button
                  type="button"
                  onClick={continuar}
                  className={`mt-7 ${CLASE_PRIMARIO}`}
                >
                  Continuar
                </button>
                {mostrarErrores && !modalidad && (
                  <p className="metadata-item mt-2 text-tinta" aria-live="assertive">
                    {/* Las opciones salen de las habilitadas, no de una lista
                        escrita a mano: nombrar el salón a un cliente que no
                        tiene mesas manda a buscar un botón que no existe. */}
                    Elegí una opción: {habilitadas.map((m) => ETIQUETA_MODALIDAD[m]).join(', ')}.
                  </p>
                )}
              </>
            ) : (
              <p className="metadata-item mt-6 border border-regla px-3 py-2">
                Los pedidos por WhatsApp están cerrados en este momento. Podés copiar el pedido y
                pasarlo en el local.
              </p>
            )}

            <div className="flex items-center justify-between mt-5">
              <button
                type="button"
                onClick={onCerrar}
                className="text-[13px] tracking-[0.14em] uppercase border-b border-tinta pb-[2px]"
              >
                Seguir mirando
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={copiar}
                  aria-live="polite"
                  className="metadata-item underline underline-offset-2"
                >
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  type="button"
                  onClick={() => (confirmandoVaciar ? vaciar() : setConfirmandoVaciar(true))}
                  className="metadata-item underline underline-offset-2"
                >
                  {confirmandoVaciar ? '¿Vaciar el pedido?' : 'Vaciar'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="titulo-categoria">ÚLTIMO PASO</h2>
            <hr className="mt-2 border-t border-regla" />
            <p className="metadata-item mt-3">
              {modalidad ? ETIQUETA_MODALIDAD[modalidad] : ''} ·{' '}
              {cuenta.total > 0 ? formatearPrecio(cuenta.total) : 'total a confirmar'}
            </p>

            <label className="block mt-5">
              <span className="metadata-item tracking-[0.1em] uppercase">Tu nombre</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={MAX_TEXTO}
                autoFocus
                autoComplete="name"
                className={CLASE_CAMPO}
              />
              {mostrarErrores && errorDe('nombre') && (
                <span className="metadata-item text-tinta block mt-1">{errorDe('nombre')}</span>
              )}
            </label>

            {modalidad === 'salon' && (
              <label className="block mt-5">
                <span className="metadata-item tracking-[0.1em] uppercase">Mesa</span>
                <input
                  value={mesa}
                  onChange={(e) => setMesa(e.target.value)}
                  maxLength={MAX_TEXTO}
                  inputMode="numeric"
                  className={CLASE_CAMPO}
                />
                {mostrarErrores && errorDe('mesa') && (
                  <span className="metadata-item text-tinta block mt-1">{errorDe('mesa')}</span>
                )}
              </label>
            )}

            {modalidad === 'delivery' && (
              <label className="block mt-5">
                <span className="metadata-item tracking-[0.1em] uppercase">Dirección de entrega</span>
                <input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  maxLength={MAX_TEXTO}
                  autoComplete="street-address"
                  placeholder="Calle, altura, piso y depto"
                  className={CLASE_CAMPO}
                />
                {mostrarErrores && errorDe('direccion') && (
                  <span className="metadata-item text-tinta block mt-1">{errorDe('direccion')}</span>
                )}
              </label>
            )}

            <label className="block mt-5">
              <span className="metadata-item tracking-[0.1em] uppercase">Teléfono (opcional)</span>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                maxLength={MAX_TEXTO}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Por si hay que llamarte"
                className={CLASE_CAMPO}
              />
              {mostrarErrores && errorDe('telefono') && (
                <span className="metadata-item text-tinta block mt-1">{errorDe('telefono')}</span>
              )}
            </label>

            <label className="block mt-5">
              <span className="metadata-item tracking-[0.1em] uppercase">Aclaraciones (opcional)</span>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                maxLength={MAX_TEXTO}
                rows={2}
                placeholder="Algo que tengan que saber antes de armar tu pedido"
                className={CLASE_CAMPO}
              />
            </label>

            {configPedido.mediosDePago.length > 0 && (
              <fieldset className="mt-5">
                <legend className="metadata-item tracking-[0.1em] uppercase">¿Cómo pagás?</legend>
                <div className="flex flex-wrap gap-2 mt-2">
                  {configPedido.mediosDePago.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMedioDePago(m)}
                      aria-pressed={medioDePago === m}
                      className={`text-[13px] border px-3 py-2 ${
                        medioDePago === m ? 'border-tinta bg-tinta text-papel' : 'border-regla'
                      }`}
                    >
                      {ETIQUETA_MEDIO[m]}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {modalidad === 'delivery' && configPedido.zonasEnvio.length > 0 && (
              <fieldset className="mt-5">
                <legend className="metadata-item tracking-[0.1em] uppercase">Zona de envío</legend>
                <div className="flex flex-wrap gap-2 mt-2">
                  {configPedido.zonasEnvio.map((z) => (
                    <button
                      key={z.nombre}
                      type="button"
                      onClick={() => setZona(z)}
                      aria-pressed={zona?.nombre === z.nombre}
                      className={`text-[13px] border px-3 py-2 ${
                        zona?.nombre === z.nombre ? 'border-tinta bg-tinta text-papel' : 'border-regla'
                      }`}
                    >
                      {z.nombre} · {formatearPrecio(z.precio)}
                    </button>
                  ))}
                </div>
                <p className="metadata-item mt-2">
                  El envío se suma al total. Si no ves tu zona, elegí la más cercana y aclaralo
                  arriba: el local la ajusta antes de despachar.
                </p>
              </fieldset>
            )}

            <details className="mt-5">
              <summary className="metadata-item underline underline-offset-2 cursor-pointer">
                Ver el mensaje que se envía
              </summary>
              <pre className="metadata-item whitespace-pre-wrap mt-2 border border-regla p-3">
                {mensaje}
              </pre>
            </details>

            <a
              href={errores.length ? '#' : (enlace ?? '#')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={alEnviar}
              className={`mt-6 ${CLASE_PRIMARIO}`}
            >
              Mandar por WhatsApp
            </a>

            {enviado ? (
              <div className="mt-4" aria-live="polite">
                <p className="metadata-item">
                  Se abrió WhatsApp con el pedido escrito. Falta que lo envíes en el chat: hasta que
                  no lo mandes, el restaurante no lo recibió.
                </p>
                <button
                  type="button"
                  onClick={() => vaciar()}
                  className="metadata-item underline underline-offset-2 mt-2"
                >
                  Vaciar el pedido
                </button>
              </div>
            ) : (
              <p className="metadata-item mt-3">
                Se abre WhatsApp con el pedido ya escrito. Lo revisás y lo mandás vos.
              </p>
            )}

            <button
              type="button"
              onClick={() => setPaso('pedido')}
              className="mt-6 text-[13px] tracking-[0.14em] uppercase border-b border-tinta pb-[2px]"
            >
              ← Editar el pedido
            </button>
          </>
        )}
      </div>
    </div>
  );
}
