import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CLAVE_SCORE, CLAVE_HISTORIAL } from '../utils/constants';

// Contexto global que comparte el score acumulado y el historial de partidas.
const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [score, setScoreStore] = useLocalStorage(CLAVE_SCORE, 0);
  const [historial, setHistorial] = useLocalStorage(CLAVE_HISTORIAL, []);

  // Anade una partida al historial y actualiza el score acumulado.
  const registrarPartida = useCallback(
    ({ aciertos, fallos, puntos, total, lenguaje, dificultad }) => {
      const nuevaPartida = {
        fecha: new Date().toISOString(),
        aciertos,
        fallos,
        puntos,
        total,
        lenguaje,
        dificultad,
      };
      setHistorial((prev) => [nuevaPartida, ...prev].slice(0, 20));
      setScoreStore((prev) => prev + puntos);
    },
    [setHistorial, setScoreStore],
  );

  const valor = useMemo(
    () => ({ score, historial, registrarPartida }),
    [score, historial, registrarPartida],
  );

  return <QuizContext.Provider value={valor}>{children}</QuizContext.Provider>;
}

export function useQuizContext() {
  const contexto = useContext(QuizContext);
  if (!contexto) {
    throw new Error('useQuizContext debe usarse dentro de QuizProvider');
  }
  return contexto;
}
