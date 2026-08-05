import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATALOGO, cargarTodasLasPreguntas, filtrarPreguntas } from '../services/questionsService';
import { DIFICULTADES, TIPOS } from '../utils/constants';

// Pagina de inicio: permite elegir lenguaje, dificultad y tipo antes de jugar.
export default function Home() {
    const navigate = useNavigate();
    // Filtros seleccionados; vacio significa "todos".
    const [lenguaje, setLenguaje] = useState('');
    const [dificultad, setDificultad] = useState('');
    const [tipo, setTipo] = useState('');
    // Estado de la carga para deshabilitar el boton y mostrar el mensaje.
    const [cargando, setCargando] = useState(false);
    // Mensaje de error visible si la carga o los filtros fallan.
    const [error, setError] = useState('');

    // Carga las preguntas segun los filtros y arranca la partida.
    async function empezar() {
        setCargando(true);
        setError('');
        try {
            // Carga todo el catalogo y filtra por los criterios elegidos.
            const dataset = await cargarTodasLasPreguntas();
            // Cada pregunta recuerda su lenguaje para mostrarlo durante la partida.
            const disponibles = dataset.flatMap((d) =>
                filtrarPreguntas(d, { dificultad, tipo, lenguaje }).map((pregunta) => ({
                    ...pregunta,
                    lenguaje: d.lenguaje,
                })),
            );

            // Sin resultados avisa y no navega.
            if (disponibles.length === 0) {
                setError('No hay preguntas que coincidan con esos filtros. Prueba con otros.');
                setCargando(false);
                return;
            }

            // Lleva las preguntas filtradas y los filtros a la pagina del quiz.
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
            {/* Hero: presentacion de la app */}
            <section className="section home__hero">
                <p className="eyebrow mono-label">Practica con código real</p>
                <h1 className="hero-title">
                    Pon a prueba lo que <em>sabes</em> de código.
                </h1>
                <p className="home__lead">
                    Elige tu lenguaje y nivel. Resuelve problemáticas de código con opciones de
                    respuesta y gana puntos según la dificultad.
                </p>
            </section>

            {/* Configuracion de la partida: tres grupos de filtros */}
            <section className="section home__config" aria-label="Configuración de la partida">
                {/* Filtro de lenguaje: un chip por lenguaje del catalogo */}
                <fieldset className="filtro">
                    <legend className="mono-label">Lenguaje</legend>
                    <div className="filtro__chips">
                        {/* Chip "Todos" limpia el filtro de lenguaje */}
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

                {/* Filtro de dificultad: facil, media o dificil con sus puntos */}
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

                {/* Filtro de tipo de problema: output, sintaxis, bug o concepto */}
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

                {/* Mensaje de error (solo si algo fallo) */}
                {error ? (
                    <p className="home__error" role="alert">
                        {error}
                    </p>
                ) : null}

                {/* Boton que lanza la partida con los filtros elegidos */}
                <button type="button" className="btn btn--lg" onClick={empezar} disabled={cargando}>
                    {cargando ? 'Preparando...' : 'Empezar partida'}
                </button>
            </section>
        </div>
    );
}
