// SummaryBanner (You + Duchuu)
// "4 elements checked, 2 mismatches found, 1 fixed after retry" — from diff.summary
// (+ diff.retry.resultAfterRetry when present).
export default function SummaryBanner({ summary, retry }) {
  if (!summary) return null;
  const retryNote = retry?.resultAfterRetry
    ? `, ${summary.mismatches - retry.resultAfterRetry.mismatches} fixed after retry`
    : "";
  return (
    <div>
      {summary.totalChecked} elements checked, {summary.mismatches} mismatches found{retryNote}.
    </div>
  );
}
