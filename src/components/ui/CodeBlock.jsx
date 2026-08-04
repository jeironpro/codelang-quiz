// Muestra un fragmento de codigo con formato simple y seguro.
// El texto se renderiza como contenido plano, nunca via innerHTML.
export default function CodeBlock({ codigo, lenguaje = '' }) {
  if (!codigo) return null;

  return (
    <div className="code-card">
      {lenguaje ? <span className="code-card__lang mono-label">{lenguaje}</span> : null}
      <pre className="code-card__pre">
        <code>{codigo}</code>
      </pre>
    </div>
  );
}
