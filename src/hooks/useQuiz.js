import { useState, useMemo, useCallback } from 'react';
import { aplicarRespuesta } from '../utils/scoring';

// Logica central de una partida de quiz.
// Gestiona el indice, las preguntas, el score y las respuestas dadas.
export function useQuiz(preguntas, onTerminar) {
  // Indice de la pregunta visible en cada momento.
  const [indice, setIndice] = useState(0);
  // Registro completo de respuestas con su pregunta original y la letra elegida.
  const [respuestas, setRespuestas] = useState([]);
  // Letra elegida en la pregunta actual (null si aun no se ha respondido).
  const [seleccionada, setSeleccionada] = useState(null);
  // Bloquea las opciones mientras se muestra el feedback.
  const [bloqueada, setBloqueada] = useState(false);

  // Pregunta visible, o null si el indice queda fuera de rango.
  const preguntaActual = useMemo(
    () => (preguntas.length ? preguntas[indice] : null),
    [preguntas, indice],
  );

  // Score acumulado: suma puntos por acierto y resta por fallo.
  const score = useMemo(
    () =>
      respuestas.reduce(
        (total, item) => aplicarRespuesta(total, item.dificultad, item.esCorrecta),
        0,
      ),
    [respuestas],
  );

  // Conteos derivados para resumir la partida sin recalcular en cada render.
  const aciertos = useMemo(() => respuestas.filter((r) => r.esCorrecta).length, [respuestas]);
  const fallos = useMemo(() => respuestas.length - aciertos, [respuestas, aciertos]);

  // Registra la seleccion y bloquea la pregunta para mostrar el feedback.
  // Tanto el acierto como el fallo dejan que el usuario lea la explicacion
  // y decida continuar; nunca avanza de forma automatica.
  const responder = useCallback(
    (letra) => {
      if (bloqueada || !preguntaActual) return;
      const esCorrecta = letra === preguntaActual.respuesta;
      setSeleccionada(letra);
      setRespuestas((prev) => [...prev, { ...preguntaActual, letra, esCorrecta }]);
      setBloqueada(true);
    },
    [bloqueada, preguntaActual],
  );

  // Avanza a la siguiente pregunta o termina la partida si era la ultima.
  const continuar = useCallback(() => {
    const esUltima = indice >= preguntas.length - 1;
    if (esUltima) {
      onTerminar?.();
      return;
    }
    setIndice((i) => i + 1);
    setSeleccionada(null);
    setBloqueada(false);
  }, [indice, preguntas.length, onTerminar]);

  return {
    indice,
    total: preguntas.length,
    preguntaActual,
    score,
    aciertos,
    fallos,
    seleccionada,
    bloqueada,
    respuestas,
    responder,
    continuar,
  };
}
