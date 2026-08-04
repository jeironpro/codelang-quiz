// Indicador de carga mientras se obtienen las preguntas.
export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__ring" aria-hidden="true"></span>
      <span className="spinner__text">{texto}</span>
    </div>
  );
}
