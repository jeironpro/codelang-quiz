import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CLAVE_SCORE, CLAVE_HISTORIAL } from '../utils/constants';

// Contexto global que comparte el score acumulado y el historial de partidas.
// Se persiste todo en localStorage para que sobreviva a recargas.
const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  // Score acumulado de todas las partidas jugadas.
  const [score, setScoreStore] = useLocalStorage(CLAVE_SCORE, 0);
  // Historial de las ultimas 20 partidas, con la mas reciente primero.
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
      // Inserta al inicio y recorta a 20 entradas para no crecer sin limite.
      setHistorial((prev) => [nuevaPartida, ...prev].slice(0, 20));
      setScoreStore((prev) => prev + puntos);
    },
    [setHistorial, setScoreStore],
  );

  // El valor solo se recalcula cuando cambia el score o el historial.
  const valor = useMemo(
    () => ({ score, historial, registrarPartida }),
    [score, historial, registrarPartida],
  );

  return <QuizContext.Provider value={valor}>{children}</QuizContext.Provider>;
}

// Hook de acceso al contexto; lanza un error si se usa fuera del provider.
export function useQuizContext() {
  const contexto = useContext(QuizContext);
  if (!contexto) {
    throw new Error('useQuizContext debe usarse dentro de QuizProvider');
  }
  return contexto;
}
