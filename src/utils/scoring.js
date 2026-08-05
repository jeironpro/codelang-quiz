import { PUNTOS } from './constants';

// Modulo de calculo de puntuacion de la partida.

// Devuelve los puntos que otorga/resta una pregunta según su dificultad.
// Devuelve 0 si la dificultad no existe en el mapa de puntos.
export function puntosDe(dificultad) {
    return PUNTOS[dificultad] || 0;
}

// Calcula el nuevo score sumando puntos por acierto o restándolos por fallo.
// El delta se obtiene de la dificultad y se aplica con signo segun el resultado.
export function aplicarRespuesta(score, dificultad, esCorrecta) {
    const delta = puntosDe(dificultad);
    return score + (esCorrecta ? delta : -delta);
}
