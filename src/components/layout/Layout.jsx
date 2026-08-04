import Navbar from './Navbar';
import Footer from './Footer';

// Estructura de pagina: barra superior, contenido y pie.
export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main id="cuerpo">{children}</main>
      <Footer />
    </>
  );
}
