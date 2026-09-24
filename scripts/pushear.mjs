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
    // rama sin upstream: `git push -u` lo resuelve, pero eso es una decisión
    // del operador (¿a qué remoto?, ¿con qué nombre?) y no se toma sola
  }
  const adelante = upstream
    ? Number(git(repo.ruta, 'rev-list', '--count', `${upstream}..HEAD`))
    : 0;
  const sucio = git(repo.ruta, 'status', '--porcelain').split('\n').filter(Boolean).length;
  return { ...repo, rama, upstream, adelante, sucio };
}

function main() {
  const soloVer = process.argv.includes('--ver');
  const estados = repos().map(estado);

  console.log('');
  for (const e of estados) {
    const etiqueta = e.nombre.padEnd(22);
    if (!e.upstream) {
      console.log(`  ${etiqueta} ${e.rama} — sin upstream, no se puede pushear solo`);
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

  const pendientes = estados.filter((e) => e.upstream && e.adelante > 0);
  if (!pendientes.length) {
    console.log('Nada para pushear.');
    return;
  }
  if (soloVer) {
    console.log('(--ver: no se pushea nada)');
    return;
  }

  let fallaron = 0;
  for (const e of pendientes) {
    console.log(`→ ${e.nombre}: pusheando ${e.adelante} commit(s) a ${e.upstream}…`);
    try {
      // stdio heredado: si el remoto pide credenciales, que las pida acá
      execFileSync('git', ['-C', e.ruta, 'push'], { stdio: 'inherit' });
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
    console.log('Los tres repos quedaron al día.');
  }
}

main();
