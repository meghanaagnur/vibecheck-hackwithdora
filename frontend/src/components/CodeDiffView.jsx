import { diffLines } from "diff";

// CodeDiffView — a unified, GitHub-PR-style line diff of the code before vs after
// the AI retry pass. Complements the visual overlay diff with the literal code
// change, since "what actually changed in the code" is a different, equally useful
// question than "what changed on screen."
export default function CodeDiffView({ before, after }) {
  if (!before || !after) return null;

  const parts = diffLines(before, after);

  return (
    <div className="code-diff-view">
      <div className="code-diff-header">
        <span className="code-diff-icon">{"</>"}</span>
        <h3>Code Diff</h3>
        <span className="code-diff-sub">What the AI actually changed</span>
      </div>
      <pre className="code-diff-body">
        {parts.map((part, i) => {
          const lines = part.value.replace(/\n$/, "").split("\n");
          const cls = part.added ? "diff-line-add" : part.removed ? "diff-line-del" : "diff-line-ctx";
          const marker = part.added ? "+" : part.removed ? "-" : " ";
          return lines.map((line, j) => (
            <div className={`code-diff-line ${cls}`} key={`${i}-${j}`}>
              <span className="code-diff-marker">{marker}</span>
              <span className="code-diff-text">{line}</span>
            </div>
          ));
        })}
      </pre>
    </div>
  );
}
