// Módulo de acceso a los datos de preguntas.
// Cada fichero JSON del catálogo vive en public/data/ y se carga en local.

// Catalogos de lenguajes disponibles, con el color del chip para la Home.
export const CATALOGO = [
  { id: 'javascript', nombre: 'JavaScript', color: 'accent' },
  { id: 'typescript', nombre: 'TypeScript', color: 'accent-2' },
  { id: 'python', nombre: 'Python', color: 'accent-3' },
  { id: 'html', nombre: 'HTML', color: 'lavender' },
  { id: 'css', nombre: 'CSS', color: 'mint' },
  { id: 'sql', nombre: 'SQL', color: 'accent-2' },
  { id: 'java', nombre: 'Java', color: 'accent-3' },
  { id: 'go', nombre: 'Go', color: 'mint' },
  { id: 'rust', nombre: 'Rust', color: 'accent-3' },
  { id: 'php', nombre: 'PHP', color: 'lavender' },
  { id: 'csharp', nombre: 'C#', color: 'accent-2' },
  { id: 'cpp', nombre: 'C++', color: 'accent-3' },
];

// Carga el dataset completo de todos los lenguajes en paralelo.
// Devuelve solo los lenguajes que se cargaron correctamente (allSettled).
export async function cargarTodasLasPreguntas() {
  const resultados = await Promise.allSettled(
    CATALOGO.map(async (lenguaje) => {
      const respuesta = await fetch(`/data/${lenguaje.id}.json`);
      if (!respuesta.ok) {
        throw new Error(`No se pudo cargar /data/${lenguaje.id}.json (${respuesta.status})`);
      }
      return { lenguaje: lenguaje.id, preguntas: await respuesta.json() };
    }),
  );

  // Descarta los lenguajes que fallaron y deja solo los que resolvieron.
  return resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

// Filtra las preguntas por dificultad, tipo y lenguaje.
// Cualquier filtro vacío se ignora; los tres se aplican a la vez.
export function filtrarPreguntas(dataset, { dificultad = '', tipo = '', lenguaje = '' } = {}) {
  return dataset.preguntas.filter((pregunta) => {
    if (dificultad && pregunta.dificultad !== dificultad) return false;
    if (tipo && pregunta.tipo !== tipo) return false;
    if (lenguaje && dataset.lenguaje !== lenguaje) return false;
    return true;
  });
}
