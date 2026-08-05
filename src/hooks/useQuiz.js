import { useState, useMemo, useCallback } from 'react';
import { aplicarRespuesta } from '../utils/scoring';

// Logica central de una partida de quiz.
// Gestiona el indice, las preguntas, el score y las respuestas dadas.
export function useQuiz(preguntas, onTerminar) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [bloqueada, setBloqueada] = useState(false);

  const preguntaActual = useMemo(
    () => (preguntas.length ? preguntas[indice] : null),
    [preguntas, indice],
  );

  const score = useMemo(
    () =>
      respuestas.reduce(
        (total, item) => aplicarRespuesta(total, item.dificultad, item.esCorrecta),
        0,
      ),
    [respuestas],
  );

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
