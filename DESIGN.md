# Codelang Quiz — Libro de estilo

Sistema de diseño de la aplicación, basado en el tema **Hum** del skill de diseño **Hallmark**.

## Identidad

- **Género**: playful (aprendizaje, curiosidad, cálido).
- **Tono**: cálido, directo, específico. Hum es *"una pequeña herramienta suave y exacta"*.
- **Propósito**: que el usuario ponga a prueba su conocimiento de programación sin fricción.

## Paleta (tokens)

- `--color-paper: oklch(97% 0.012 95)` — base crema (nunca blanco puro).
- `--color-paper-2: oklch(94% 0.016 95)` — banda tintada.
- `--color-paper-3: oklch(91% 0.02 95)` — hover profundo.
- `--color-ink: oklch(20% 0.012 250)` — texto (nunca negro puro).
- `--color-accent: oklch(86% 0.18 95)` — pera (acción primaria).
- `--color-accent-2: oklch(66% 0.18 235)` — cian (links, hover).
- `--color-accent-3: oklch(68% 0.24 18)` — coral (momentos de alta energía).
- `--color-mint / --color-lavender` — usados con moderación.

### Reglas de acento
1. Cada acento es dueño de su tipo de superficie.
2. Nunca gradientes entre acentos.
3. Mint y lavender se usan de forma ocasional.

## Tipografía

- **Display / cuerpo**: Plus Jakarta Sans (400/500/600/700), sans redondeada.
- **Mono**: JetBrains Mono (etiquetas, números tabulares).
- Sin serif. Display en peso 600, tracking `-0.025em`. Mayúsculas solo en mono.

## Botones

- Base: color edge (borde sólido) + sombra de tierra. La **pulsación es el feedback**.
- Hover: sube 2px y agranda el edge. Active: baja 3px y reduce el edge.
- Variantes: `--pear` (primaria), `--coral`, `--cyan`, `--mint`, `--lav`, `--ink`.
- Estilos: `--soft`, `--outline`.

## Tarjetas

- Radio 20px, sombra suave, elevación `translateY(-4px)` en hover.
- Color-shift: tintar con el acento al 6% en reposo y 12% en hover.

## Radios y forma

- Cards 20px · inputs 12px · pills 999px. Nunca esquinas cuadradas.

## Movimiento

- `--ease-spring` para hover de cards, `--ease-snap` para reveals.
- Celebración: estallido de estrella coral en aciertos.
- `prefers-reduced-motion: reduce` colapsa todo a transiciones de opacidad/color.

## Accesibilidad

- Contraste ≥ 3:1 en `:focus-visible` (anillo cian).
- HTML semántico, etiquetas aria donde es necesario.
- Responsive con media queries y `overflow-x: clip`.

## Código

- Sin emojis en el código; iconografía mediante elementos CSS/SVG.
- Comentarios en castellano.
- Sin `innerHTML` inseguro (render de código como texto plano).

## Componentes

- `Navbar` (N7 brutal slab), `Footer` (statement).
- `Button`, `Card`, `Spinner`, `CodeBlock`.
- Páginas: `Home`, `Quiz`, `Resultados`, `NotFound`.