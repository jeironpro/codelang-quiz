import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useQuizContext } from '../context/QuizContext';
import CodeBlock from '../components/ui/CodeBlock';
import { OPCIONES } from '../utils/constants';
import { puntosDe } from '../utils/scoring';

// Pagina de la partida: muestra cada pregunta y las opciones A/B/C/D.
// Al responder muestra feedback y deja que el usuario continúe.
export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { registrarPartida } = useQuizContext();
  const preguntas = location.state?.preguntas ?? [];
  const filtros = location.state?.filtros ?? {};

  const {
    indice,
    total,
    preguntaActual,
    score,
    aciertos,
    fallos,
    seleccionada,
    bloqueada,
    responder,
    continuar,
  } = useQuiz(preguntas, () => finalizar());

  // Guarda la partida terminada y pasa a resultados.
  function finalizar() {
    registrarPartida({
      aciertos,
      fallos,
      puntos: score,
      total: preguntas.length,
      lenguaje: filtros.lenguaje,
      dificultad: filtros.dificultad,
    });
    navigate('/resultados', { state: { filtros } });
  }

  if (!preguntas.length) {
    return (
      <div className="home">
        <section className="section">
          <p className="home__error">Aún no has configurado una partida.</p>
          <button type="button" className="btn" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </section>
      </div>
    );
  }

  if (!preguntaActual) {
    return <div className="section mono-label">Partida terminada.</div>;
  }

  return (
    <div className="quiz">
      <section className="section quiz__header" aria-label="Progreso">
        <span className="mono-label">
          Pregunta {indice + 1} de {total}
        </span>
        <span className="quiz__score" aria-label="Score de la partida">
          {score} pt{Math.abs(score) === 1 ? '' : 's'}
        </span>
      </section>

      <section className="section quiz__body">
        <div className="card quiz__pregunta">
          <span className="mono-label quiz__tag">
            {preguntaActual.tipo} · {preguntaActual.dificultad}
          </span>
          <h2 className="quiz__texto">{preguntaActual.pregunta}</h2>
          {preguntaActual.codigo ? (
            <CodeBlock codigo={preguntaActual.codigo} lenguaje={filtros.lenguaje} />
          ) : null}
        </div>

        <div className="quiz__opciones" role="group" aria-label="Opciones de respuesta">
          {OPCIONES.map((letra) => {
            const esCorrecta = letra === preguntaActual.respuesta;

            let clase = 'opcion';
            if (seleccionada === letra) clase += ' is-selected';
            if (bloqueada && esCorrecta) clase += ' is-correct';
            if (bloqueada && seleccionada === letra && !esCorrecta) {
              clase += ' is-wrong';
            }

            return (
              <button
                key={letra}
                type="button"
                data-letra={letra}
                className={clase}
                disabled={bloqueada}
                onClick={() => responder(letra)}
              >
                <span className="opcion__letra mono-label">{letra}</span>
                <span className="opcion__texto">{preguntaActual.opciones[letra]}</span>
              </button>
            );
          })}
        </div>

        {bloqueada ? (
          <div className="quiz__feedback">
            {seleccionada === preguntaActual.respuesta ? (
              <p className="feedback feedback--ok">
                <strong>
                  Acertaste. +{puntosDe(preguntaActual.dificultad)} punto
                  {puntosDe(preguntaActual.dificultad) === 1 ? '' : 's'}.
                </strong>{' '}
                {preguntaActual.explicacion}
              </p>
            ) : (
              <p className="feedback feedback--ko">
                <strong>No acertaste.</strong> La correcta era la opción {preguntaActual.respuesta}.{' '}
                {preguntaActual.explicacion}
              </p>
            )}
            <button type="button" className="btn btn--coral" onClick={continuar}>
              {indice >= total - 1 ? 'Ver resultados' : 'Siguiente'}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
