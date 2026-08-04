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

  // Registra la seleccion. Si es correcta avanza de inmediato (no se muestra
  // la explicacion); si falla, deja que el usuario la lea y pulse continuar.
  const avanzar = useCallback(() => {
    setIndice((i) => i + 1);
    setSeleccionada(null);
    setBloqueada(false);
  }, []);

  const responder = useCallback(
    (letra) => {
      if (bloqueada || !preguntaActual) return;
      const esCorrecta = letra === preguntaActual.respuesta;
      setSeleccionada(letra);
      setRespuestas((prev) => [
        ...prev,
        { ...preguntaActual, letra, esCorrecta, dificultad: preguntaActual.dificultad },
      ]);

      if (esCorrecta) {
        setBloqueada(true);
        const esUltima = indice >= preguntas.length - 1;
        if (esUltima) {
          onTerminar?.();
        } else {
          avanzar();
        }
      } else {
        setBloqueada(true);
      }
    },
    [bloqueada, preguntaActual, indice, preguntas.length, onTerminar, avanzar],
  );

  const continuar = useCallback(() => {
    const esUltima = indice >= preguntas.length - 1;
    if (esUltima) {
      onTerminar?.();
      return;
    }
    avanzar();
  }, [indice, preguntas.length, onTerminar, avanzar]);

  const reiniciar = useCallback(() => {
    setIndice(0);
    setRespuestas([]);
    setSeleccionada(null);
    setBloqueada(false);
  }, []);

  return {
    indice,
    total: preguntas.length,
    preguntaActual,
    score,
    seleccionada,
    bloqueada,
    respuestas,
    responder,
    continuar,
    reiniciar,
  };
}
