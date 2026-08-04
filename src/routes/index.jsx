import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Quiz from '../pages/Quiz';
import Resultados from '../pages/Resultados';
import NotFound from '../pages/NotFound';

// Definicion de rutas de la aplicacion.
export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
