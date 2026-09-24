/** Los adornos del encabezado: murciélagos cruzando, araña colgando,
 *  telaraña, fantasmas y estrellas.
 *
 *  Son emoji y no SVG, como en el artboard. Un emoji pesa cuatro bytes, lo
 *  dibuja la fuente del sistema a cualquier tamaño sin perder nitidez, y trae
 *  el color puesto — que es justo lo que se quiere acá, donde conviven un
 *  murciélago negro, una calabaza naranja y un fantasma blanco. La contra es
 *  que cada plataforma los dibuja a su manera; para decoración de fondo eso
 *  no cambia nada, y para un dibujo de marca (un logo) sí habría que usar
 *  SVG.
 *
 *  Todo va con `aria-hidden`: no dicen nada que el texto no diga ya, y un
 *  lector de pantalla leyendo "murciélago murciélago murciélago" antes del
 *  título es ruido. */

const capa: React.CSSProperties = { position: 'absolute', pointerEvents: 'none' };

function Murcielago({ top, duracion, retraso, escala }: {
  top: string;
  duracion: number;
  retraso: number;
  escala: number;
}) {
  return (
    <div
      style={{
        ...capa,
        top,
        left: 0,
        fontSize: 28,
        ['--s' as string]: escala,
        animation: `hw-bat ${duracion}s linear ${retraso}s infinite`,
      }}
    >
      <span className="hw-flap">🦇</span>
    </div>
  );
}

function Estrella({ top, left, color, tamano, desfase }: {
  top: string;
  left: string;
  color: string;
  tamano: number;
  desfase: number;
}) {
  return (
    <div
      style={{
        ...capa,
        top,
        left,
        color,
        fontSize: tamano,
        animation: `hw-twinkle ${2 + desfase}s ease-in-out ${-desfase}s infinite`,
      }}
    >
      ✦
    </div>
  );
}

/** La capa decorativa del encabezado, entera. Va detrás del título
 *  (`zIndex: 0`) y el contenido por encima. */
export function AdornosEncabezado() {
  return (
    <div aria-hidden="true" style={{ ...capa, inset: 0, zIndex: 0 }}>
      <Murcielago top="8px" duracion={14} retraso={0} escala={1} />
      <Murcielago top="150px" duracion={18} retraso={-7} escala={0.7} />
      <Murcielago top="70px" duracion={22} retraso={-13} escala={0.55} />

      <div
        className="hw-spider"
        style={{
          ...capa,
          top: -30,
          left: 'clamp(10px,4vw,60px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 1.5, height: 80, background: 'rgb(42 27 69 / 0.45)' }} />
        <div style={{ fontSize: 26, marginTop: -4 }}>🕷️</div>
      </div>

      <div
        style={{
          ...capa,
          top: 12,
          right: 'clamp(6px,3vw,40px)',
          fontSize: 'clamp(40px,11vw,70px)',
          opacity: 0.9,
          transform: 'rotate(8deg)',
        }}
      >
        🕸️
      </div>

      <div
        className="hw-ghost"
        style={{ ...capa, top: '44%', left: 'clamp(4px,3vw,60px)', fontSize: 30 }}
      >
        👻
      </div>
      <div
        style={{
          ...capa,
          top: '62%',
          right: 'clamp(4px,4vw,70px)',
          fontSize: 24,
          animation: 'hw-ghost 5.4s ease-in-out -2s infinite',
        }}
      >
        🍬
      </div>

      <Estrella top="18px" left="22%" color="#f28a2e" tamano={20} desfase={0.4} />
      <Estrella top="120px" left="88%" color="#f28a2e" tamano={16} desfase={1.1} />
      <Estrella top="200px" left="6%" color="#8b6bc7" tamano={14} desfase={0.8} />
      <Estrella top="58%" left="92%" color="#8b6bc7" tamano={13} desfase={1.6} />
      <Estrella top="72%" left="10%" color="#f28a2e" tamano={15} desfase={0.2} />
    </div>
  );
}

/** "Halloween" letra por letra: cada una cae desde arriba y después se
 *  balancea sola. Es una sola palabra, así que el costo de partirla es un
 *  `<span>` por letra; a cambio el título se arma en pantalla en vez de
 *  aparecer hecho.
 *
 *  `aria-label` en el `<h1>` que la contiene: partida en letras, un lector de
 *  pantalla podría deletrearla. */
export function TituloAnimado({ texto }: { texto: string }) {
  return (
    <>
      {[...texto].map((letra, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            ['--r' as string]: `${i % 2 ? 3 : -3}deg`,
            animation: `hw-drop .8s cubic-bezier(.2,.9,.3,1.3) ${0.25 + i * 0.07}s both, hw-wobble ${2.6 + (i % 3) * 0.4}s ease-in-out ${1.4 + i * 0.1}s infinite`,
          }}
        >
          {letra}
        </span>
      ))}
    </>
  );
}
