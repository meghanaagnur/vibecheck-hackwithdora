// OverlayCanvas (You + Duchuu)
// Draws boxes from diff.results[].boundingBox onto the extraction screenshot.
// verdict -> color: match=green, position_mismatch|style_mismatch=yellow, missing=red.
export default function OverlayCanvas({ screenshot, results = [] }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img src={screenshot} alt="Rendered output" />
      {/* TODO: absolutely-positioned <div> per result, colored by verdict */}
    </div>
  );
}
