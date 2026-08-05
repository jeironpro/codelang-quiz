# Codelang Quiz

Aplicación web de preguntas y respuestas sobre programación. Plantea problemáticas de código con opciones A/B/C/D categorizadas por **lenguaje**, **dificultad** y **tipo**.

Es frontend-only: los datos viven como ficheros JSON en `public/data/` y el progreso se guarda en `localStorage`.

## Características

- Opciones A/B/C/D con feedback tras responder: al acertar muestra los puntos ganados y la explicación; al fallar, la respuesta correcta y la explicación.
- Score por dificultad (fácil +1, media +2, difícil +3): acierto suma, fallo resta.
- Filtros por lenguaje, dificultad y tipo.
- Historial de partidas y score acumulado persistidos en `localStorage`.
- Sistema de diseño **Hum** (skill Hallmark): papel crema, acentos pera/cian/coral, sans redondeada.

## Stack

- React 18 + Vite
- React Router v6
- Vitest + React Testing Library
- ESLint + Prettier
- Yarn (corepack, Node 24)

## Instalación

```bash
corepack enable
yarn install
yarn dev
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `yarn dev` | Servidor de desarrollo con HMR |
| `yarn build` | Compilación de producción |
| `yarn preview` | Previsualizar el build |
| `yarn lint` | ESLint (sin warnings) |
| `yarn format` / `yarn format:check` | Formato con Prettier |
| `yarn test` | Ejecutar tests con Vitest |

## Estructura

```
src/
  components/
    layout/       Navbar, Footer, Layout
    ui/           CodeBlock
  context/        QuizContext (score e historial)
  hooks/          useQuiz, useLocalStorage
  pages/          Home, Quiz, Resultados, NotFound
  routes/         Definición de rutas
  services/       Acceso y filtrado de preguntas
  styles/         tokens.css, globals.css, components.css
  utils/          constantes, scoring, validators
public/data/      Catálogo JSON de preguntas
```

## Dataset: cómo añadir preguntas

Cada lenguaje tiene un fichero en `public/data/<lenguaje>.json` con un array de preguntas. Esquema de cada pregunta:

```json
{
  "id": "js-001",
  "dificultad": "facil",
  "tipo": "output",
  "pregunta": "¿Qué muestra por consola este código?",
  "codigo": "console.log(typeof null);",
  "opciones": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "respuesta": "B",
  "explicacion": "Por qué es esa la respuesta."
}
```

- `dificultad`: `facil`, `media` o `dificil`.
- `tipo`: `output`, `sintaxis`, `bug` o `concepto`.
- `opciones` siempre usa claves `A`, `B`, `C`, `D`.
- `respuesta` debe existir en `opciones`.
- El test `src/services/questions.test.js` valida el esquema y los ids únicos de todo el catálogo.

## Pruebas

```bash
yarn test
```

Los tests validan el esquema del dataset, la lógica de scoring, los hooks y el comportamiento de la página Quiz (feedback al responder).

## Documentación de diseño

El sistema visual completo está documentado en [DESIGN.md](./DESIGN.md).

## Licencia

MIT. Consulta [LICENSE](./LICENSE).