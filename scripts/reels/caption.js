import { CATALOGO } from '../../src/services/questionsService.js';
import { DIFICULTADES, TIPOS } from '../../src/utils/constants.js';

// Construye el texto de publicacion (caption) de cada reel a partir de la
// pregunta elegida, usando las mismas etiquetas que muestra la web.

export function construirCaption(pregunta) {
  const lenguaje = CATALOGO.find((l) => l.id === pregunta.lenguaje)?.nombre ?? pregunta.lenguaje;
  const dificultad = DIFICULTADES[pregunta.dificultad]?.label ?? pregunta.dificultad;
  const tipo = TIPOS[pregunta.tipo] ?? pregunta.tipo;
  const preguntaCorta =
    pregunta.pregunta.length > 110 ? `${pregunta.pregunta.slice(0, 107)}…` : pregunta.pregunta;

  return [
    `${lenguaje} · ${tipo} · ${dificultad}`,
    '',
    `💡 ${preguntaCorta}`,
    '',
    '¿Cuál es la respuesta correcta? Comenta tu letra 👇',
    '',
    '#codelangquiz #programacion #code #developer #aprenderprogramacion #quiz',
    '',
    'Juega gratis en codelang-quiz 🚀',
  ].join('\n');
}
