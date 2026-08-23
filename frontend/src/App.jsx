import { useState } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";

export default function App() {
  const [view, setView] = useState("landing"); // 'landing' | 'upload' | 'results'
  const [diffResult, setDiffResult] = useState(null);
  const [previousDiffResult, setPreviousDiffResult] = useState(null);
  const [submissionContext, setSubmissionContext] = useState({
    prompt: "",
    code: "",
    useAgent: false,
  });

  const handleCheckSuccess = (diff, context) => {
    setDiffResult(diff);
    setPreviousDiffResult(null);
    if (context) {
      setSubmissionContext(context);
    }
    setView("results");
  };

  const handleRetrySuccess = (newDiff) => {
    // Keep the pre-retry diff in previousDiffResult for before/after comparison
    setPreviousDiffResult(diffResult);
    setDiffResult(newDiff);
  };

  const handleStartOver = () => {
    setDiffResult(null);
    setPreviousDiffResult(null);
    setView("upload");
  };

  return (
    <div className="app-container">
      {view === "landing" && (
        <LandingPage onTryItClick={() => setView("upload")} />
      )}
      {view === "upload" && (
        <UploadPage
          onCheckSuccess={handleCheckSuccess}
          initialValues={submissionContext}
        />
      )}
      {view === "results" && (
        <ResultsPage
          diff={diffResult}
          previousDiff={previousDiffResult}
          submissionContext={submissionContext}
          onRetrySuccess={handleRetrySuccess}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
