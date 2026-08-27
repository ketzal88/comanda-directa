type Props = { nombre: string; logoUrl?: string; tamano?: number; className?: string };

/** El logo del cliente si lo cargó, si no el nombre en texto. `<img>` y no
 *  `next/image`: el logo puede ser una URL https pegada en el panel de
 *  cualquier cliente, sin declarar cada host de antemano en next.config. */
export function Marca({ nombre, logoUrl, tamano = 96, className = '' }: Props) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={nombre}
        style={{ height: tamano }}
        className={`inline-block w-auto ${className}`}
      />
    );
  }
  return (
    <span
      className={`titulo-categoria inline-block ${className}`}
      style={{ fontSize: Math.round(tamano * 0.28) }}
    >
      {nombre}
    </span>
  );
}
