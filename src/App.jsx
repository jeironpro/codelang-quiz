import { BrowserRouter } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import AppRoutes from './routes';

// Componente raiz: proveedor de contexto + enrutado.
// El BrowserRouter habilita el enrutado por historial y el QuizProvider
// comparte el score y el historial de partidas con toda la aplicacion.
export default function App() {
    return (
        <BrowserRouter>
            <QuizProvider>
                <AppRoutes />
            </QuizProvider>
        </BrowserRouter>
    );
}
