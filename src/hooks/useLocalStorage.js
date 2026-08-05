import { useState, useCallback } from 'react';

// Hook que sincroniza un valor con localStorage.
// Devuelve [valor, setValor]; setValor persiste y devuelve el nuevo valor.
// Acepta tanto un valor directo como una funcion updater (igual que useState).
export function useLocalStorage(clave, valorInicial) {
    // La lectura inicial se hace una sola vez (inicializacion perezosa).
    const [valor, setValor] = useState(() => {
        try {
            const guardado = window.localStorage.getItem(clave);
            return guardado !== null ? JSON.parse(guardado) : valorInicial;
        } catch {
            // Si el JSON guardado esta corrupto se usa el valor inicial.
            return valorInicial;
        }
    });

    const actualizar = useCallback(
        (nuevo) => {
            setValor((anterior) => {
                // Resuelve el nuevo valor aunque se pase una funcion updater.
                const resultado = typeof nuevo === 'function' ? nuevo(anterior) : nuevo;
                try {
                    window.localStorage.setItem(clave, JSON.stringify(resultado));
                } catch {
                    // Sin persistencia disponible (p. ej. almacenamiento lleno): se ignora.
                }
                return resultado;
            });
        },
        [clave],
    );

    return [valor, actualizar];
}
