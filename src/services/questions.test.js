import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validarDataset } from '../utils/validators';
import { CATALOGO } from './questionsService';

// Ruta del directorio actual en entorno ESM.
const directorio = dirname(fileURLToPath(import.meta.url));

// Valida todos los ficheros JSON del catalogo publico.
// Evita que se rompan datos con errores de esquema o ids repetidos.
describe('dataset JSON', () => {
  let errores;

  beforeAll(() => {
    const dataset = {};
    for (const lang of CATALOGO) {
      const path = resolve(directorio, `../../public/data/${lang.id}.json`);
      dataset[lang.id] = JSON.parse(readFileSync(path, 'utf-8'));
    }
    errores = validarDataset(dataset);
  });

  it('no tiene errores de esquema ni ids duplicados', () => {
    expect(errores).toEqual([]);
  });

  it('tiene al menos una pregunta por lenguaje', () => {
    for (const lang of CATALOGO) {
      const path = resolve(directorio, `../../public/data/${lang.id}.json`);
      const preguntas = JSON.parse(readFileSync(path, 'utf-8'));
      expect(preguntas.length).toBeGreaterThan(0);
    }
  });
});
