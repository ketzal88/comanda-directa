/** Aviso discreto cuando la carta que se muestra puede no estar al día
 *  (la base no respondió al renderizar). Nunca una pantalla de error. */
export function AvisoDesactualizado() {
  return (
    <p className="metadata-item text-center px-6 py-2 border-b border-regla">
      Los precios pueden no estar al día. Ante la duda, consultá en el local.
    </p>
  );
}
