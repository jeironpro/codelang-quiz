// Constantes globales de la aplicación: dificultades, tipos y puntajes.

export const DIFICULTADES = {
  facil: { label: 'Fácil', puntos: 1 },
  media: { label: 'Media', puntos: 2 },
  dificil: { label: 'Difícil', puntos: 3 },
};

// Puntos base por dificultad. Correcta suma, errónea resta.
export const PUNTOS = {
  facil: 1,
  media: 2,
  dificil: 3,
};

export const TIPOS = {
  output: '¿Qué imprime?',
  sintaxis: 'Sintaxis',
  bug: 'Bug',
  concepto: 'Concepto',
};

export const OPCIONES = ['A', 'B', 'C', 'D'];

export const CLAVE_SCORE = 'codelang-quiz:score';
export const CLAVE_HISTORIAL = 'codelang-quiz:historial';
