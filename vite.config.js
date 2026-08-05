import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para la app React del quiz.
export default defineConfig({
  plugins: [react()],
  // Configuración de Vitest: entorno jsdom, APIs globales y setup compartido.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
