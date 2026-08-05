import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/components.css';

// Punto de entrada de la aplicacion React.
// Monta el componente raiz en el elemento #root del index.html y
// envuelve la app en StrictMode para detectar efectos impuros en desarrollo.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
