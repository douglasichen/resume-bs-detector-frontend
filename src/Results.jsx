import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './Results.css'

function Results() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const MAX_SOURCES = 2;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const apiUrl = import.meta.env.VITE_FETCH_RESULTS_API
        if (!apiUrl) {
          throw new Error('API URL not configured')
        }

        console.log(`[FETCHING RESULTS] ${apiUrl}?id=${id}`);
        const response = await fetch(`${apiUrl}?id=${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        })

        const jsonResponse = await response.json()

        console.log(`[RESPONSE] ${JSON.stringify({
          ...jsonResponse,
          resumePdf: null,
        }, null, 2)}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const result = jsonResponse;
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResults()
    }
  }, [id])

  if (loading) {
    return (
      <div className="results-page">
        <div className="loading">Loading results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-page">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  if (!data?.result) {
    return (
      <div className="results-page">
        <div className="error">No results found</div>
      </div>
    )
  }

  const { result } = data

  return (
    <div className="results-page">
      <div className="results-header">
        <h1>Resume Analysis Results</h1>
        <p className="results-subtitle">Submission ID: {id}</p>
      </div>

      <div className="results-container">
        <h2>Verification Results</h2>
        
        <div className="results-summary">
          <div className="summary-item">
            <span className="summary-label">Email:</span>
            <span className="summary-value">{result.email}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Claims Analyzed:</span>
            <span className="summary-value">{result.results?.length || 0}</span>
          </div>
        </div>

        <div className="results-list">
          {result.results?.map((item, index) => (
            <div key={index} className="result-item">
              <div className="result-header">
                <span className="result-number">Claim #{index + 1}</span>
                <span className={`result-status ${getStatusClass(item.verification)}`}>
                  {getStatusLabel(item.verification)}
                </span>
              </div>

              <div className="result-question">
                <strong>Question:</strong>
                <p>{item.question}</p>
              </div>

              <div className="result-answer">
                <strong>Answer:</strong>
                <p>{item.answer}</p>
              </div>

              <div className="result-sources">
                <strong>Top Sources ({item.results?.length || 0}):</strong>
                <div className="sources-list">
                  {item.results?.slice(0, MAX_SOURCES).map((source, idx) => (
                    <div key={idx} className="source-item">
                      <div className="source-header">
                        <span className="source-score">
                          Score: {(source.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        {source.url}
                      </a>
                    </div>
                  ))}
                </div>
                {item.results?.length > MAX_SOURCES && (
                  <details className="more-sources">
                    <summary>Show {item.results.length - MAX_SOURCES} more sources</summary>
                    <div className="sources-list">
                      {item.results.slice(MAX_SOURCES).map((source, idx) => (
                        <div key={idx} className="source-item">
                          <div className="source-header">
                            <span className="source-score">
                              Score: {(source.score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="source-link"
                          >
                            {source.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper function to determine status class based on verification field
function getStatusClass(verification) {
  const normalized = verification.toLowerCase()
  if (normalized === 'verified') return 'verified'
  if (normalized === 'unsure') return 'unsure'
  if (normalized === 'bullsh*t') return 'bullshit'
  return 'unsure' // default fallback
}

// Helper function to get status label
function getStatusLabel(verification) {
  if (verification === 'Verified') return '✓ Verified'
  if (verification === 'Unsure') return '? Unsure'
  if (verification === 'Bullsh*t') return '✗ Bullsh*t'
  return '? Unsure' // default fallback
}

export default Results
