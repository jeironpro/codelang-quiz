import { createCanvas } from '@napi-rs/canvas';
import { CATALOGO } from '../../src/services/questionsService.js';
import { DIFICULTADES, TIPOS } from '../../src/utils/constants.js';

// Renderiza los slides de cada reel reproduciendo el layout de la web:
// card del enunciado (tag, pregunta y codigo) con las cuatro opciones debajo.
// Genera PNG 9:16 listos para que ffmpeg los convierta en video.
//
// El layout se calcula en funcion de una escala: si la card con su codigo
// ocupa demasiado, todo el conjunto se reduce para no salirse del lienzo.

export const ANCHO = 1080;
export const ALTO = 1920;

// Paleta Hum del tema convertida a hex aproximado (OKLCH no se dibuja).
const PALETA = {
  paper: '#f6f3ec',
  paper2: '#eee8db',
  paper3: '#e5deca',
  ink: '#2f3a4d',
  ink2: '#6d7683',
  accent: '#e6b444',
  accent2: '#5070d6',
  accent2Deep: '#3a56b8',
  accent3: '#df5d3d',
  mint: '#82d1a8',
  lavender: '#b89ae0',
};

// Colores de cada lenguaje segun el chip de la Home.
const COLOR_CHIP = {
  accent: PALETA.accent,
  'accent-2': PALETA.accent2,
  'accent-3': PALETA.accent3,
  lavender: PALETA.lavender,
  mint: PALETA.mint,
};

// Fuentes del tema: sans redondeada para texto y mono para codigo/tags.
const FUENTE = 'sans-serif';
const MONO = 'monospace';

function redondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function envolver(ctx, texto, anchoMax) {
  // Divide el texto en palabras y las encaja en lineas que no superen el ancho.
  const lineas = [];
  let linea = '';
  for (const palabra of texto.split(' ')) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width <= anchoMax) {
      linea = prueba;
    } else {
      if (linea) lineas.push(linea);
      linea = palabra;
    }
  }
  if (linea) lineas.push(linea);
  return lineas;
}

function envolverCodigo(ctx, codigo, anchoMax) {
  // El codigo se parte por caracteres para no romper la indentacion ni los tokens.
  const lineas = [];
  let linea = '';
  for (const caracter of codigo) {
    if (caracter === '\n' || ctx.measureText(linea).width > anchoMax) {
      lineas.push(linea);
      linea = '';
    }
    if (caracter !== '\n') linea += caracter;
  }
  if (linea) lineas.push(linea);
  return lineas;
}

function truncar(lineas, max, elipsis = '…') {
  // Limita el numero de lineas visibles y marca el corte con elipsis.
  if (lineas.length <= max) return lineas;
  const recortadas = lineas.slice(0, max);
  recortadas[max - 1] += elipsis;
  return recortadas;
}

// Calcula el layout completo (posiciones en Y) para una escala dada.
// Devuelve { tarjeta, opciones, pie, total } en pixeles de alto.
function medirLayout(ctx, pregunta, e) {
  const pad = 56 * e;
  const anchoTexto = ANCHO - 2 * 80 * e - pad * 2;

  ctx.font = `600 ${36 * e}px ${MONO}`;
  const alturaTag = 44 * e;

  ctx.font = `700 ${52 * e}px ${FUENTE}`;
  const lineasPregunta = truncar(envolver(ctx, pregunta.pregunta, anchoTexto), 4);

  let alturaCodigo = 0;
  if (pregunta.codigo) {
    ctx.font = `400 ${40 * e}px ${MONO}`;
    const lineasCodigo = truncar(envolverCodigo(ctx, pregunta.codigo, anchoTexto - 96 * e), 8);
    alturaCodigo = lineasCodigo.length * 58 * e + 96 * e;
  }

  const alturaCard = alturaTag + lineasPregunta.length * 66 * e + alturaCodigo + pad * 2 + 24 * e;

  const inicioOpciones = 230 * e + alturaCard + 48 * e;
  const altoOpcion = 190 * e;
  const gapOpcion = 32 * e;
  const finOpciones = inicioOpciones + altoOpcion * 4 + gapOpcion * 3;
  const finPie = finOpciones + 48 * e + 2 * 52 * e;

  return { lineasPregunta, alturaCard, inicioOpciones, finOpciones, finPie };
}

// Calcula la escala minima necesaria para que el layout de una pregunta
// quepa en el lienzo 9:16 (usada tambien como diagnostico).
export function escalaDe(pregunta) {
  const canvas = createCanvas(ANCHO, ALTO);
  const ctx = canvas.getContext('2d');
  const layout = medirLayout(ctx, pregunta, 1);
  if (layout.finPie <= ALTO) return 1;
  return Math.max(0.6, ALTO / layout.finPie);
}

export function dibujarPregunta(pregunta) {
  const canvas = createCanvas(ANCHO, ALTO);
  const ctx = canvas.getContext('2d');

  const lenguaje = CATALOGO.find((l) => l.id === pregunta.lenguaje);
  const colorChip = COLOR_CHIP[lenguaje?.color] ?? PALETA.accent;
  const dificultad = DIFICULTADES[pregunta.dificultad]?.label ?? pregunta.dificultad;
  const tipo = TIPOS[pregunta.tipo] ?? pregunta.tipo;
  const etiquetaChip = lenguaje?.nombre ?? pregunta.lenguaje ?? '';

  // Se mide a escala 1 y, si el contenido desborda el alto, se recalcula la
  // escala. Como el texto no escala de forma lineal (los saltos de linea
  // cambian entre tamaños), se afina bajando un 2% hasta que quepa.
  let escala = 1;
  let layout = medirLayout(ctx, pregunta, escala);
  if (layout.finPie > ALTO) {
    escala = Math.max(0.6, (ALTO - 60) / layout.finPie);
    layout = medirLayout(ctx, pregunta, escala);
    while (layout.finPie > ALTO && escala > 0.6) {
      escala = Math.max(0.6, escala * 0.98);
      layout = medirLayout(ctx, pregunta, escala);
    }
  }
  // Guardia: si ni con la escala minima cabe, mejor fallar que recortar.
  if (layout.finPie > ALTO) {
    throw new Error(`La pregunta ${pregunta.id} no cabe ni a escala minima`);
  }
  const e = escala;
  const { lineasPregunta, alturaCard, inicioOpciones } = layout;

  // Fondo de papel con un degradado sutil hacia el papel-2.
  const gradiente = ctx.createLinearGradient(0, 0, 0, ALTO);
  gradiente.addColorStop(0, PALETA.paper);
  gradiente.addColorStop(1, PALETA.paper2);
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Fila de marca: "codelangquiz" + chip del lenguaje.
  const marcaX = 80 * e;
  const marcaY = 150 * e;
  ctx.fillStyle = PALETA.ink;
  ctx.font = `700 ${64 * e}px ${FUENTE}`;
  ctx.fillText('codelang', marcaX, marcaY);
  ctx.fillStyle = PALETA.accent3;
  ctx.fillText('quiz', marcaX + ctx.measureText('codelang').width, marcaY);

  ctx.font = `700 ${34 * e}px ${MONO}`;
  const anchoChip = ctx.measureText(etiquetaChip).width + 56 * e;
  redondeado(ctx, ANCHO - 80 * e - anchoChip, 100 * e, anchoChip, 68 * e, 34 * e);
  ctx.fillStyle = colorChip;
  ctx.fill();
  ctx.fillStyle = PALETA.ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(etiquetaChip, ANCHO - 80 * e - anchoChip + 28 * e, 136 * e);
  ctx.textBaseline = 'alphabetic';

  // Card del enunciado.
  const cardX = 80 * e;
  const cardW = ANCHO - 160 * e;
  const pad = 56 * e;
  const cardY = 230 * e;
  const anchoTexto = cardW - pad * 2;

  ctx.fillStyle = PALETA.paper;
  ctx.shadowColor = 'rgba(47, 58, 77, 0.14)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  redondeado(ctx, cardX, cardY, cardW, alturaCard, 40);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  let y = cardY + pad;
  ctx.fillStyle = PALETA.accent2Deep;
  ctx.font = `600 ${36 * e}px ${MONO}`;
  const tag = `${lenguaje?.nombre ?? pregunta.lenguaje} · ${tipo} · ${dificultad}`;
  ctx.fillText(tag, cardX + pad, y + 34 * e);
  y += 44 * e;

  ctx.fillStyle = PALETA.ink;
  ctx.font = `700 ${52 * e}px ${FUENTE}`;
  for (const linea of lineasPregunta) {
    ctx.fillText(linea, cardX + pad, y + 60 * e);
    y += 66 * e;
  }
  y += 24 * e;

  if (pregunta.codigo) {
    ctx.font = `400 ${40 * e}px ${MONO}`;
    const lineasCodigo = truncar(envolverCodigo(ctx, pregunta.codigo, anchoTexto - 96 * e), 8);
    ctx.fillStyle = PALETA.ink;
    redondeado(ctx, cardX + pad, y, anchoTexto, lineasCodigo.length * 58 * e + 64 * e, 24);
    ctx.fill();
    ctx.fillStyle = PALETA.paper;
    let cy = y + 56 * e;
    for (const linea of lineasCodigo) {
      ctx.fillText(linea, cardX + pad + 32 * e, cy);
      cy += 58 * e;
    }
  }

  // Opciones A-D apiladas, igual que la web.
  const altoOpcion = 190 * e;
  const gapOpcion = 32 * e;
  const letras = ['A', 'B', 'C', 'D'];
  ctx.font = `600 ${38 * e}px ${MONO}`;
  const anchoTextoOpcion = cardW - 132 * e;
  let oy = inicioOpciones;
  for (const letra of letras) {
    ctx.fillStyle = PALETA.paper;
    redondeado(ctx, cardX, oy, cardW, altoOpcion, 28);
    ctx.fill();
    ctx.strokeStyle = PALETA.paper3;
    ctx.lineWidth = 6;
    redondeado(ctx, cardX, oy, cardW, altoOpcion, 28);
    ctx.stroke();

    ctx.fillStyle = PALETA.ink;
    redondeado(ctx, cardX + 40 * e, oy + 40 * e, 116 * e, 116 * e, 20);
    ctx.fill();
    ctx.fillStyle = PALETA.paper;
    ctx.textAlign = 'center';
    ctx.fillText(letra, cardX + 40 * e + 58 * e, oy + 116 * e);
    ctx.textAlign = 'left';

    ctx.fillStyle = PALETA.ink;
    ctx.font = `600 ${38 * e}px ${FUENTE}`;
    const lineasOpcion = truncar(envolver(ctx, pregunta.opciones[letra], anchoTextoOpcion), 2);
    let ty = oy + 76 * e;
    for (const linea of lineasOpcion) {
      ctx.fillText(linea, cardX + 40 * e + 156 * e, ty + 34 * e);
      ty += 52 * e;
    }
    oy += altoOpcion + gapOpcion;
  }

  // Pie con la invitacion a comentar y la web.
  const pieY = oy + 48 * e;
  ctx.fillStyle = PALETA.ink2;
  ctx.font = `600 ${38 * e}px ${FUENTE}`;
  ctx.textAlign = 'center';
  ctx.fillText('¿Cuál es la respuesta? Comenta tu letra', ANCHO / 2, pieY);
  ctx.font = `600 ${34 * e}px ${MONO}`;
  ctx.fillText('codelang-quiz', ANCHO / 2, pieY + 52 * e);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}
