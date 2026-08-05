// Util de aleatoriedad para el quiz.
// Baraja las opciones de cada pregunta para que no queden siempre en la misma
// posicion y las partidas sean menos predecibles.

// Baraja una copia del arreglo con el algoritmo Fisher-Yates.
// No muta el arreglo original y devuelve una permutacion nueva.
export function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
