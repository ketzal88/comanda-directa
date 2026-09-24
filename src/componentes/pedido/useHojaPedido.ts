'use client';

import { useEffect, useState } from 'react';
import { usePedido } from './usePedido';
import { useClienteActual } from '@/componentes/ClienteContext';
import { generarCodigo } from '@/logica/codigo-pedido';
import { calcularCuenta } from '@/logica/cuenta';
import { CUBIERTO, lineasDeCuenta, lineasPedidas, resumenTexto, revisarPedido } from '@/logica/pedido';
import { armarMensaje, enlaceWhatsApp, validarDatos } from '@/logica/whatsapp';
import { MODALIDADES } from '@/logica/tipos';
import type { ConfigPedido, Item, MedioDePago, Modalidad, ZonaEnvio } from '@/logica/tipos';
import type { DatosComensal } from '@/logica/whatsapp';

type Opciones = {
  items: Item[];
  cubiertoPorPersona: number;
  configPedido: ConfigPedido;
  onCerrar: () => void;
};

/** Todo lo que la hoja del pedido HACE, sin nada de cómo se ve.
 *
 *  Existe porque hay dos hojas: la de la plantilla Clásica y la de
 *  `halloween`, que son el mismo formulario con dos diseños. Duplicar el JSX
 *  es un problema de mantenimiento; duplicar las validaciones, el cálculo del
 *  total y el armado del mensaje sería un problema de plata — dos hojas que
 *  cobran distinto es cuestión de tiempo, no de si pasa.
 *
 *  Lo que queda del lado del componente es puramente presentación: qué campo
 *  va dónde, con qué borde y en qué orden. */
export function useHojaPedido({ items, cubiertoPorPersona, configPedido, onCerrar }: Opciones) {
  const { slug, nombre: nombreLocal } = useClienteActual();
  const { pedido, cambiarCantidad, quitar, vaciar, agregarCubierto, sacarCubierto, cantidadDe } =
    usePedido(slug);

  const habilitadas = MODALIDADES.filter((m) => configPedido.modalidades.includes(m));

  const [paso, setPaso] = useState<'pedido' | 'datos'>('pedido');
  const [modalidad, setModalidad] = useState<Modalidad | null>(
    habilitadas.length === 1 ? habilitadas[0] : null,
  );
  const [nombre, setNombre] = useState('');
  const [mesa, setMesa] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [medioDePago, setMedioDePago] = useState<MedioDePago | null>(
    configPedido.mediosDePago.length === 1 ? configPedido.mediosDePago[0] : null,
  );
  const [zona, setZona] = useState<ZonaEnvio | null>(
    configPedido.zonasEnvio.length === 1 ? configPedido.zonasEnvio[0] : null,
  );
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [codigo, setCodigo] = useState(() => generarCodigo());
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // vaciar el pedido desde la hoja la deja sin nada que mostrar
  useEffect(() => {
    if (!pedido.lineas.length) onCerrar();
  }, [pedido.lineas.length, onCerrar]);

  const elegirModalidad = (m: Modalidad) => {
    setModalidad(m);
    setMostrarErrores(false);
    if (m !== 'salon') sacarCubierto();
  };

  const avisos = revisarPedido(pedido, items, {
    cubiertoPorPersona,
    ...(modalidad ? { modalidad } : {}),
  });

  const ofreceCubierto = modalidad === 'salon' && cubiertoPorPersona > 0;
  const cubiertos = cantidadDe(CUBIERTO);
  const pedidas = lineasPedidas(pedido);

  const cuenta = calcularCuenta({
    lineas: lineasDeCuenta(pedido),
    modalidad,
    descuentoRetiro: configPedido.descuentoRetiro,
    descuentoManual: { tipo: 'ninguno' },
    envio: modalidad === 'delivery' ? (zona?.precio ?? 0) : 0,
  });

  const datos: DatosComensal = {
    nombre,
    modalidad: modalidad ?? 'retiro',
    mesa,
    direccion,
    telefono,
    notas,
    medioDePago,
    zona,
  };
  const errores = modalidad ? validarDatos(datos, habilitadas) : [];
  const errorDe = (campo: keyof DatosComensal) => errores.find((e) => e.campo === campo)?.mensaje;

  const mensaje = armarMensaje(pedido, datos, nombreLocal, {
    cubiertoPorPersona,
    cabecera: configPedido.cabecera,
    descuentoRetiro: configPedido.descuentoRetiro,
    codigo,
  });
  const enlace = enlaceWhatsApp(configPedido.whatsapp, mensaje);
  const puedeEnviar = Boolean(enlace) && habilitadas.length > 0;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(resumenTexto(pedido, cuenta, nombreLocal));
      setCopiado(true);
    } catch {
      /* sin permiso de portapapeles no pasa nada: la lista está en pantalla */
    }
  };

  const alEnviar = (e: { preventDefault: () => void }) => {
    if (errores.length || !enlace) {
      e.preventDefault();
      setMostrarErrores(true);
      return;
    }
    // No hay historial server-side todavía (queda para una próxima etapa):
    // el pedido sale por WhatsApp igual, el código solo ayuda a nombrarlo de
    // palabra si hay que buscarlo en el chat.
    setEnviado(true);
    setCodigo(generarCodigo());
  };

  const continuar = () => (modalidad ? setPaso('datos') : setMostrarErrores(true));

  return {
    nombreLocal,
    habilitadas,
    paso,
    setPaso,
    modalidad,
    elegirModalidad,
    campos: {
      nombre,
      setNombre,
      mesa,
      setMesa,
      direccion,
      setDireccion,
      telefono,
      setTelefono,
      notas,
      setNotas,
    },
    medioDePago,
    setMedioDePago,
    zona,
    setZona,
    mostrarErrores,
    setMostrarErrores,
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
  };
}
