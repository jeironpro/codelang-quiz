import { Link, NavLink } from 'react-router-dom';
import { useQuizContext } from '../../context/QuizContext';

// Barra de navegacion superior (via N7 brutal slab).
export default function Navbar() {
  const { score } = useQuizContext();

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand">
          codelang<span className="nav__dot">quiz</span>
        </Link>
        <nav aria-label="Principal" className="nav__links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/resultados"
            className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}
          >
            Resultados
          </NavLink>
        </nav>
        <span className="nav__score" aria-label="Score acumulado">
          {score} pt{score === 1 ? '' : 's'}
        </span>
      </div>
    </header>
  );
}
