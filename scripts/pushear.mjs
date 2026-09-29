#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Pushea los repos de este working tree, en una sola pasada.
 *
 *  POR QUÉ EXISTE: son tres repos git independientes en un mismo árbol
 *  (motor, presencia-carta, sagrado-sushi-carta). El push es del operador,
 *  pero "del operador" no debería significar "abrir cada repo en su propia
 *  ventana del editor y acordarse de los tres". Eso ya se cobró un olvido:
 *  un commit de sagrado-sushi quedó sin pushear hasta que alguien abrió ese
 *  repo aparte.
 *
 *  Se corre con `npm run pushear`. No lo corre Claude: `pre-push-guard.py`
 *  lo bloquea igual que a un `git push`, porque un atajo que el agente pueda
 *  usar no es un atajo, es el agujero de la regla.
 *
 *  Descubre los repos en vez de tenerlos escritos: el día que se sume un
 *  cliente más, aparece solo.
 *
 *  Una rama sin upstream (recién creada, todavía no publicada) NO se publica
 *  sola: publicarla es una decisión (¿a qué remoto?, ¿con qué nombre?) y no
 *  una consecuencia de haber commiteado. Pero tampoco se deja en un callejón:
 *  se informa el comando exacto, y `--nueva` lo corre con el default obvio
 *  (`origin`, mismo nombre de rama). Pasar el flag ES la decisión.
 */

const RAIZ = process.cwd();

function git(repo, ...args) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

/** El repo raíz y cada subcarpeta de primer nivel que tenga su propio `.git`. */
function repos() {
  const hallados = [{ ruta: RAIZ, nombre: '.' }];
  for (const entrada of readdirSync(RAIZ, { withFileTypes: true })) {
    if (!entrada.isDirectory() || entrada.name.startsWith('.') || entrada.name === 'node_modules') {
      continue;
    }
    if (existsSync(join(RAIZ, entrada.name, '.git'))) {
      hallados.push({ ruta: join(RAIZ, entrada.name), nombre: entrada.name });
    }
  }
  return hallados;
}

function estado(repo) {
  const rama = git(repo.ruta, 'rev-parse', '--abbrev-ref', 'HEAD');
  let upstream = null;
  try {
    upstream = git(repo.ruta, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}');
  } catch {
    // rama sin upstream: ver el comentario de cabecera. Se cuenta igual, para
    // poder decir cuánto trabajo hay ahí en vez de sólo "no se puede".
  }
  const adelante = upstream
    ? Number(git(repo.ruta, 'rev-list', '--count', `${upstream}..HEAD`))
    // sin upstream no hay contra qué comparar: se cuenta lo que no está en
    // NINGÚN remoto, que es exactamente lo que se perdería si mañana se borra
    // el working tree
    // ojo con el orden: `--not` niega TODO lo que va detrás, así que `HEAD`
    // tiene que ir ANTES. Con `--not --remotes HEAD` el conteo da siempre 0.
    : Number(git(repo.ruta, 'rev-list', '--count', 'HEAD', '--not', '--remotes'));
  const sucio = git(repo.ruta, 'status', '--porcelain').split('\n').filter(Boolean).length;
  return { ...repo, rama, upstream, adelante, sucio };
}

function main() {
  const soloVer = process.argv.includes('--ver');
  const publicarNuevas = process.argv.includes('--nueva');
  const estados = repos().map(estado);

  console.log('');
  for (const e of estados) {
    const etiqueta = e.nombre.padEnd(22);
    if (!e.upstream) {
      const cuantos = e.adelante === 1 ? '1 commit' : `${e.adelante} commits`;
      console.log(`  ${etiqueta} ${e.rama} — rama nueva, sin publicar (${cuantos})`);
      if (!publicarNuevas) {
        console.log(`  ${''.padEnd(22)} agregá --nueva para publicarla en origin`);
        console.log(`  ${''.padEnd(22)} o a mano: git -C ${e.nombre} push -u origin ${e.rama}`);
      }
    } else if (e.adelante === 0) {
      console.log(`  ${etiqueta} al día`);
    } else {
      console.log(`  ${etiqueta} ${e.adelante} commit(s) para pushear`);
    }
    if (e.sucio > 0) {
      console.log(`  ${''.padEnd(22)} ${e.sucio} archivo(s) sin commitear (no se pushean)`);
    }
  }
  console.log('');

  const pendientes = estados.filter((e) => e.adelante > 0 && (e.upstream || publicarNuevas));
  if (!pendientes.length) {
    // "nada para pushear" sería mentira si hay una rama nueva esperando el
    // flag: el trabajo está, lo que falta es la decisión de publicarla
    const sinPublicar = estados.filter((e) => !e.upstream && e.adelante > 0);
    console.log(
      sinPublicar.length
        ? `Nada para pushear. Queda ${sinPublicar.length} rama(s) sin publicar (ver arriba).`
        : 'Nada para pushear.',
    );
    return;
  }
  if (soloVer) {
    console.log('(--ver: no se pushea nada)');
    return;
  }

  let fallaron = 0;
  for (const e of pendientes) {
    // una rama nueva se publica en `origin` con su mismo nombre y queda
    // trackeando: la próxima corrida ya la ve como cualquier otra
    const args = e.upstream
      ? ['-C', e.ruta, 'push']
      : ['-C', e.ruta, 'push', '-u', 'origin', e.rama];
    const destino = e.upstream ?? `origin/${e.rama} (nueva)`;
    console.log(`→ ${e.nombre}: subiendo ${e.adelante} commit(s) a ${destino}…`);
    try {
      // stdio heredado: si el remoto pide credenciales, que las pida acá
      execFileSync('git', args, { stdio: 'inherit' });
      console.log(`  ✓ ${e.nombre}`);
    } catch {
      fallaron++;
      console.log(`  ✗ ${e.nombre}: el push falló (ver el error arriba)`);
    }
  }

  console.log('');
  if (fallaron) {
    console.log(`Quedaron ${fallaron} repo(s) sin pushear.`);
    process.exitCode = 1;
  } else {
    console.log('Los repos quedaron al día.');
  }
}

main();
