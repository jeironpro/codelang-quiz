import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test de la app: renderiza la barra de navegacion.
// Verifica que la raiz arranca sin errores y muestra la marca.
describe('App', () => {
    it('muestra la marca de la aplicacion en la barra de navegacion', () => {
        render(<App />);
        expect(screen.getByRole('link', { name: /codelang quiz/i })).toBeInTheDocument();
    });
});
