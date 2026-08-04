import { useState, useCallback } from 'react';

// Hook que sincroniza un valor con localStorage.
// Devuelve [valor, setValor]; setValor persiste y devuelve el nuevo valor.
export function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = window.localStorage.getItem(clave);
      return guardado !== null ? JSON.parse(guardado) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  const actualizar = useCallback(
    (nuevo) => {
      setValor((anterior) => {
        const resultado = typeof nuevo === 'function' ? nuevo(anterior) : nuevo;
        try {
          window.localStorage.setItem(clave, JSON.stringify(resultado));
        } catch {
          // Sin persistencia disponible: se ignora.
        }
        return resultado;
      });
    },
    [clave],
  );

  return [valor, actualizar];
}
