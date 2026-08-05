import { useLocation, useNavigate } from 'react-router-dom';
import { useQuizContext } from '../context/QuizContext';

// Pagina de resultados: muestra el score acumulado y el historial de partidas.
export default function Resultados() {
    const location = useLocation();
    const navigate = useNavigate();
    // Filtros de la ultima partida, recibidos por el estado de la navegacion.
    const filtros = location.state?.filtros ?? {};
    // Score acumulado y historial compartidos desde el contexto.
    const { score, historial } = useQuizContext();

    // La partida mas reciente esta al inicio del historial.
    const ultimaPartida = historial[0];
    // Nombre del lenguaje para la etiqueta; por defecto "todos los lenguajes".
    const lenguajeNombre = filtros.lenguaje || 'todos los lenguajes';

    return (
        <div className="resultados">
            {/* Hero de la pagina */}
            <section className="section resultados__hero">
                <p className="eyebrow mono-label">Resultados</p>
                <h1 className="hero-title">Tu rendimiento, de un vistazo.</h1>
            </section>

            {/* Estadisticas resumidas: score acumulado y numero de partidas */}
            <section className="section resultados__stats" aria-label="Estadísticas">
                <div className="card card__tint stat stat--pear">
                    <span className="mono-label">Score acumulado</span>
                    <strong className="stat__num">{score}</strong>
                </div>
                <div className="card card__tint stat stat--cyan">
                    <span className="mono-label">Partidas</span>
                    <strong className="stat__num">{historial.length}</strong>
                </div>
            </section>

            <section className="section" aria-label="Historial de partidas">
                <h2 className="seccion-titulo">Historial</h2>

                {/* Resumen de la ultima partida, si existe */}
                {ultimaPartida ? (
                    <div className="card resultados__ultima">
                        <p className="mono-label">Última partida · {lenguajeNombre}</p>
                        <p className="resultados__resumen">
                            {ultimaPartida.aciertos} aciertos · {ultimaPartida.fallos} fallos ·{' '}
                            {ultimaPartida.puntos} puntos
                        </p>
                    </div>
                ) : (
                    <p className="resultados__vacio">Aún no has jugado ninguna partida.</p>
                )}

                {/* Lista completa del historial (fecha, aciertos y puntos) */}
                {historial.length > 0 ? (
                    <ul className="historial">
                        {historial.map((partida, i) => (
                            <li key={i} className="historial__item">
                                <span className="mono-label historial__fecha">
                                    {new Date(partida.fecha).toLocaleString()}
                                </span>
                                <span className="historial__resumen">
                                    {partida.aciertos}/{partida.total} aciertos
                                </span>
                                <span className="historial__puntos">{partida.puntos} pt</span>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {/* Accion principal: volver al inicio a jugar otra partida */}
                <button type="button" className="btn btn--lg" onClick={() => navigate('/')}>
                    Nueva partida
                </button>
            </section>
        </div>
    );
}
