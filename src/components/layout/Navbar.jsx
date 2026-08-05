import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuizContext } from '../../context/QuizContext';

// Barra de navegacion superior (via N7 brutal slab).
// En moviles los enlaces se pliegan tras un boton hamburguesa.
export default function Navbar() {
  // Score acumulado que se muestra como insignia a la derecha.
  const { score } = useQuizContext();
  // Estado del menu movil: abierto o cerrado.
  const [abierto, setAbierto] = useState(false);

  // Cierra el menu movil al navegar a un enlace.
  function cerrar() {
    setAbierto(false);
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        {/* Marca de la aplicacion, enlaza al inicio */}
        <Link to="/" className="nav__brand" onClick={cerrar}>
          codelang<span className="nav__dot">quiz</span>
        </Link>

        {/* Boton hamburguesa (solo visible en pantallas pequenas); alterna el menu */}
        <button
          type="button"
          className="nav__toggle"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="nav-enlaces"
          onClick={() => setAbierto((v) => !v)}
        >
          <span className="nav__bar" />
          <span className="nav__bar" />
          <span className="nav__bar" />
        </button>

        {/* Enlaces de navegacion; en movil se despliegan con .is-open */}
        <nav
          id="nav-enlaces"
          aria-label="Principal"
          className={abierto ? 'nav__links is-open' : 'nav__links'}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}
            onClick={cerrar}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/resultados"
            className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}
            onClick={cerrar}
          >
            Resultados
          </NavLink>
        </nav>

        {/* Insignia con el score acumulado */}
        <span className="nav__score" aria-label="Score acumulado">
          {score} pt{score === 1 ? '' : 's'}
        </span>
      </div>
    </header>
  );
}
