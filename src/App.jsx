import { BrowserRouter } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import AppRoutes from './routes';

// Componente raiz: proveedor de contexto + enrutado.
export default function App() {
  return (
    <BrowserRouter>
      <QuizProvider>
        <AppRoutes />
      </QuizProvider>
    </BrowserRouter>
  );
}
