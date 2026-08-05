import { Link } from 'react-router-dom';

// Pagina de error para rutas no existentes.
// Ofrece un enlace de vuelta al inicio como unica accion.
export default function NotFound() {
    return (
        <div className="home">
            <section className="section">
                <p className="mono-label">404</p>
                <h1 className="hero-title">Esa ruta no existe.</h1>
                <p>La página que buscas no está en esta app.</p>
                <Link to="/" className="btn btn--mint">
                    Volver al inicio
                </Link>
            </section>
        </div>
    );
}
