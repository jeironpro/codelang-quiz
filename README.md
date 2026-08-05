# Codelang Quiz

Aplicación web de preguntas y respuestas sobre programación. Plantea problemáticas de código con opciones A/B/C/D categorizadas por **lenguaje**, **dificultad** y **tipo**.

Es frontend-only: los datos viven como ficheros JSON en `public/data/` y el progreso se guarda en `localStorage`.

## Características

- Opciones A/B/C/D con feedback tras responder: al acertar muestra los puntos ganados y la explicación; al fallar, la respuesta correcta y la explicación.
- Detener la partida cuando quieras: confirma con un modal y la puntuación acumulada hasta ese momento se guarda en el historial.
- Score por dificultad (fácil +1, media +2, difícil +3): acierto suma, fallo resta.
- Filtros por lenguaje, dificultad y tipo.
- Historial de partidas y score acumulado persistidos en `localStorage`, con modal informativo en la barra de navegación que explica qué se guarda y dónde.
- Temporizador por pregunta (30s): al agotarse la pregunta se bloquea y cuenta como fallo.
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

Los tests validan el esquema del dataset, la lógica de scoring, los hooks, el comportamiento de la página Quiz (feedback, temporizador y detención de partida) y el modal informativo de la barra de navegación.

## Reels de Instagram automáticos

El workflow `reels.yml` genera y publica reels verticales (9:16) con las preguntas del catálogo, sin Playwright: los slides se dibujan con canvas (`@napi-rs/canvas`) replicando el layout de la web (card con pregunta y las cuatro opciones) y se convierten a video con `ffmpeg`. La respuesta **no se muestra** en el video; el caption invita a comentar la letra.

- **Disparo**: manual desde *Actions → Reels Instagram* (inputs `lenguaje` y `cantidad`) o por cron (1 reel aleatorio cada día a las 13:00 UTC).
- **Publicación**: el mp4 se sube como asset de la release `reels` (URL pública e inmediata) y se publica vía Instagram Graph API (`media_type=REELS` → poll `status_code` → `media_publish`).
- **Generar sin publicar**:
  ```bash
  node scripts/reels/index.mjs --cantidad 1 --lenguaje javascript --solo-local
  # los mp4 quedan en dist-reels/
  ```

### Requisitos previos

- Cuenta de Instagram **Business/Creator** vinculada a una página de Facebook.
- App de Meta con el producto Instagram y permisos `instagram_content_publish` + `instagram_business_basic`.
- Token de acceso de largo plazo (se refresca cada ~60 días).

### Configuración

Define estos secrets en el repositorio (o variables de entorno localmente, ver `.env.example`):

| Secret | Descripción |
| --- | --- |
| `IG_ACCESS_TOKEN` | Token de acceso con permiso de publicación de contenido |
| `IG_BUSINESS_ID` | Id de la cuenta de Instagram (IG User ID) |

Límites de Meta a tener en cuenta: video ≤ 90s y máx. 25 publicaciones por cuenta cada 24h.

## Documentación de diseño

El sistema visual completo está documentado en [DESIGN.md](./DESIGN.md).

## Licencia

MIT. Consulta [LICENSE](./LICENSE).