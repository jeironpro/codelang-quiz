// Constantes globales de la aplicación: dificultades, tipos y puntajes.

export const DIFICULTADES = {
  facil: { label: 'Fácil', puntos: 1 },
  media: { label: 'Media', puntos: 2 },
  dificil: { label: 'Difícil', puntos: 3 },
};

// Puntos base por dificultad, derivados de DIFICULTADES (única fuente de verdad).
// Correcta suma, errónea resta.
export const PUNTOS = Object.fromEntries(
  Object.entries(DIFICULTADES).map(([clave, dato]) => [clave, dato.puntos]),
);

export const TIPOS = {
  output: '¿Qué imprime?',
  sintaxis: 'Sintaxis',
  bug: 'Bug',
  concepto: 'Concepto',
};

export const OPCIONES = ['A', 'B', 'C', 'D'];

export const CLAVE_SCORE = 'codelang-quiz:score';
export const CLAVE_HISTORIAL = 'codelang-quiz:historial';
