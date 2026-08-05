import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Configuración de ESLint con el set mínimo para JS/JSX en esta app.
export default [
  // Directorios que nunca se revisan.
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    // Reglas aplicadas a todo código fuente JS/JSX.
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      // Conviven código de navegador y de node (tests, configs).
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // La app no usa PropTypes; los tipos se documentan en el propio código.
      'react/prop-types': 'off',
      // Variables sin usar son error, salvo parámetros prefijados con _.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];