const FIGURAS = ['🦇', '🦇', '🦇', '🎃', '👻', '✦', '🦇', '🍬'];

/** El estallido de murciélagos al agregar algo al pedido.
 *
 *  Es el único feedback de que el botón hizo algo: la tarjeta queda igual
 *  salvo por un número, y en una grilla de dos columnas ese cambio se pierde.
 *  Con las chispas saliendo del botón que se tocó, no hay que buscarlo.
 *
 *  Se dibuja con `element.animate()` y nodos que se borran solos al terminar,
 *  no con estado de React: son ochocientos milisegundos decorativos y no
 *  tienen por qué provocar renders de una grilla de 81 tarjetas.
 *
 *  Con `prefers-reduced-motion` no pasa nada de nada. */
export function chispas(elemento: HTMLElement | null, grande = false): void {
  if (!elemento) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const caja = elemento.getBoundingClientRect();
  const x = caja.left + caja.width / 2;
  const y = caja.top + caja.height / 2;
  const cuantas = grande ? 14 : 10;

  for (let i = 0; i < cuantas; i++) {
    const figura = FIGURAS[Math.floor(Math.random() * FIGURAS.length)];
    const nodo = document.createElement('span');
    nodo.textContent = figura;
    nodo.setAttribute('aria-hidden', 'true');
    Object.assign(nodo.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: '9999',
      pointerEvents: 'none',
      lineHeight: '1',
      willChange: 'transform, opacity',
      fontSize: `${figura === '✦' ? 14 : 16 + Math.random() * 14}px`,
      color: '#f28a2e',
    });
    document.body.appendChild(nodo);

    // en círculo, con un poco de desorden: doce murciélagos en abanico
    // perfecto se ven como un menú desplegándose, no como un estallido
    const angulo = (Math.PI * 2 * i) / cuantas + (Math.random() - 0.5) * 0.6;
    const distancia = 60 + Math.random() * (grande ? 110 : 70);
    const dx = Math.cos(angulo) * distancia;
    const dy = Math.sin(angulo) * distancia - 40; // arranca para arriba
    const giro = (Math.random() - 0.5) * 120;

    nodo.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 0 },
        {
          transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${dy * 0.6}px)) scale(1.15) rotate(${giro / 2}deg)`,
          opacity: 1,
          offset: 0.35,
        },
        {
          // +50px al final: caen, no se evaporan en el aire
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 50}px)) scale(.7) rotate(${giro}deg)`,
          opacity: 0,
        },
      ],
      { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).onfinish = () => nodo.remove();
  }

  elemento.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(.9)' },
      { transform: 'scale(1.06)' },
      { transform: 'scale(1)' },
    ],
    { duration: 320 },
  );
}
