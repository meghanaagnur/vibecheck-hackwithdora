import { SAMPLE_DIFF, SAMPLE_RETRY_DIFF } from "../lib/sampleFixtures.js";

const DEMO_GALLERY_ITEMS = [
  {
    id: "demo-login-offset",
    title: "Login Form (Offset Mismatch)",
    description: "Submit button is aligned left and has wrong gap; 1 element missing.",
    mismatches: 2,
    total: 4,
    diff: SAMPLE_DIFF,
  },
  {
    id: "demo-login-fixed",
    title: "Login Form (After AI Fix)",
    description: "All elements aligned and centered after single retry pass.",
    mismatches: 0,
    total: 3,
    diff: SAMPLE_RETRY_DIFF,
  },
];

export default function FallbackGallery({ onSelect }) {
  return (
    <div className="fallback-gallery">
      <div className="gallery-header">
        <h4>Validated Demo Fixtures</h4>
      </div>
      <div className="gallery-grid">
        {DEMO_GALLERY_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="gallery-card"
            onClick={() => onSelect(item.diff)}
          >
            <div className="gallery-card-top">
              <span className="gallery-card-title">{item.title}</span>
              <span
                className={`gallery-card-badge ${
                  item.mismatches > 0 ? "badge-mismatch" : "badge-match"
                }`}
              >
                {item.mismatches} {item.mismatches === 1 ? "mismatch" : "mismatches"}
              </span>
            </div>
            <p className="gallery-card-desc">{item.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
