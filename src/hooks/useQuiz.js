import { useState, useMemo, useCallback } from 'react';
import { aplicarRespuesta } from '../utils/scoring';
import { barajar } from '../utils/shuffle';
import { OPCIONES } from '../utils/constants';

// Logica central de una partida de quiz.
// Gestiona el indice, las preguntas, el score y las respuestas dadas.
export function useQuiz(preguntas, onTerminar) {
  // Preguntas con el orden de opciones barajado, calculado una sola vez.
  // El barajado solo afecta a la posicion visual; la letra correcta y los
  // textos se mantienen intactos para que el acierto/fallo no cambie.
  const preguntasBarajadas = useMemo(
    () => preguntas.map((pregunta) => ({ ...pregunta, orden: barajar(OPCIONES) })),
    [preguntas],
  );
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
    () => (preguntasBarajadas.length ? preguntasBarajadas[indice] : null),
    [preguntasBarajadas, indice],
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
    const esUltima = indice >= preguntasBarajadas.length - 1;
    if (esUltima) {
      onTerminar?.();
      return;
    }
    setIndice((i) => i + 1);
    setSeleccionada(null);
    setBloqueada(false);
  }, [indice, preguntasBarajadas.length, onTerminar]);

  return {
    indice,
    total: preguntasBarajadas.length,
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
