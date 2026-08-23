// PromptSuggestions — surfaces diff.promptSuggestions (docs/SCHEMA.md section 3).
// Teaches the user what their prompt under-specified, instead of only silently
// fixing the code via the retry pass.
export default function PromptSuggestions({ suggestions = [] }) {
  if (!suggestions.length) return null;

  return (
    <div className="prompt-suggestions-panel">
      <div className="prompt-suggestions-header">
        <span className="prompt-suggestions-icon">💡</span>
        <h3>Sharpen your prompt</h3>
      </div>
      <p className="prompt-suggestions-lede">
        Your prompt left these unspecified. Add them next time to get it right on
        the first try:
      </p>
      <ul className="prompt-suggestions-list">
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
