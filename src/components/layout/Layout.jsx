import Navbar from './Navbar';
import Footer from './Footer';

// Estructura de pagina: barra superior, contenido y pie.
// Recibe las paginas como children y las coloca entre Navbar y Footer.
export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            {/* Contenido principal; el id permite saltar a el desde el teclado */}
            <main id="cuerpo">{children}</main>
            <Footer />
        </>
    );
}
