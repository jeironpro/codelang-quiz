// Pie de pagina con la linea de marca (arquetipo Ft8 marquee).
// Es puramente informativo: no contiene enlaces ni acciones.
export default function Footer() {
    return (
        <footer className="footer" aria-label="Pie de pagina">
            {/* Claim de la aplicacion en monoespaciada */}
            <p className="footer__tagline mono-label">Resuelve. Aprende. Repite.</p>
            {/* Nombre de marca */}
            <p className="footer__copy">Codelang Quiz</p>
        </footer>
    );
}
