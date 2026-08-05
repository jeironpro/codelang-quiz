// Muestra un fragmento de codigo con formato simple y seguro.
// El texto se renderiza como contenido plano, nunca via innerHTML.
// Devuelve null si no hay codigo que mostrar.
export default function CodeBlock({ codigo, lenguaje = '' }) {
  if (!codigo) return null;

  return (
    <div className="code-card">
      {/* Etiqueta del lenguaje, opcional */}
      {lenguaje ? <span className="code-card__lang mono-label">{lenguaje}</span> : null}
      {/* El <pre> preserva saltos de linea y sangrias del codigo */}
      <pre className="code-card__pre">
        <code>{codigo}</code>
      </pre>
    </div>
  );
}
