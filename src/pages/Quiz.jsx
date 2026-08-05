import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useQuizContext } from '../context/QuizContext';
import CodeBlock from '../components/ui/CodeBlock';
import Modal from '../components/ui/Modal';
import { CATALOGO } from '../services/questionsService';
import { puntosDe } from '../utils/scoring';

// Pagina de la partida: muestra cada pregunta y las opciones A/B/C/D.
// Al responder muestra feedback y deja que el usuario continúe.
export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  // Funcion del contexto para guardar la partida al terminarla.
  const { registrarPartida } = useQuizContext();
  // Las preguntas y filtros llegan por el estado de la navegacion desde Home.
  const preguntas = location.state?.preguntas ?? [];
  const filtros = location.state?.filtros ?? {};
  // Controla la visibilidad del modal de confirmacion para detener la partida.
  const [confirmarDetencion, setConfirmarDetencion] = useState(false);

  const {
    indice,
    total,
    preguntaActual,
    score,
    aciertos,
    fallos,
    seleccionada,
    bloqueada,
    tiempoRestante,
    tiempoAgotado,
    respuestas,
    responder,
    continuar,
  } = useQuiz(preguntas, () => finalizar());

  // Guarda la partida terminada y pasa a resultados.
  // Se invoca via onTerminar del hook, en la ultima pregunta.
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

  // Detiene la partida conservando el progreso hasta el momento.
  // Se registra como una partida parcial con las preguntas ya respondidas.
  function detener() {
    registrarPartida({
      aciertos,
      fallos,
      puntos: score,
      total: respuestas.length,
      lenguaje: filtros.lenguaje,
      dificultad: filtros.dificultad,
    });
    navigate('/resultados', { state: { filtros } });
  }

  // Si se llega sin preguntas (p. ej. recargando la ruta) se vuelve al inicio.
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

  // Estado residual por si el indice se sale de rango.
  if (!preguntaActual) {
    return <div className="section mono-label">Partida terminada.</div>;
  }

  // Nombre visible del lenguaje de la pregunta actual, si viene anotado.
  const lenguajeActual = CATALOGO.find((l) => l.id === preguntaActual.lenguaje)?.nombre;
  // Aviso visual cuando el tiempo se acaba (ultimos segundos de la pregunta).
  const tiempoUrgente = tiempoRestante <= 5;

  return (
    <div className="quiz">
      {/* Cabecera de la partida: progreso con temporizador y puntos a la derecha */}
      <section className="section quiz__header" aria-label="Progreso">
        <div className="quiz__progreso">
          <span className="mono-label">
            Pregunta {indice + 1} de {total}
          </span>
          <span
            className={tiempoUrgente ? 'quiz__tiempo is-urgente' : 'quiz__tiempo'}
            role="timer"
            aria-label={`Tiempo restante para responder`}
          >
            ⏱ {tiempoRestante}s
          </span>
        </div>
        <span className="quiz__score" aria-label="Score de la partida">
          {score} pt{Math.abs(score) === 1 ? '' : 's'}
        </span>
      </section>

      <section className="section quiz__body">
        {/* Enunciado de la pregunta con su codigo, si tiene */}
        <div className="card quiz__pregunta">
          <span className="mono-label quiz__tag">
            {lenguajeActual ? `${lenguajeActual} · ` : ''}
            {preguntaActual.tipo} · {preguntaActual.dificultad}
          </span>
          <h2 className="quiz__texto">{preguntaActual.pregunta}</h2>
          {preguntaActual.codigo ? (
            <CodeBlock codigo={preguntaActual.codigo} lenguaje={filtros.lenguaje} />
          ) : null}
        </div>

        {/* Opciones A/B/C/D; el orden se baraja por partida y se colorean al responder */}
        <div className="quiz__opciones" role="group" aria-label="Opciones de respuesta">
          {preguntaActual.orden.map((letra) => {
            // La letra correcta se marca solo cuando la pregunta esta bloqueada.
            const esCorrecta = letra === preguntaActual.respuesta;

            // Clases de estado: seleccionada, correcta (verde) o erronea (rojo).
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

        {/* Detener partida: solo permite detener si ya se ha respondido algo */}
        <button
          type="button"
          className="btn btn--mint quiz__detener"
          disabled={respuestas.length === 0}
          onClick={() => setConfirmarDetencion(true)}
        >
          Detener partida
        </button>

        {/* Feedback tras responder: acierto, fallo o tiempo agotado + continuar */}
        {bloqueada ? (
          <div className="quiz__feedback">
            {tiempoAgotado ? (
              // Tiempo agotado: la pregunta se bloqueo sin respuesta y cuenta como fallo.
              <p className="feedback feedback--ko">
                <strong>Se acabó el tiempo.</strong> La correcta era la opción{' '}
                {preguntaActual.respuesta}. {preguntaActual.explicacion}
              </p>
            ) : seleccionada === preguntaActual.respuesta ? (
              // Acierto: muestra los puntos ganados (1/2/3 segun dificultad) y la explicacion.
              <p className="feedback feedback--ok">
                <strong>
                  Acertaste. +{puntosDe(preguntaActual.dificultad)} punto
                  {puntosDe(preguntaActual.dificultad) === 1 ? '' : 's'}.
                </strong>{' '}
                {preguntaActual.explicacion}
              </p>
            ) : (
              // Fallo: indica la opcion correcta y la explicacion.
              <p className="feedback feedback--ko">
                <strong>No acertaste.</strong> La correcta era la opción {preguntaActual.respuesta}.{' '}
                {preguntaActual.explicacion}
              </p>
            )}
            {/* En la ultima pregunta el boton lleva a los resultados */}
            <button type="button" className="btn btn--coral" onClick={continuar}>
              {indice >= total - 1 ? 'Ver resultados' : 'Siguiente'}
            </button>
          </div>
        ) : null}
      </section>

      {/* Confirmacion antes de detener la partida y guardar el progreso */}
      <Modal
        abierto={confirmarDetencion}
        onCerrar={() => setConfirmarDetencion(false)}
        titulo="¿Detener la partida?"
        acciones={
          <>
            <button type="button" className="btn" onClick={() => setConfirmarDetencion(false)}>
              Continuar jugando
            </button>
            <button type="button" className="btn btn--coral" onClick={detener}>
              Detener y guardar
            </button>
          </>
        }
      >
        <p>
          Tu puntuación actual (
          <strong>
            {score} pt{Math.abs(score) === 1 ? '' : 's'}
          </strong>
          ) se guardará y no podrás continuar esta partida.
        </p>
      </Modal>
    </div>
  );
}
