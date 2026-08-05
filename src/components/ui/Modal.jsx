import { useEffect, useRef, useId } from 'react';

// Modal accesible y controlado.
// - Cierra con Escape o al pulsar el fondo oscuro.
// - Enfoca el dialogo al abrir y devuelve el foco al abrirlo.
// - Bloquea el scroll del body mientras esta abierto.
// - Atrapa el foco con Tab dentro del dialogo.
export default function Modal({ abierto, onCerrar, titulo, children }) {
  // Id unico del titulo para el aria-labelledby del dialogo.
  const tituloId = useId();
  // Referencia al dialogo para gestionar el foco.
  const dialogoRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    // Elemento que tenia el foco al abrir; se restaura al cerrar.
    const elementoAnterior = document.activeElement;

    function onKeyDown(evento) {
      if (evento.key === 'Escape') {
        onCerrar();
        return;
      }
      // Trampa de foco: Tab no sale del dialogo.
      if (evento.key === 'Tab') {
        const focoable = dialogoRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focoable.length === 0) return;
        const primero = focoable[0];
        const ultimo = focoable[focoable.length - 1];
        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primero.focus();
        }
      }
    }

    // Bloquea el scroll del fondo mientras el modal este abierto.
    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    dialogoRef.current.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = scrollPrevio;
      // Devuelve el foco al elemento que abrio el modal.
      elementoAnterior.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="modal__overlay" onClick={onCerrar}>
      {/* El dialogo detiene la propagacion para no cerrarse al pulsar dentro */}
      <div
        ref={dialogoRef}
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={tituloId} className="modal__titulo">
          {titulo}
        </h2>
        <div className="modal__texto">{children}</div>
        <div className="modal__acciones">
          <button type="button" className="btn" onClick={onCerrar}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
