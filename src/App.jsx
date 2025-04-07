import { useState } from 'react';
import axios from 'axios';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './App.css';

// Define backend URL (adjust if your backend runs on a different port)
const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [proposalText, setProposalText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!proposalText.trim()) {
      setError('Please enter proposal text.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null); // Clear previous analysis

    try {
      const response = await axios.post(`${BACKEND_URL}/api/analyze`, {
        proposalText,
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.rawResponse || 'Failed to get analysis. Check backend console.';
      setError(`Analysis failed: ${errorMsg}`);
       if (err.response?.data?.rawResponse) {
         console.error("Raw response from backend:", err.response.data.rawResponse);
       }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>AI x DAO Proposal Analyzer</h1>
        <div className="connect-button-container">
          <ConnectButton />
        </div>
      </header>

      <main>
        <div className="input-section">
          <h2>Enter DAO Proposal Text</h2>
          <textarea
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            placeholder="Paste the full text of the DAO proposal here..."
            rows={10}
            disabled={isLoading}
          />
          <button onClick={handleAnalyze} disabled={isLoading || !proposalText.trim()}>
            {isLoading ? 'Analyzing...' : 'Analyze Proposal'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading && <div className="loading-indicator">Loading Analysis...</div>}

        {analysis && !isLoading && (
          <div className="analysis-section">
            <h2>Analysis Results</h2>
            <div className="analysis-card">
              <h3>Summary</h3>
              <p>{analysis.summary || 'No summary provided.'}</p>
            </div>
            <div className="analysis-card">
              <h3>Pros</h3>
              {analysis.pros && analysis.pros.length > 0 ? (
                <ul>
                  {analysis.pros.map((pro, index) => (
                    <li key={`pro-${index}`}>{pro}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific pros identified.</p>
              )}
            </div>
             <div className="analysis-card">
              <h3>Cons</h3>
              {analysis.cons && analysis.cons.length > 0 ? (
                <ul>
                  {analysis.cons.map((con, index) => (
                    <li key={`con-${index}`}>{con}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific cons identified.</p>
              )}
            </div>
             {analysis.rawResponse && ( // Display raw response if parsing failed but raw data exists
                <div className="analysis-card raw-response">
                    <h3>Raw AI Response (Parsing Failed)</h3>
                    <pre>{analysis.rawResponse}</pre>
                </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
