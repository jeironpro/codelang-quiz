import { describe, it, expect } from 'vitest';
import { construirCaption } from './caption';

// Tests del texto de publicacion de los reels: etiquetas visibles, el aviso
// para comentar y el recorte de preguntas muy largas.

describe('construirCaption', () => {
  it('incluye lenguaje, tipo, dificultad y la invitacion a comentar', () => {
    const caption = construirCaption({
      lenguaje: 'javascript',
      tipo: 'output',
      dificultad: 'facil',
      pregunta: '¿Qué imprime este código?',
    });

    expect(caption).toContain('JavaScript');
    expect(caption).toContain('¿Qué imprime?');
    expect(caption).toContain('Fácil');
    expect(caption).toContain('Comenta tu letra');
  });

  it('recorta las preguntas demasiado largas', () => {
    const preguntaLarga = 'p'.repeat(200);
    const caption = construirCaption({
      lenguaje: 'python',
      tipo: 'concepto',
      dificultad: 'media',
      pregunta: preguntaLarga,
    });

    // La pregunta aparece recortada con elipsis y nunca completa.
    expect(caption).not.toContain(preguntaLarga);
    expect(caption).toContain('…');
  });
});
