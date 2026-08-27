'use client';

import { useState } from 'react';
import { apiPanel } from './api';
import { ETIQUETA_MEDIO, ETIQUETA_MODALIDAD } from '@/logica/whatsapp';
import { MEDIOS_DE_PAGO, MODALIDADES } from '@/logica/tipos';
import type { ConfigPedido, ZonaEnvio } from '@/logica/tipos';

type Props = { slug: string; configPedido: ConfigPedido; cubiertoPorPersona: number; notas: string[] };

const CLASE_CAMPO = 'mt-1.5 w-full rounded-lg border border-white/15 bg-neutral-900 px-3 py-2 outline-none focus:border-orange-500';
const CLASE_LABEL = 'block text-sm font-medium text-neutral-300';

/** Configuración de pedido del cliente: número de WhatsApp, qué modalidades
 *  están abiertas, medios de pago, zonas de envío, descuento por retiro y el
 *  cubierto del salón. Todo lo que hoy vive en `config/pedido` y
 *  `config/carta` de sagrado-sushi-carta, en una sola pantalla. */
export function PanelPedido({ slug, configPedido, cubiertoPorPersona, notas }: Props) {
  const [whatsapp, setWhatsapp] = useState(configPedido.whatsapp);
  const [modalidades, setModalidades] = useState(configPedido.modalidades);
  const [mediosDePago, setMediosDePago] = useState(configPedido.mediosDePago);
  const [zonasEnvio, setZonasEnvio] = useState<ZonaEnvio[]>(configPedido.zonasEnvio);
  const [descuentoTipo, setDescuentoTipo] = useState(configPedido.descuentoRetiro.tipo);
  const [descuentoValor, setDescuentoValor] = useState(
    configPedido.descuentoRetiro.tipo === 'ninguno' ? 0 : configPedido.descuentoRetiro.valor,
  );
  const [cubierto, setCubierto] = useState(cubiertoPorPersona);
  const [notasTexto, setNotasTexto] = useState(notas.join('\n'));
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const alternar = <T,>(lista: T[], setLista: (v: T[]) => void, valor: T) =>
    setLista(lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);

  const agregarZona = () => setZonasEnvio((prev) => [...prev, { nombre: '', precio: 0 }]);
  const cambiarZona = (i: number, campo: keyof ZonaEnvio, valor: string) =>
    setZonasEnvio((prev) =>
      prev.map((z, idx) => (idx === i ? { ...z, [campo]: campo === 'precio' ? Number(valor) || 0 : valor } : z)),
    );
  const sacarZona = (i: number) => setZonasEnvio((prev) => prev.filter((_, idx) => idx !== i));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    await apiPanel(slug).guardarConfig({
      whatsapp: whatsapp.trim(),
      modalidades,
      mediosDePago,
      zonasEnvio: zonasEnvio.filter((z) => z.nombre.trim()),
      descuentoRetiro: descuentoTipo === 'ninguno' ? { tipo: 'ninguno' } : { tipo: descuentoTipo, valor: descuentoValor },
      cubiertoPorPersona: cubierto,
      notas: notasTexto.split('\n').map((n) => n.trim()).filter(Boolean),
    });
    setGuardando(false);
    setGuardado(true);
  };

  return (
    <form onSubmit={guardar} className="grid max-w-xl gap-6">
      <h1 className="text-2xl font-semibold">Pedido</h1>

      <label className={CLASE_LABEL}>
        Número de WhatsApp (con código de país, solo dígitos)
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="5491122223333"
          className={CLASE_CAMPO}
        />
      </label>

      <div>
        <p className={CLASE_LABEL}>Modalidades abiertas hoy</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODALIDADES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => alternar(modalidades, setModalidades, m)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                modalidades.includes(m) ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'border-white/15 text-neutral-300'
              }`}
            >
              {ETIQUETA_MODALIDAD[m]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={CLASE_LABEL}>Medios de pago que se le ofrecen al comensal</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEDIOS_DE_PAGO.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => alternar(mediosDePago, setMediosDePago, m)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                mediosDePago.includes(m) ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'border-white/15 text-neutral-300'
              }`}
            >
              {ETIQUETA_MEDIO[m]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={CLASE_LABEL}>Zonas de envío (delivery)</p>
        <div className="mt-2 grid gap-2">
          {zonasEnvio.map((z, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Zona"
                value={z.nombre}
                onChange={(e) => cambiarZona(i, 'nombre', e.target.value)}
                className={CLASE_CAMPO}
              />
              <input
                type="number"
                placeholder="Precio"
                value={z.precio}
                onChange={(e) => cambiarZona(i, 'precio', e.target.value)}
                className={CLASE_CAMPO}
              />
              <button type="button" onClick={() => sacarZona(i)} className="px-3 text-neutral-400 hover:text-white">
                Sacar
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarZona} className="justify-self-start text-sm text-orange-400 hover:underline">
            + Agregar zona
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className={CLASE_LABEL}>
          Descuento por retiro
          <select
            value={descuentoTipo}
            onChange={(e) => setDescuentoTipo(e.target.value as typeof descuentoTipo)}
            className={CLASE_CAMPO}
          >
            <option value="ninguno">Ninguno</option>
            <option value="porcentaje">Porcentaje</option>
            <option value="monto">Monto fijo</option>
          </select>
        </label>
        {descuentoTipo !== 'ninguno' && (
          <label className={CLASE_LABEL}>
            Valor
            <input
              type="number"
              value={descuentoValor}
              onChange={(e) => setDescuentoValor(Number(e.target.value) || 0)}
              className={CLASE_CAMPO}
            />
          </label>
        )}
      </div>

      <label className={CLASE_LABEL}>
        Cubierto por persona (solo en el salón; 0 = no se cobra)
        <input
          type="number"
          value={cubierto}
          onChange={(e) => setCubierto(Number(e.target.value) || 0)}
          className={CLASE_CAMPO}
        />
      </label>

      <label className={CLASE_LABEL}>
        Notas al pie de la carta (una por línea)
        <textarea value={notasTexto} onChange={(e) => setNotasTexto(e.target.value)} rows={3} className={CLASE_CAMPO} />
      </label>

      <button
        type="submit"
        disabled={guardando}
        className="justify-self-start rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-neutral-950 disabled:opacity-40"
      >
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>
      {guardado && <p className="text-sm text-green-400">Guardado.</p>}
    </form>
  );
}
