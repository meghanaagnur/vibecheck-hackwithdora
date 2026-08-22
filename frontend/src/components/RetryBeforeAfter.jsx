// RetryBeforeAfter (You + Duchuu) — Day 2, hours 34-40
// Side-by-side before/after view once diff.retry is present.
export default function RetryBeforeAfter({ retry }) {
  if (!retry?.attempted) return null;
  return (
    <div>
      {/* TODO: two OverlayCanvas instances side by side, before vs after */}
    </div>
  );
}
