#!/usr/bin/env node
// Genera y publica reels de Instagram a partir de las preguntas del catalogo.
//
// Uso local:
//   node scripts/reels/index.mjs --cantidad 1 --lenguaje javascript --solo-local
// Publicacion (necesita IG_ACCESS_TOKEN e IG_BUSINESS_ID):
//   node scripts/reels/index.mjs --cantidad 1 --lenguaje aleatorio
import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { barajar } from '../../src/utils/shuffle.js';
import { dibujarPregunta } from './render.js';
import { crearVideo } from './video.js';
import { construirCaption } from './caption.js';
import { publicarReel } from './instagram.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR_DATOS = join(RAIZ, 'public', 'data');
const DIR_SALIDA = join(RAIZ, 'dist-reels');
const TAG_RELEASE = 'reels';

function leerOpciones() {
  const args = process.argv.slice(2);
  const valor = (bandera, porDefecto) => {
    const indice = args.indexOf(bandera);
    return indice >= 0 ? args[indice + 1] : porDefecto;
  };
  return {
    lenguaje: valor('--lenguaje', process.env.LENGUAJE ?? 'aleatorio'),
    cantidad: Number(valor('--cantidad', process.env.CANTIDAD ?? '1')),
    soloLocal: args.includes('--solo-local'),
  };
}

async function cargarCatalogo() {
  const ficheros = (await readdir(DIR_DATOS)).filter((f) => f.endsWith('.json'));
  const datasets = [];
  for (const fichero of ficheros) {
    const lenguaje = basename(fichero, '.json');
    const preguntas = JSON.parse(await readFile(join(DIR_DATOS, fichero), 'utf8'));
    datasets.push({ lenguaje, preguntas });
  }
  return datasets;
}

function ejecutar(comando, argumentos) {
  return execFileSync(comando, argumentos, { encoding: 'utf8' }).trim();
}

function repoActual() {
  // En CI la variable GITHUB_REPOSITORY trae "owner/repo"; en local se consulta gh.
  return (
    process.env.GITHUB_REPOSITORY ??
    ejecutar('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'])
  );
}

async function subirARelase(mp4s) {
  const repo = repoActual();
  // Se crea la release "reels" si todavia no existe; los assets se sobreescriben.
  try {
    ejecutar('gh', ['release', 'view', TAG_RELEASE, '--repo', repo]);
  } catch {
    ejecutar('gh', [
      'release',
      'create',
      TAG_RELEASE,
      '--title',
      'Reels',
      '--notes',
      'Assets de video publicados en Instagram',
      '--repo',
      repo,
    ]);
  }
  ejecutar('gh', ['release', 'upload', TAG_RELEASE, ...mp4s, '--clobber', '--repo', repo]);

  // La URL de descarga de un asset de release es publica y estable.
  return mp4s.map((mp4) => ({
    mp4,
    url: `https://github.com/${repo}/releases/download/${TAG_RELEASE}/${encodeURIComponent(basename(mp4))}`,
  }));
}

async function main() {
  const { lenguaje, cantidad, soloLocal } = leerOpciones();
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 5) {
    throw new Error('La cantidad debe ser un entero entre 1 y 5');
  }

  const catalogo = await cargarCatalogo();
  const fuentes =
    lenguaje === 'aleatorio' ? catalogo : catalogo.filter((d) => d.lenguaje === lenguaje);
  if (!fuentes.length) {
    throw new Error(`No hay datos para el lenguaje "${lenguaje}"`);
  }
  const pool = fuentes.flatMap((d) => d.preguntas.map((p) => ({ ...p, lenguaje: d.lenguaje })));
  const elegidas = barajar(pool).slice(0, cantidad);

  await mkdir(DIR_SALIDA, { recursive: true });
  const reels = [];
  for (const pregunta of elegidas) {
    const png = join(DIR_SALIDA, `${pregunta.id}.png`);
    const mp4 = join(DIR_SALIDA, `${pregunta.id}.mp4`);
    await writeFile(png, dibujarPregunta(pregunta));
    crearVideo(png, mp4);
    reels.push({ pregunta, png, mp4 });
    console.log(`Reel generado: ${basename(mp4)}`);
  }

  if (soloLocal) {
    console.log('\nPreview local en ' + DIR_SALIDA);
    return;
  }

  const subidos = await subirARelase(reels.map((r) => r.mp4));
  for (const { pregunta, mp4 } of reels) {
    const subido = subidos.find((s) => s.mp4 === mp4);
    const caption = construirCaption(pregunta);
    const id = await publicarReel({ videoUrl: subido.url, caption });
    console.log(`Publicado en Instagram: ${pregunta.id} (contenedor ${id})`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
