import { PUNTOS } from './constants';

// Devuelve los puntos que otorga/resta una pregunta según su dificultad.
export function puntosDe(dificultad) {
  return PUNTOS[dificultad] || 0;
}

// Calcula el nuevo score sumando puntos por acierto o restándolos por fallo.
export function aplicarRespuesta(score, dificultad, esCorrecta) {
  const delta = puntosDe(dificultad);
  return score + (esCorrecta ? delta : -delta);
}
