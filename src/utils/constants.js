// Constantes globales de la aplicación: dificultades, tipos y puntajes.
// Son la fuente de verdad de los filtros y del calculo de puntos.

// Dificultades con su etiqueta visible y los puntos que otorgan.
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

// Tipos de problema con su etiqueta visible en los chips de filtro.
export const TIPOS = {
    output: '¿Qué imprime?',
    sintaxis: 'Sintaxis',
    bug: 'Bug',
    concepto: 'Concepto',
};

// Letras de las opciones de respuesta, siempre las mismas A-D.
export const OPCIONES = ['A', 'B', 'C', 'D'];

// Segundos disponibles para responder cada pregunta.
export const TIEMPO_PREGUNTA = 30;

// Claves de localStorage donde se persiste score e historial.
export const CLAVE_SCORE = 'codelang-quiz:score';
export const CLAVE_HISTORIAL = 'codelang-quiz:historial';
