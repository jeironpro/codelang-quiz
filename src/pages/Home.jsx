import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATALOGO, cargarTodasLasPreguntas, filtrarPreguntas } from '../services/questionsService';
import { DIFICULTADES, TIPOS } from '../utils/constants';

// Pagina de inicio: permite elegir lenguaje, dificultad y tipo antes de jugar.
export default function Home() {
  const navigate = useNavigate();
  const [lenguaje, setLenguaje] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [tipo, setTipo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Carga las preguntas segun los filtros y arranca la partida.
  async function empezar() {
    setCargando(true);
    setError('');
    try {
      const dataset = await cargarTodasLasPreguntas();
      const disponibles = dataset.flatMap((d) =>
        filtrarPreguntas(d, { dificultad, tipo, lenguaje }),
      );

      if (disponibles.length === 0) {
        setError('No hay preguntas que coincidan con esos filtros. Prueba con otros.');
        setCargando(false);
        return;
      }

      navigate('/quiz', {
        state: { preguntas: disponibles, filtros: { lenguaje, dificultad, tipo } },
      });
    } catch {
      setError('No se pudo cargar el catálogo de preguntas.');
      setCargando(false);
    }
  }

  return (
    <div className="home">
      <section className="section home__hero">
        <p className="eyebrow mono-label">Practica con código real</p>
        <h1 className="hero-title">
          Pon a prueba lo que <em>sabes</em> de código.
        </h1>
        <p className="home__lead">
          Elige tu lenguaje y nivel. Resuelve problemáticas de código con opciones de respuesta y
          gana puntos según la dificultad.
        </p>
      </section>

      <section className="section home__config" aria-label="Configuración de la partida">
        <fieldset className="filtro">
          <legend className="mono-label">Lenguaje</legend>
          <div className="filtro__chips">
            <button
              type="button"
              className={!lenguaje ? 'chip is-active' : 'chip'}
              onClick={() => setLenguaje('')}
            >
              Todos
            </button>
            {CATALOGO.map((leng) => (
              <button
                key={leng.id}
                type="button"
                className={
                  lenguaje === leng.id
                    ? `chip chip--${leng.color} is-active`
                    : `chip chip--${leng.color}`
                }
                onClick={() => setLenguaje(leng.id)}
              >
                {leng.nombre}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="filtro">
          <legend className="mono-label">Dificultad</legend>
          <div className="filtro__chips">
            <button
              type="button"
              className={!dificultad ? 'chip is-active' : 'chip'}
              onClick={() => setDificultad('')}
            >
              Cualquiera
            </button>
            {Object.entries(DIFICULTADES).map(([clave, dato]) => (
              <button
                key={clave}
                type="button"
                className={dificultad === clave ? 'chip is-active' : 'chip'}
                onClick={() => setDificultad(clave)}
              >
                {dato.label} · {dato.puntos} pt
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="filtro">
          <legend className="mono-label">Tipo de problema</legend>
          <div className="filtro__chips">
            <button
              type="button"
              className={!tipo ? 'chip is-active' : 'chip'}
              onClick={() => setTipo('')}
            >
              Cualquiera
            </button>
            {Object.entries(TIPOS).map(([clave, label]) => (
              <button
                key={clave}
                type="button"
                className={tipo === clave ? 'chip is-active' : 'chip'}
                onClick={() => setTipo(clave)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {error ? (
          <p className="home__error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="button" className="btn btn--lg" onClick={empezar} disabled={cargando}>
          {cargando ? 'Preparando...' : 'Empezar partida'}
        </button>
      </section>
    </div>
  );
}
